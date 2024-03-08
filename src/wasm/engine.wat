(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    (memory $memory 1)
    (data (i32.const 0) "\nunknown[],internal|printtemplatebindterminal()")
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

    (func $sizeof.Nothing (result i32)
        i32.const 4
        return
    )
    (func $Nothing.type (result i32)
        i32.const 0
        return
    )
    (func $Nothing.constructor (result i32)
        (local $nothing i32)
        ;; allocate
        call $sizeof.Nothing
        call $mem.allocate
        local.set $nothing
        ;; nothing.type = Nothing.type
        local.get $nothing
        call $Nothing.type
        call $something.type.set
        ;; return
        local.get $nothing
        return
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
        call $Internal.targets.length
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
        ;; allocate
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

    (func $sizeof.Template.header (result i32)
        i32.const 8
        return
    )
    (func $sizeof.Template (param $length i32) (result i32)
        call $sizeof.Template.header
        local.get $length
        i32.const 4
        i32.mul
        i32.add
        return
    )
    (func $Template.type (result i32)
        i32.const 8
        return
    )
    (func $Template.length.offset (result i32)
        i32.const 4
        return
    )
    (func $Template.length (param $template i32) (result i32)
        local.get $template
        call $Template.length.offset
        i32.add
        i32.load
        return
    )
    (func $Template.length.set (param $template i32) (param $length i32)
        local.get $template
        call $Template.length.offset
        i32.add
        local.get $length
        i32.store
    )
    (func $Template.first.offset (result i32)
        call $sizeof.Template.header
        return
    )
    (func $Template.first (param $template i32) (result i32)
        local.get $template
        call $Template.first.offset
        i32.add
        return
    )
    (func $Template.constructor (param $length i32) (result i32)
        (local $template i32)
        ;; allocate
        local.get $length
        call $sizeof.Template
        call $mem.allocate
        local.set $template
        ;; template.type = Template.type
        local.get $template
        call $Template.type
        call $something.type.set
        ;; array.length = length
        local.get $template
        local.get $length
        call $Template.length.set

        ;; return
        local.get $template
        return
    )

    (func $sizeof.Terminal (result i32)
        i32.const 4
        return
    )
    (func $Terminal.type (result i32)
        i32.const 6
        return
    )
    (func $Terminal.constructor (result i32)
        (local $terminal i32)
        ;; allocate
        call $sizeof.Terminal
        call $mem.allocate
        local.set $terminal
        ;; terminal.type = Terminal.type
        local.get $terminal
        call $Terminal.type
        call $something.type.set
        ;; return
        local.get $terminal
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
    (func $Array.set (param $array i32) (param $i i32) (param $value i32)
        local.get $array
        call $Array.first
        local.get $i
        i32.const 4
        i32.mul
        i32.add
        local.get $value
        i32.store
    )
    (func $Array.get (param $array i32) (param $i i32) (result i32)
        local.get $array
        call $Array.first
        local.get $i
        i32.const 4
        i32.mul
        i32.add
        i32.load
        return
    )
    (func $Array.copy (param $from i32) (param $to i32) (param $count i32)
        (local $last i32)

        local.get $from
        local.get $count
        i32.const 4
        i32.mul
        i32.add
        local.set $last

        (block $break (loop $continue
            local.get $from
            local.get $last
            i32.ge_u
            br_if $break

            local.get $to
            local.get $from
            i32.load
            i32.store

            local.get $from
            i32.const 4
            i32.add
            local.set $from

            local.get $to
            i32.const 4
            i32.add
            local.set $to

            br $continue
        ))
    )
    (func $Array.print (param $array i32)
        (local $current i32)
        (local $last i32)

        local.get $array
        call $Array.first
        local.tee $current
        local.get $array
        call $Array.length
        i32.const 4
        i32.mul
        i32.add
        local.set $last

        i32.const 8 ;; [
        i32.const 1
        call $print.ascii

        (block $break (loop $continue
            local.get $current
            local.get $last
            i32.ge_u
            br_if $break

            local.get $current
            i32.load
            call $print.something

            local.get $current
            i32.const 4
            i32.add
            local.set $current

            local.get $current
            local.get $last
            i32.ge_u
            br_if $break

            i32.const 10 ;; ,
            i32.const 1
            call $print.ascii

            br $continue
        ))

        i32.const 9 ;; ]
        i32.const 1
        call $print.ascii

        i32.const 0 ;; newline
        i32.const 1
        call $print.ascii
    )

    (func $sizeof.external.Print (result i32)
        i32.const 4
        return
    )
    (func $external.Print.type (result i32)
        i32.const 7
        return
    )
    (func $external.Print.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Print
        call $mem.allocate
        local.set $external
        ;; external.type = external.Print.type
        local.get $external
        call $external.Print.type
        call $something.type.set
        ;; return
        local.get $external
        return
    )

    (func $sizeof.external.Bind (result i32)
        i32.const 4
        return
    )
    (func $external.Bind.type (result i32)
        i32.const 9
        return
    )
    (func $external.Bind.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Bind
        call $mem.allocate
        local.set $external
        ;; external.type = external.Bind.type
        local.get $external
        call $external.Bind.type
        call $something.type.set
        ;; return
        local.get $external
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
        (block $print_terminal
            local.get $something
            call $something.type
            call $Terminal.type
            i32.ne
            br_if $print_terminal

            i32.const 37
            i32.const 8
            call $print.ascii

            return
        )
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

            local.get $something
            call $print.Internal

            return
        )
        (block $print_template
            local.get $something
            call $something.type
            call $Template.type
            i32.ne
            br_if $print_template

            i32.const 25
            i32.const 8
            call $print.ascii

            return
        )
        (block $print_bind
            local.get $something
            call $something.type
            call $external.Bind.type
            i32.ne
            br_if $print_bind

            i32.const 33
            i32.const 4
            call $print.ascii

            return
        )
        (block $print_print
            local.get $something
            call $something.type
            call $external.Print.type
            i32.ne
            br_if $print_print

            i32.const 20
            i32.const 5
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

                i32.const 10 ;; ,
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
    (func $print.Internal (param $internal i32)
        (local $target i32)
        (local $length i32)

        local.get $internal
        call $Internal.targets.length
        local.set $length
        local.get $internal
        call $Internal.targets.first
        local.set $target

        ;; print "internal"
        i32.const 11
        i32.const 8
        call $print.ascii
        ;; print "["
        i32.const 8
        i32.const 1
        call $print.ascii

        (block $break (loop $continue
            local.get $length
            i32.const 0
            i32.eq
            br_if $break

            local.get $target
            i32.load
            call $print.int32

            local.get $target
            i32.const 4
            i32.add
            local.set $target

            local.get $length
            i32.const 1
            i32.sub
            local.set $length

            (block $comma
                local.get $length
                i32.const 0
                i32.eq
                br_if $comma

                i32.const 10
                i32.const 1
                call $print.ascii
            )

            br $continue
        ))

        ;; print "]"
        i32.const 9
        i32.const 1
        call $print.ascii

        i32.const 45 ;; (
        i32.const 1
        call $print.ascii

        local.get $internal
        call $Internal.storage.length
        call $print.int32

        i32.const 46 ;; )
        i32.const 1
        call $print.ascii
    )

    (func $machine.step.internal.get
        (param $target i32)
        (param $storage_first i32) (param $storage_length i32)
        (param $buffer_first i32) (param $buffer_length i32)
        (param $internal i32) (param $nothing i32)
        (result i32)
        (local $j i32)

        (block $process_current
            local.get $target
            i32.const 0
            i32.ne
            br_if $process_current

            ;; i32.const 42
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $internal
            return
        )
        (block $process_storage
            local.get $target
            i32.const 1
            i32.sub
            local.tee $j
            local.get $storage_length
            i32.ge_u
            br_if $process_storage

            ;; i32.const 43
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $storage_first
            local.get $j
            i32.const 4
            i32.mul
            i32.add
            i32.load
            return
        )

        ;; i32.const 44
        ;; call $print.int32
        ;; i32.const 0
        ;; i32.const 1
        ;; call $print.ascii

        local.get $j
        local.get $storage_length
        i32.sub
        i32.const 1 ;; compensate for missing 0 from buffer
        i32.add
        local.set $j

        (block $check_overflow
            local.get $j
            local.get $buffer_length
            i32.lt_u
            br_if $check_overflow

            local.get $nothing
            return
        )

        local.get $buffer_first
        local.get $j
        i32.const 4
        i32.mul
        i32.add
        i32.load
        return
    )
    (func $machine.step.internal (param $internal i32) (param $buffer i32) (param $nothing i32) (result i32)
        (local $buffer_length i32)
        (local $buffer_first i32)
        (local $next_buffer i32)
        (local $next_buffer_i i32)
        (local $targets_length i32)
        (local $targets_i i32)
        (local $targets_last i32)
        (local $storage_length i32)
        (local $storage_first i32)
        (local $target i32)
        ;; (local $x i32)

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
        call $Array.length
        local.set $buffer_length
        local.get $buffer
        call $Array.first
        local.set $buffer_first

        (loop $continue (block $break
            ;; if targets_i >= targets_last then break
            local.get $targets_i
            local.get $targets_last
            i32.ge_u
            br_if $break

            local.get $targets_i
            i32.load
            local.set $target

            local.get $next_buffer_i
                local.get $target
                local.get $storage_first
                local.get $storage_length
                local.get $buffer_first
                local.get $buffer_length
                local.get $internal
                local.get $nothing
                call $machine.step.internal.get
                ;; local.tee $x
                ;; call $print.int32
                ;; local.get $x
                ;; call $print
                ;; local.get $x
            i32.store


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

            br $continue
        ))

        local.get $next_buffer
        return
    )
    (func $machine.step.print (param $buffer i32) (param $nothing i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)

        ;; do printing
        local.get $buffer
        i32.const 2
        call $Array.get
        call $print

        ;; alloc next buffer
        i32.const 2
        call $Array.constructor
        local.set $next_buffer

        ;; save next
        local.get $buffer
        i32.const 1
        call $Array.get
        local.set $next

        ;; fill next buffer
        local.get $next_buffer
        i32.const 0
        local.get $next
        call $Array.set

        local.get $next_buffer
        i32.const 1
        local.get $next
        call $Array.set

        ;; return
        local.get $next_buffer
        return
    )
    (func $machine.step.bind.prepare_internal (param $buffer i32) (result i32)
        (local $target i32)
        (local $target_length i32)
        (local $storage_length i32)
        (local $internal i32)

        ;; get target template
        local.get $buffer
        i32.const 2
        call $Array.get
        local.set $target

        (block $check_for_template
            local.get $target
            call $something.type
            call $Template.type
            i32.eq
            br_if $check_for_template

            i32.const 0
            return
        )

        local.get $target
        call $Template.length
        local.set $target_length

        ;; storage = buffer.length - 3
        local.get $buffer
        call $Array.length
        i32.const 3
        i32.sub
        local.set $storage_length

        ;; Internal(targets.length, storage.length + 1)
        local.get $target_length
        local.get $storage_length
        i32.const 1
        i32.add
        call $Internal.constructor
        local.set $internal

        ;; copy template targets -> internal targets
        local.get $target
        call $Template.first
        local.get $internal
        call $Internal.targets.first
        local.get $target_length
        call $Array.copy

        ;; copy buffer -> internal storage
        local.get $buffer
        call $Array.first
        i32.const 12 ;; 3*4
        i32.add
        local.get $internal
        call $Internal.storage.first
        local.get $storage_length
        call $Array.copy

        ;; storage[last] = internal
        local.get $internal
        call $Internal.storage.first
        local.get $storage_length
        i32.const 4
        i32.mul
        i32.add
        local.get $internal
        i32.store

        ;; return
        local.get $internal
        return
    )
    (func $machine.step.bind.get (param $first i32) (param $length i32) (param $i i32) (param $nothing i32) (param $internal i32) (result i32)
        ;; local.get $i
        ;; call $print.int32
        ;; i32.const 0
        ;; i32.const 1
        ;; call $print.ascii

        (block $check_current
            local.get $i
            i32.const 1
            i32.ge_u
            br_if $check_current

            ;; i32.const 1001
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $nothing
            return
        )
        (block $check_empty
            local.get $i
            local.get $length
            i32.le_u
            br_if $check_empty

            ;; i32.const 1002
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $nothing
            return
        )
        (block $check_internal
            local.get $i
            local.get $length
            i32.lt_u
            br_if $check_internal

            ;; i32.const 1003
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $internal
            return
        )

        ;; i32.const 1004
        ;; call $print.int32
        ;; i32.const 0
        ;; i32.const 1
        ;; call $print.ascii

        local.get $first
        local.get $i
        i32.const 4
        i32.mul
        i32.add
        i32.load
        return
    )
    (func $machine.step.bind (param $buffer i32) (param $nothing i32) (result i32)
        (local $buffer_length i32)
        (local $buffer_first i32)
        (local $internal i32)
        (local $template i32)
        (local $template_length i32)
        (local $template_current i32)
        (local $template_last i32)
        (local $result i32)
        (local $index i32)
        (local $result_current i32)
        ;; (local $x i32)

        ;; get buffer info
        local.get $buffer
        call $Array.length
        i32.const 2
        i32.sub
        local.set $buffer_length

        ;; local.get $buffer_length
        ;; call $print.int32
        ;; i32.const 0
        ;; i32.const 1
        ;; call $print.ascii

        local.get $buffer
        call $Array.first
        i32.const 8
        i32.add
        local.set $buffer_first

        ;; get internal
        local.get $buffer
        call $machine.step.bind.prepare_internal
        local.set $internal

        ;; get template info
        local.get $buffer
        i32.const 1
        call $Array.get
        local.tee $template ;; @todo: check for template
        call $Template.length
        local.set $template_length
        local.get $template
        call $Template.first
        local.tee $template_current
        local.get $template_length
        i32.const 4
        i32.mul
        i32.add
        local.set $template_last

        ;; allocate result
        local.get $template_length
        call $Array.constructor
        local.tee $result
        call $Array.first
        local.set $result_current

        ;; todo: continuation
        (block $break (loop $continue
            ;; if template_current >= template_last then break
            local.get $template_current
            local.get $template_last
            i32.ge_u
            br_if $break

            local.get $template_current
            i32.load
            local.set $index

            ;; buffer[index] -> result_current
            local.get $result_current

            local.get $buffer_first
            local.get $buffer_length
            local.get $index
            local.get $nothing
            local.get $internal
            call $machine.step.bind.get
            ;; local.tee $x
            i32.store

            ;; local.get $x
            ;; call $print.int32
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii
            ;; ;; call $print

            ;; ++
            local.get $template_current
            i32.const 4
            i32.add
            local.set $template_current

            local.get $result_current
            i32.const 4
            i32.add
            local.set $result_current

            br $continue
        ))

        local.get $result
        return
    )
    (func $machine.step.first (param $first i32) (param $type i32) (param $buffer i32) (param $nothing i32) (result i32)
        ;; local.get $first
        ;; call $print

        (block $check_terminal
            local.get $type
            call $Terminal.type
            i32.ne
            br_if $check_terminal

            ;; do nothing
            i32.const 0
            return
        )
        (block $check_internal
            local.get $type
            call $Internal.type
            i32.ne
            br_if $check_internal

            ;; ;; print "internal"
            ;; i32.const 11
            ;; i32.const 8
            ;; call $print.ascii
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii

            local.get $first
            local.get $buffer
            local.get $nothing
            call $machine.step.internal

            return
        )
        (block $check_print
            local.get $type
            call $external.Print.type
            i32.ne
            br_if $check_print

            ;; ;; print "print"
            ;; i32.const 20
            ;; i32.const 5
            ;; call $print.ascii
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii
            ;; @todo

            local.get $buffer
            local.get $nothing
            call $machine.step.print
            return
        )
        (block $check_bind
            local.get $type
            call $external.Bind.type
            i32.ne
            br_if $check_bind

            ;; ;; print "bind"
            ;; i32.const 33
            ;; i32.const 4
            ;; call $print.ascii
            ;; i32.const 0
            ;; i32.const 1
            ;; call $print.ascii
            ;; @todo

            local.get $buffer
            local.get $nothing
            call $machine.step.bind
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
    (func $machine.step (param $buffer i32) (param $nothing i32) (result i32)
        (local $first i32)
        (local $type i32)

        ;; local.get $buffer
        ;; call $Array.print

        ;; local.get $buffer
        ;; call $print.int32
        ;; i32.const 0
        ;; i32.const 1
        ;; call $print.ascii

        local.get $buffer
        call $Array.first
        i32.load
        local.tee $first
        call $something.type
        local.set $type

        local.get $first
        local.get $type
        local.get $buffer
        local.get $nothing
        call $machine.step.first

        ;; free buffer
        local.get $buffer
        call $mem.free

        return
    )

    (func $run (result i32)
        (local $nothing i32)
        (local $buffer i32)
        (local $internal i32)
        (local $val i32)
        (local $val2 i32)

        call $Nothing.constructor
        local.set $nothing

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

        ;; internal.targets[0] = 3
        local.get $internal
        call $Internal.targets.first
        i32.const 3
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
        local.get $nothing
        call $machine.step

        call $Array.first
        i32.load
        local.get $nothing
        i32.eq
        call $print.int32

        i32.const 0
        return
    )

    (export "memory" (memory $memory))
    (export "run" (func $run))
    (export "Nothing" (func $Nothing.constructor))
    (export "Terminal" (func $Terminal.constructor))
    (export "Int32" (func $Int32.constructor))
    (export "ASCII" (func $ASCII.constructor))
    (export "List" (func $List.constructor))
    (export "Internal" (func $Internal.constructor))
    (export "Internal.targets" (func $Internal.targets.first))
    (export "Internal.storage" (func $Internal.storage.first))
    (export "Template" (func $Template.constructor))
    (export "Template.first" (func $Template.first))
    (export "Array" (func $Array.constructor))
    (export "Array.set" (func $Array.set))
    (export "Print" (func $external.Print.constructor))
    (export "Bind" (func $external.Bind.constructor))
    (export "step" (func $machine.step))
    (export "_print" (func $print))
)
