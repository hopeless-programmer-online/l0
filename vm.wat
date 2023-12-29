(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    (memory $memory 1)
    (data (i32.const 0) "unknown")
    (data (i32.const 1024)  "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 1028)  "\F4\Ff\00\00") ;; begin.next = &end (65524)
    (data (i32.const 1032)  "\00\00\00\00") ;; begin.size = 0
    (data (i32.const 65524) "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 65528) "\F4\Ff\00\00") ;; begin.next = &end (65524)
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

            local.get $node
            call $mem.node.size
            call $print.int32

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
        call $mem.node.next.set
        ;; new.next.prev = new
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

        ;; allocate data
        local.get $length
        call $mem.allocate
        local.set $data

        ;; allocate ascii
        local.get $length
        local.get $data
        call $ASCII.constructor
        local.set $ascii

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

    (func $sizeof.ASCII (result i32)
        i32.const 12
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
        i32.const 8
        return
    )
    (func $ASCII.data (param $ascii i32) (result i32)
        local.get $ascii
        call $ASCII.data.offset
        i32.add
        i32.load
        return
    )
    (func $ASCII.data.set (param $ascii i32) (param $data i32)
        local.get $ascii
        call $ASCII.data.offset
        i32.add
        local.get $data
        i32.store
    )
    (func $ASCII.constructor (param $length i32) (param $data i32) (result i32)
        (local $ascii i32)
        ;; allocate
        call $sizeof.ASCII
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
        ;; ascii.data = data
        local.get $ascii
        local.get $data
        call $ASCII.data.set
        ;; return ascii
        local.get $ascii
        return
    )

    (func $print (param $something i32)
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
    )

    (func $run (result i32)
        i32.const 12342
        call $Int32.constructor
        call $Int32.ASCII
        call $print

        i32.const 0
        return
    )

    (export "memory" (memory $memory))
    (export "run" (func $run))
)
