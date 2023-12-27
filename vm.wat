(module
    (import "print" "number" (func $print.number (param i32)))

    (memory $memory 1)
    (data (i32.const 0)     "\00\00\00\00") ;; begin.prev = &begin (0)
    (data (i32.const 4)     "\FF\F4\00\00") ;; begin.next = &end (65524)
    (data (i32.const 8)     "\00\00\00\00") ;; begin.size = 0
    (data (i32.const 65524) "\00\00\00\00") ;; begin.prev = &begin (0)
    (data (i32.const 65528) "\FF\F4\00\00") ;; begin.next = &end (65524)
    (data (i32.const 65532) "\00\00\00\00") ;; begin.size = 0

    (func $memory_size (result i32)
        i32.const 65536
        memory.size
        i32.mul
        return
    )
    (func $heap.begin (result i32)
        i32.const 0
        return
    )
    (func $heap.end (result i32)
        i32.const 65524
        return
    )
    (func $sizeof.node (result i32)
        i32.const 12
        return
    )
    (func $mem.node.prev (param $node i32) (result i32)
        local.get $node
        i32.load
        return
    )
    (func $mem.node.prev.set (param $node i32) (param $prev i32)
        local.get $node
        local.get $prev
        i32.store
    )
    (func $mem.node.next (param $node i32) (result i32)
        local.get $node
        i32.const 4
        i32.add
        i32.load
        return
    )
    (func $mem.node.next.set (param $node i32) (param $next i32)
        local.get $node
        i32.const 4
        i32.add
        local.get $next
        i32.store
    )
    (func $mem.node.size (param $node i32) (result i32)
        local.get $node
        i32.const 8
        i32.add
        i32.load
        return
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
        i32.store
        ;; new.next = next
        local.get $new
        i32.const 4
        i32.add
        local.get $node
        call $mem.node.next
        local.tee $next
        i32.store
        ;; new.next.prev = new
        local.get $next
        local.get $new
        i32.store
        ;; new.size = size
        local.get $new
        i32.const 8
        i32.add
        local.get $size
        i32.store
        ;; node.next = new
        local.get $node
        i32.const 4
        local.get $new
        i32.store

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
            call $print.number

            return
        )
    )

    (func $run (result i32)
        i32.const 42
        call $Int32.constructor
        call $print

        ;; i32.const 42
        ;; call $print.number

        i32.const 0
        return
    )

    (export "memory" (memory $memory))
    (export "run" (func $run))
)
