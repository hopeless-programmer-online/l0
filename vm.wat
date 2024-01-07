(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    (memory $memory 1)
    (data (i32.const 0) "\nunknown[],internal|")
    (data (i32.const 1024)  "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 1028)  "\F4\FF\00\00") ;; begin.next = &end (65524)
    (data (i32.const 1032)  "\00\00\00\00") ;; begin.size = 0
    (data (i32.const 65524) "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 65528) "\F4\FF\00\00") ;; begin.next = &end (65524)
    (data (i32.const 65532) "\00\00\00\00") ;; begin.size = 0

    (func $memory_size (result i32)
        i32.const 65536
        memory.size
        i32.mul
        return
    )
    (func $heap.begin (result i32)
        i32.const 1024
        return
    )
    (func $heap.end (result i32)
        i32.const 65524
        return
    )
    (func $heap.print
        (local $node i32)
        call $heap.begin
        local.set $node

        (block $end_loop (loop $print_node
            local.get $node
            call $heap.end
            i32.eq
            br_if $end_loop

            local.get $node
            call $mem.node.mem
            call $print.int32

            ;; print |
            i32.const 19
            i32.const 1
            call $print.ascii

            local.get $node
            call $mem.node.size
            call $print.int32

            ;; print \n
            i32.const 0
            i32.const 1
            call $print.ascii

            local.get $node
            call $mem.node.next
            local.set $node

            br $print_node
        ))
    )
    (func $sizeof.node (result i32)
        i32.const 12
        return
    )
    (func $mem.node.prev.offset (result i32)
        i32.const 0
    )
    (func $mem.node.prev (param $node i32) (result i32)
        local.get $node
        call $mem.node.prev.offset
        i32.add
        i32.load
        return
    )
    (func $mem.node.prev.set (param $node i32) (param $prev i32)
        local.get $node
        call $mem.node.prev.offset
        i32.add
        local.get $prev
        i32.store
    )
    (func $mem.node.next.offset (result i32)
        i32.const 4
    )
    (func $mem.node.next (param $node i32) (result i32)
        local.get $node
        call $mem.node.next.offset
        i32.add
        i32.load
        return
    )
    (func $mem.node.next.set (param $node i32) (param $next i32)
        local.get $node
        call $mem.node.next.offset
        i32.add
        local.get $next
        i32.store
    )
    (func $mem.node.size.offset (result i32)
        i32.const 8
    )
    (func $mem.node.size (param $node i32) (result i32)
        local.get $node
        call $mem.node.size.offset
        i32.add
        i32.load
        return
    )
    (func $mem.node.size.set (param $node i32) (param $size i32)
        local.get $node
        call $mem.node.size.offset
        i32.add
        local.get $size
        i32.store
    )
    (func $mem.node.capacity (param $node i32) (result i32)
        (local $capacity i32)
        ;; node.next - node - sizeof(node) * 2 - node.size
        local.get $node
        call $mem.node.next
        local.get $node
        i32.sub
            ;; sizeof(node) * 2
            call $sizeof.node
            i32.const 2
            i32.mul
        i32.sub
        local.get $node
        call $mem.node.size
        i32.sub
        local.tee $capacity
        ;; if capacity < 0 then return 0
        i32.const 0
        i32.lt_s
        (if (then
            i32.const 0
            return
        ))
        local.get $capacity
        return
    )
    (func $mem.node.split (param $node i32) (param $size i32) (result i32)
        (local $new i32)
        (local $next i32)
        ;; node + sizeof(node) + node.size
        local.get $node
        call $sizeof.node
        i32.add
        local.get $node
        call $mem.node.size
        i32.add
        local.set $new

        ;; new.prev = node
        local.get $new
        local.get $node
        call $mem.node.prev.set
        ;; new.next = next
        local.get $new
        local.get $node
        call $mem.node.next
        local.tee $next
        call $mem.node.next.set
        ;; next.prev = new
        local.get $next
        local.get $new
        call $mem.node.prev.set
        ;; new.size = size
        local.get $new
        local.get $size
        call $mem.node.size.set
        ;; node.next = new
        local.get $node
        local.get $new
        call $mem.node.next.set

        ;; return new
        local.get $new
        return
    )
    (func $mem.node.mem (param $node i32) (result i32)
        local.get $node
        call $sizeof.node
        i32.add
        return
    )
    (func $mem.node (param $mem i32) (result i32)
        local.get $mem
        call $sizeof.node
        i32.sub
        return
    )
    (func $mem.allocate (param $size i32) (result i32)
        (local $node i32)

        call $heap.begin
        local.set $node

        (loop $iterate_nodes (block $break_nodes
            ;; if node == heap.end then break
            local.get $node
            call $heap.end
            i32.eq
            br_if $break_nodes

            (block $try_split
                ;; if size > node.capacity then break
                local.get $size
                local.get $node
                call $mem.node.capacity
                i32.gt_u
                br_if $try_split

                ;; return node.mem
                local.get $node
                local.get $size
                call $mem.node.split
                call $mem.node.mem
                return
            )

            local.get $node
            call $mem.node.next
            local.set $node

            br $iterate_nodes
        ))

        i32.const 0
        return
    )
    (func $mem.free (param $mem i32)
        (local $node i32)
        local.get $mem
        call $mem.node
        local.set $node
        ;; node.next.prev = node.prev
        local.get $node
        call $mem.node.next
        local.get $node
        call $mem.node.prev
        call $mem.node.prev.set
        ;; node.prev.next = node.next
        local.get $node
        call $mem.node.prev
        local.get $node
        call $mem.node.next
        call $mem.node.next.set
    )

    (func $something.type (param $something i32) (result i32)
        local.get $something
        i32.load
        return
    )
    (func $something.type.set (param $something i32) (param $type i32)
        local.get $something
        local.get $type
        i32.store
    )

    (func $sizeof.Int32 (result i32)
        i32.const 8
        return
    )
    (func $Int32.type (result i32)
        i32.const 2
        return
    )
    (func $Int32.value (param $int32 i32) (result i32)
        local.get $int32
        i32.const 4
        i32.add
        i32.load
        return
    )
    (func $Int32.value.set (param $int32 i32) (param $value i32)
        local.get $int32
        i32.const 4
        i32.add
        local.get $value
        i32.store
    )
    (func $Int32.constructor (param $value i32) (result i32)
        (local $int32 i32)
        ;; allocate
        call $sizeof.Int32
        call $mem.allocate
        local.set $int32
        ;; int32.type = Int32.type
        local.get $int32
        call $Int32.type
        call $something.type.set
        ;; int32.value = value
        local.get $int32
        local.get $value
        call $Int32.value.set
        ;; return int32
        local.get $int32
        return
    )
    (func $Int32.ASCII (param $int32 i32) (result i32)
        (local $value i32)
        (local $den i32)
        (local $length i32)
        (local $data i32)
        (local $ascii i32)

        local.get $int32
        call $Int32.value
        local.set $value

        ;; look for minus
        (local.set $length (i32.const 10))
        (block $scan_minus
            local.get $value
            i32.const 0
            i32.ge_s
            br_if $scan_minus

            (local.set $length (i32.const 11))
            i32.const 0
            local.get $value
            i32.sub
            local.set $value
        )

        ;; scan for value length
        (local.set $den (i32.const 1000000000))
        (block $break_digit (loop $scan_digit
            local.get $value
            local.get $den
            i32.ge_s
            br_if $break_digit

            ;; den /= 10
            local.get $den
            i32.const 10
            i32.div_s
            local.set $den

            ;; length -= 1
            local.get $length
            i32.const 1
            i32.sub
            local.set $length

            br $scan_digit
        ))

        ;; if length < 1 then length = 1
        (block $zero
            local.get $length
            i32.const 0
            i32.gt_s
            br_if $zero

            i32.const 1
            local.set $length
        )

        ;; create ascii
        local.get $length
        call $ASCII.constructor
        local.set $ascii

        ;; get ascii.data
        local.get $ascii
        call $ASCII.data
        local.set $data

        ;; add minus, reuse length as index
        (block $add_minus
            local.get $int32
            call $Int32.value
            i32.const 0
            i32.ge_s
            br_if $add_minus

            local.get $data
            i32.const 45 ;; '-' = 45
            i32.store

            local.get $data
            i32.const 1
            i32.add
            local.set $data
        )

        ;; (local.set $den (i32.const 1000000000))
        (loop $fill_digits
            ;; data[i] = value / den + 48 ('0' = 48)
            local.get $data
            ;; erase single byte
            local.get $data
            i32.load
            i32.const 0xFFFFFF00
            i32.and
            ;; value / den + 48
            local.get $value
            local.get $den
            i32.div_u
            i32.const 48
            i32.add
            i32.or
            i32.store

            ;; value = value % den
            local.get $value
            local.get $den
            i32.rem_s
            local.set $value

            local.get $data
            i32.const 1
            i32.add
            local.set $data

            local.get $den
            i32.const 10
            i32.div_s
            local.tee $den
            i32.const 0
            i32.gt_s

            br_if $fill_digits
        )

        local.get $ascii
        return
    )

    (func $sizeof.ASCII.header (result i32)
        i32.const 8
        return
    )
    (func $ASCII.type (result i32)
        i32.const 3
        return
    )
    (func $ASCII.length.offset (result i32)
        i32.const 4
        return
    )
    (func $ASCII.length (param $ascii i32) (result i32)
        local.get $ascii
        call $ASCII.length.offset
        i32.add
        i32.load
        return
    )
    (func $ASCII.length.set (param $ascii i32) (param $length i32)
        local.get $ascii
        call $ASCII.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $ASCII.data.offset (result i32)
        call $sizeof.ASCII.header
        return
    )
    (func $ASCII.data (param $ascii i32) (result i32)
        local.get $ascii
        call $ASCII.data.offset
        i32.add
        return
    )
    (func $ASCII.constructor (param $length i32) (result i32)
        (local $ascii i32)
        ;; mem.allocate( sizeof.ASCII.header + length )
        call $sizeof.ASCII.header
        local.get $length
        i32.add
        call $mem.allocate
        local.set $ascii
        ;; ascii.type = ASCII.type
        local.get $ascii
        call $ASCII.type
        call $something.type.set
        ;; ascii.value = value
        local.get $ascii
        local.get $length
        call $ASCII.length.set
        ;; return ascii
        local.get $ascii
        return
    )

    (func $sizeof.List.header (result i32)
        i32.const 16
        return
    )
    (func $List.type (result i32)
        i32.const 4
        return
    )
    (func $List.first.offset (result i32)
        i32.const 4
        return
    )
    (func $List.first (param $list i32) (result i32)
        local.get $list
        call $List.first.offset
        i32.add
        i32.load
        return
    )
    (func $List.first.set (param $list i32) (param $first i32)
        local.get $list
        call $List.first.offset
        i32.add
        local.get $first
        i32.store
    )
    (func $List.length.offset (result i32)
        i32.const 8
        return
    )
    (func $List.length (param $list i32) (result i32)
        local.get $list
        call $List.length.offset
        i32.add
        i32.load
        return
    )
    (func $List.length.set (param $list i32) (param $length i32)
        local.get $list
        call $List.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $List.capacity.offset (result i32)
        i32.const 12
        return
    )
    (func $List.capacity (param $list i32) (result i32)
        local.get $list
        call $List.capacity.offset
        i32.add
        i32.load
        return
    )
    (func $List.capacity.set (param $list i32) (param $capacity i32)
        local.get $list
        call $List.capacity.offset
        i32.add
        local.get $capacity
        i32.store
    )
    (func $List.constructor (param $length i32) (param $capacity i32) (result i32)
        (local $list i32)
        ;; allocate list
        call $sizeof.List.header
        call $mem.allocate
        local.set $list
        ;; list.type = List.type
        local.get $list
        call $List.type
        call $something.type.set
        ;; list.first = mem.allocate(capacity * 4)
        local.get $list
        local.get $capacity
        i32.const 4
        i32.mul
        call $mem.allocate
        call $List.first.set
        ;; list.length = length
        local.get $list
        local.get $length
        call $List.length.set
        ;; list.capacity = capacity
        local.get $list
        local.get $capacity
        call $List.capacity.set
        ;; return
        local.get $list
        return
    )
    (func $List.get (param $list i32) (param $i i32) (result i32)
        ;; return [list.first + i * 4]
        local.get $list
        call $List.first
        local.get $i
        i32.const 4
        i32.mul
        i32.add
        i32.load
        return
    )
    (func $List.set (param $list i32) (param $i i32) (param $element i32)
        ;; [list.first + i * 4] = element
        local.get $list
        call $List.first
        local.get $i
        i32.const 4
        i32.mul
        i32.add
        local.get $element
        i32.store
    )

    (func $sizeof.Internal.header (result i32)
        i32.const 12
        return
    )
    (func $sizeof.Internal (param $targets_length i32) (param $storage_length i32) (result i32)
        ;; mem.allocate( sizeof.Internal.header + targets_length * 4 + storage_length * 4 )
        call $sizeof.Internal.header
        local.get $targets_length
        i32.const 4
        i32.mul
        i32.add
        local.get $storage_length
        i32.const 4
        i32.mul
        i32.add
        return
    )
    (func $Internal.type (result i32)
        i32.const 5
        return
    )
    (func $Internal.targets.length.offset (result i32)
        i32.const 4
        return
    )
    (func $Internal.targets.length (param $internal i32) (result i32)
        local.get $internal
        call $Internal.targets.length.offset
        i32.add
        i32.load
        return
    )
    (func $Internal.targets.length.set (param $internal i32) (param $length i32)
        local.get $internal
        call $Internal.targets.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $Internal.targets.first.offset (result i32)
        call $sizeof.Internal.header
        return
    )
    (func $Internal.targets.first (param $internal i32) (result i32)
        local.get $internal
        call $Internal.targets.first.offset
        i32.add
        return
    )
    (func $Internal.storage.length.offset (result i32)
        i32.const 8
        return
    )
    (func $Internal.storage.length (param $internal i32) (result i32)
        local.get $internal
        call $Internal.storage.length.offset
        i32.add
        i32.load
        return
    )
    (func $Internal.storage.length.set (param $internal i32) (param $length i32)
        local.get $internal
        call $Internal.storage.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $Internal.storage.first.offset (param $internal i32) (result i32)
        call $Internal.targets.first.offset
        local.get $internal
        call $Internal.storage.length
        i32.const 4
        i32.mul
        i32.add
        return
    )
    (func $Internal.storage.first (param $internal i32) (result i32)
        local.get $internal
        local.get $internal
        call $Internal.storage.first.offset
        i32.add
        return
    )
    (func $Internal.constructor (param $targets_length i32) (param $storage_length i32) (result i32)
        (local $internal i32)
        local.get $targets_length
        local.get $storage_length
        call $sizeof.Internal
        call $mem.allocate
        local.set $internal
        ;; internal.type = List.type
        local.get $internal
        call $Internal.type
        call $something.type.set
        ;; internal.targets.length = targets_length
        local.get $internal
        local.get $targets_length
        call $Internal.targets.length.set
        ;; internal.storage.length = storage_length
        local.get $internal
        local.get $storage_length
        call $Internal.storage.length.set
        ;; return
        local.get $internal
        return
    )

    (func $sizeof.Array.header (result i32)
        i32.const 4
        return
    )
    (func $sizeof.Array (param $length i32) (result i32)
        call $sizeof.Array.header
        local.get $length
        i32.const 4
        i32.mul
        i32.add
        return
    )
    (func $Array.length.offset (result i32)
        i32.const 0
        return
    )
    (func $Array.length (param $array i32) (result i32)
        local.get $array
        call $Array.length.offset
        i32.add
        i32.load
        return
    )
    (func $Array.length.set (param $array i32) (param $length i32)
        local.get $array
        call $Array.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $Array.first.offset (result i32)
        call $sizeof.Array.header
        return
    )
    (func $Array.first (param $array i32) (result i32)
        local.get $array
        call $Array.first.offset
        i32.add
        return
    )
    (func $Array.constructor (param $length i32) (result i32)
        (local $array i32)
        ;; allocate
        local.get $length
        call $sizeof.Array
        call $mem.allocate
        local.set $array
        ;; array.length = length
        local.get $array
        local.get $length
        call $Array.length.set
        ;; return
        local.get $array
        return
    )

    (func $print (param $something i32)
        local.get $something
        call $print.something

        i32.const 0
        i32.const 1
        call $print.ascii
    )
    (func $print.something (param $something i32)
        (block $print_int32
            ;; if something.type != Int32.type then break
            local.get $something
            call $something.type
            call $Int32.type
            i32.ne
            br_if $print_int32

            local.get $something
            call $Int32.value
            call $print.int32

            return
        )
        (block $print_ascii
            local.get $something
            call $something.type
            call $ASCII.type
            i32.ne
            br_if $print_ascii

            local.get $something
            call $ASCII.data
            local.get $something
            call $ASCII.length
            call $print.ascii

            return
        )
        (block $print_list
            local.get $something
            call $something.type
            call $List.type
            i32.ne
            br_if $print_list

            local.get $something
            call $print.List

            return
        )
        (block $print_internal
            local.get $something
            call $something.type
            call $Internal.type
            i32.ne
            br_if $print_internal

            i32.const 11
            i32.const 8
            call $print.ascii

            return
        )

        i32.const 1
        i32.const 7
        call $print.ascii
    )
    (func $print.List (param $list i32)
        (local $i i32)
        (local $length i32)

        i32.const 8 ;; [
        i32.const 1
        call $print.ascii

        local.get $list
        call $List.length
        local.set $length
        (block $check_first
            local.get $length
            i32.const 0
            i32.le_u
            br_if $check_first

            local.get $list
            i32.const 0
            call $List.get
            call $print.something

            i32.const 1
            local.set $i
            (loop $print_content (block $break_print
                local.get $i
                local.get $length
                i32.ge_u
                br_if $break_print

                i32.const 10 ;; [
                i32.const 1
                call $print.ascii

                local.get $list
                local.get $i
                call $List.get
                call $print.something

                ;; ++i
                local.get $i
                i32.const 1
                i32.add
                local.set $i

                br $print_content
            ))
        )

        i32.const 9 ;; ]
        i32.const 1
        call $print.ascii
    )

    (func $machine.step.internal (param $internal i32) (param $buffer i32) (result i32)
        (local $buffer_first i32)
        (local $next_buffer i32)
        (local $next_buffer_i i32)
        (local $targets_length i32)
        (local $targets_i i32)
        (local $targets_last i32)
        (local $storage_length i32)
        (local $storage_first i32)
        (local $j i32)
        (local $target i32)

        ;; allocate next buffer
        local.get $internal
        call $Internal.targets.length
        local.tee $targets_length
        call $Array.constructor
        local.tee $next_buffer
        call $Array.first
        local.set $next_buffer_i
        ;; save variables
        local.get $internal
        call $Internal.targets.first
        local.tee $targets_i
        local.get $targets_length
        i32.const 4
        i32.mul
        i32.add
        local.set $targets_last
        local.get $internal
        call $Internal.storage.length
        local.set $storage_length
        local.get $internal
        call $Internal.storage.first
        local.set $storage_first
        local.get $buffer
        call $Array.first
        local.set $buffer_first

        (loop $iterate_targets (block $break_targets
            ;; if targets_i >= targets_last then break
            local.get $targets_i
            local.get $targets_last
            i32.ge_u
            br_if $break_targets

            local.get $targets_i
            i32.load
            local.set $target

            (block $check_target
                (block $process_current
                    local.get $target
                    i32.const 0
                    i32.ne
                    br_if $process_current

                    i32.const 42
                    call $print.int32
                    i32.const 0
                    i32.const 1
                    call $print.ascii

                    local.get $next_buffer_i
                    local.get $internal
                    i32.store

                    br $check_target
                )
                (block $process_storage
                    local.get $target
                    i32.const 1
                    i32.sub
                    local.tee $j
                    local.get $storage_length
                    i32.ge_u
                    br_if $process_storage

                    i32.const 43
                    call $print.int32
                    i32.const 0
                    i32.const 1
                    call $print.ascii

                    local.get $next_buffer_i
                        local.get $storage_first
                        local.get $j
                        i32.const 4
                        i32.mul
                        i32.add
                        i32.load
                    i32.store

                    br $check_target
                )

                i32.const 44
                call $print.int32
                i32.const 0
                i32.const 1
                call $print.ascii

                local.get $j
                local.get $storage_length
                i32.sub
                i32.const 1
                i32.add
                local.set $j

                ;; @todo: check for buffer overflow
                local.get $next_buffer_i
                    local.get $buffer_first
                    local.get $j
                    i32.const 4
                    i32.mul
                    i32.add
                    i32.load
                i32.store
            )

            ;; targets_i += 4
            local.get $targets_i
            i32.const 4
            i32.add
            local.set $targets_i

            ;; next_buffer_i += 4
            local.get $next_buffer_i
            i32.const 4
            i32.add
            local.set $next_buffer_i

            br $iterate_targets
        ))

        local.get $next_buffer
        return
    )
    (func $machine.step (param $buffer i32) (result i32)
        (local $first i32)

        local.get $buffer
        call $Array.first
        local.set $first

        ;; check for internal
        (block $check_internal
            local.get $first
            i32.load
            call $something.type
            call $Internal.type
            i32.ne
            br_if $check_internal

            ;; print "internal"
            i32.const 11
            i32.const 8
            call $print.ascii
            i32.const 0
            i32.const 1
            call $print.ascii

            local.get $first
            i32.load
            local.get $buffer
            call $machine.step.internal
            return
        )

        ;; print "unknown"
        i32.const 1
        i32.const 7
        call $print.ascii
        i32.const 0
        i32.const 1
        call $print.ascii

        ;; error
        i32.const 0
        return
    )

    (func $run (result i32)
        (local $buffer i32)
        (local $internal i32)
        (local $val i32)
        (local $val2 i32)

        i32.const 123
        call $Int32.constructor
        local.set $val

        i32.const 321
        call $Int32.constructor
        local.set $val2

        i32.const 2
        call $Array.constructor
        local.set $buffer

        i32.const 1
        i32.const 1
        call $Internal.constructor
        local.set $internal

        ;; internal.targets[0] = 2
        local.get $internal
        call $Internal.targets.first
        i32.const 2
        i32.store

        ;; internal.storage[0] = val
        local.get $internal
        call $Internal.storage.first
        local.get $val
        i32.store

        ;; buffer[0] = internal
        local.get $buffer
        call $Array.first
        local.get $internal
        i32.store

        ;; buffer[1] = val2
        local.get $buffer
        call $Array.first
        i32.const 4
        i32.add
        local.get $val2
        i32.store

        local.get $buffer
        call $machine.step
        call $Array.first
        i32.load
        local.get $val2
        i32.eq
        call $print.int32

        i32.const 0
        return
    )

    (export "memory" (memory $memory))
    (export "run" (func $run))
)
