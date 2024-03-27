(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    ;; (global $print (import "global" "print") (mut i32))

    (memory $memory 10)
    ;; { memory mapping
        ;; text
        (data (i32.const 0) "\n")      (; 0 + 1 = 1 ;)  (func $write.newline (call $print.ascii (i32.const 0) (i32.const 1)))
        (data (i32.const 1) "ERROR")   (; 1 + 5 = 6 ;)  (func $write.ERROR   (call $print.ascii (i32.const 1) (i32.const 5)))
        (data (i32.const 6) "unknown") (; 6 + 7 = 13 ;) (func $write.unknown (call $print.ascii (i32.const 1) (i32.const 5)))
        ;; globals
        (func $global.nothing.address  (result i32) i32.const 768 return) (func $global.nothing (result i32) call $global.nothing.address i32.load return)
        (func $global.terminal.address (result i32) i32.const 772 return) (func $global.terminal (result i32) call $global.terminal.address i32.load return)
        (func $global.external.address (result i32) i32.const 776 return) (func $global.external (result i32) call $global.external.address i32.load return)
        (func $global.print.address    (result i32) i32.const 780 return) (func $global.print (result i32) call $global.print.address i32.load return)
        ;; heap
        (func $heap.begin (result i32) i32.const 1024)
        (func $heap.end   (result i32) i32.const 655348) ;; 10×65K - 12
    ;; }

    ;; { types
        (func $type.Nothing           (result i32) i32.const 0 return)
        (func $type.Terminal          (result i32) i32.const 1 return)

        (func $type.External          (result i32) i32.const 2 return)
        (func $type.Internal          (result i32) i32.const 3 return)
        (func $type.Template          (result i32) i32.const 4 return)
        (func $type.Bind              (result i32) i32.const 5 return)
        (func $type.Print             (result i32) i32.const 6 return)
        (func $type.Type              (result i32) i32.const 7 return)

        (func $type.Add               (result i32) i32.const 8 return)
        (func $type.Sub               (result i32) i32.const 9 return)
        (func $type.Mul               (result i32) i32.const 10 return)
        (func $type.Div               (result i32) i32.const 11 return)

        (func $type.Equal             (result i32) i32.const 12 return)
        (func $type.NotEqual          (result i32) i32.const 13 return)
        (func $type.Greater           (result i32) i32.const 14 return)
        (func $type.GreaterEqual      (result i32) i32.const 15 return)
        (func $type.Less              (result i32) i32.const 16 return)
        (func $type.LessEqual         (result i32) i32.const 17 return)

        (func $type.If                (result i32) i32.const 18 return)

        (func $type.Internal.instance (result i32) i32.const 19 return)
        (func $type.Template.instance (result i32) i32.const 20 return)
        (func $type.Int32.instance    (result i32) i32.const 21 return)
        (func $type.ASCII.instance    (result i32) i32.const 22 return)
    ;; }

    (table 100 funcref)
    ;; { tables
        ;; { step
            (func $virtual.step.offset (result i32) i32.const 0)
            (elem (i32.const 0)
                $virtual.step.error ;; Nothing
                $Terminal.step      ;; Terminal
                $virtual.step.error ;; External
                $virtual.step.error ;; Internal
                $virtual.step.error ;; Template
                $virtual.step.error ;; Bind
                $Print.step         ;; Print
                $virtual.step.error ;; Type
                $virtual.step.error ;; Add
                $virtual.step.error ;; Sub
                $virtual.step.error ;; Mul
                $virtual.step.error ;; Div
                $virtual.step.error ;; Equal
                $virtual.step.error ;; NotEqual
                $virtual.step.error ;; Greater
                $virtual.step.error ;; GreaterEqual
                $virtual.step.error ;; Less
                $virtual.step.error ;; LessEqual
                $virtual.step.error ;; If
                $virtual.step.error ;; Internal.instance
                $virtual.step.error ;; Template.instance
                $virtual.step.error ;; Int32.instance
                $virtual.step.error ;; ASCII.instance
            )
            (type $virtual.step (func (param $something i32) (param $buffer i32) (result i32)))
            (func $virtual.step (param $something i32) (param $buffer i32) (result i32)
                local.get $something
                local.get $buffer

                local.get $something
                call $something.type
                call $virtual.step.offset
                i32.add
                call_indirect (type $virtual.step)
                return
            )
            (func $virtual.step.error (param $something i32) (param $buffer i32) (result i32)
                call $write.ERROR
                i32.const 0
                return
            )
        ;; }

        ;; { print
            (func $virtual.print.offset (result i32) i32.const 23)
            (elem (i32.const 23)
                $virtual.print.unknown ;; Nothing
                $virtual.print.unknown ;; Terminal
                $virtual.print.unknown ;; External
                $virtual.print.unknown ;; Internal
                $virtual.print.unknown ;; Template
                $virtual.print.unknown ;; Bind
                $virtual.print.unknown ;; Print
                $virtual.print.unknown ;; Type
                $virtual.print.unknown ;; Add
                $virtual.print.unknown ;; Sub
                $virtual.print.unknown ;; Mul
                $virtual.print.unknown ;; Div
                $virtual.print.unknown ;; Equal
                $virtual.print.unknown ;; NotEqual
                $virtual.print.unknown ;; Greater
                $virtual.print.unknown ;; GreaterEqual
                $virtual.print.unknown ;; Less
                $virtual.print.unknown ;; LessEqual
                $virtual.print.unknown ;; If
                $virtual.print.unknown ;; Internal.instance
                $virtual.print.unknown ;; Template.instance
                $virtual.print.unknown ;; Int32.instance
                $virtual.print.unknown ;; ASCII.instance
            )
            (type $virtual.print (func (param $something i32)))
            (func $virtual.print (param $something i32)
                local.get $something

                local.get $something
                call $something.type
                call $virtual.print.offset
                i32.add
                call_indirect (type $virtual.print)

                call $write.newline
                return
            )
            (func $virtual.print.unknown (param $something i32)
                call $write.unknown
                return
            )
        ;; }
    ;; }

    ;; { heap
        (func $heap.init
            call $heap.begin
            call $heap.begin
            call $mem.node.prev.set

            call $heap.begin
            call $heap.end
            call $mem.node.next.set

            call $heap.begin
            i32.const 0
            call $mem.node.size.set

            call $heap.end
            call $heap.begin
            call $mem.node.prev.set

            call $heap.end
            call $heap.end
            call $mem.node.next.set

            call $heap.end
            i32.const 0
            call $mem.node.size.set
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

                ;; print |
                i32.const 19
                i32.const 1
                call $print.ascii

                local.get $node
                call $mem.node.capacity
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
        (func $heap.available (result i32)
            (local $node i32)
            (local $available i32)

            i32.const 0
            local.set $available

            call $heap.begin
            local.set $node

            (loop $continue (block $break
                local.get $node
                call $heap.end
                i32.eq
                br_if $break

                local.get $node
                call $mem.node.capacity
                local.get $available
                i32.add
                local.set $available

                local.get $node
                call $mem.node.next
                local.set $node

                br $continue
            ))

            local.get $available
            return
        )
        (func $heap.max (result i32)
            (local $node i32)
            (local $capacity i32)
            (local $max i32)

            i32.const 0
            local.set $max

            call $heap.begin
            local.set $node

            (loop $continue (block $break
                local.get $node
                call $heap.end
                i32.eq
                br_if $break

                (block $check_max
                    local.get $node
                    call $mem.node.capacity
                    local.tee $capacity
                    local.get $max
                    i32.le_u
                    br_if $check_max

                    local.get $capacity
                    local.set $max
                )

                local.get $node
                call $mem.node.next
                local.set $node

                br $continue
            ))

            local.get $max
            return
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

            ;; OOM
            i32.const 80
            i32.const 13
            call $print.ascii
            i32.const 0
            i32.const 1
            call $print.ascii

            ;; allocation size
            local.get $size
            call $print.int32
            i32.const 0
            i32.const 1
            call $print.ascii

            ;; allocation size
            call $heap.available
            call $print.int32
            i32.const 0
            i32.const 1
            call $print.ascii

            ;; allocation size
            call $heap.max
            call $print.int32
            i32.const 0
            i32.const 1
            call $print.ascii

            call $heap.print

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
    ;; }

    ;; { Array
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
        (; (func $Array.print (param $array i32)
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
                call $virtual.print

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
        ) ;)
    ;; }

    ;; { Something
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
    ;; }

    ;; { Nothing
        (func $sizeof.Nothing (result i32)
            i32.const 4
            return
        )
        (func $Nothing.constructor (result i32)
            (local $nothing i32)
            ;; allocate
            call $sizeof.Nothing
            call $mem.allocate
            local.set $nothing
            ;; nothing.type = type.Nothing
            local.get $nothing
            call $type.Nothing
            call $something.type.set
            ;; return
            local.get $nothing
            return
        )
    ;; }

    ;; { Terminal
        (func $sizeof.Terminal (result i32)
            i32.const 4
            return
        )
        (func $Terminal.constructor (result i32)
            (local $terminal i32)
            ;; allocate
            call $sizeof.Terminal
            call $mem.allocate
            local.set $terminal
            ;; terminal.type = type.Terminal
            local.get $terminal
            call $type.Terminal
            call $something.type.set
            ;; return
            local.get $terminal
            return
        )
        (func $Terminal.step (param $something i32) (param $buffer i32) (result i32)
            i32.const 0
            return
        )
    ;; }

    ;; { External
        (func $sizeof.External (result i32)
            i32.const 4
            return
        )
        (func $External.constructor (result i32)
            (local $external i32)
            ;; allocate
            call $sizeof.External
            call $mem.allocate
            local.set $external
            ;; external.type = type.External
            local.get $external
            call $type.External
            call $something.type.set
            ;; return
            local.get $external
            return
        )
    ;; }

    ;; { Print
        (func $sizeof.Print (result i32)
            i32.const 4
            return
        )
        (func $Print.constructor (result i32)
            (local $print i32)
            ;; allocate
            call $sizeof.Print
            call $mem.allocate
            local.set $print
            ;; print.type = type.Print
            local.get $print
            call $type.Print
            call $something.type.set
            ;; return
            local.get $print
            return
        )
        (func $Print.step (param $something i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)

            ;; do printing
            local.get $buffer
            i32.const 2
            call $Array.get
            call $virtual.print

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
    ;; }

    (func $init
        call $heap.init

        call $global.nothing.address
        call $Nothing.constructor
        i32.store

        call $global.terminal.address
        call $Terminal.constructor
        i32.store

        call $global.external.address
        call $External.constructor
        i32.store

        call $global.print.address
        call $Print.constructor
        i32.store
    )
    (func $step
    )

    (export "nothing"        (func $global.nothing))
    (export "terminal"       (func $global.terminal))
    (export "external"       (func $global.external))
    (export "print"          (func $global.print))

    (export "memory"         (memory $memory))
    (export "heap_available" (func $heap.available))

    (start $init)
)
