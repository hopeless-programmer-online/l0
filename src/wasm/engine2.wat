(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    (memory $memory 10)
    ;; { memory mapping
        ;; text
        (data (i32.const 0)  "\n")       (; 0 + 1 = 1 ;)   (func $write.newline  (call $print.ascii (i32.const 0) (i32.const 1)))
        (data (i32.const 1)  "ERROR")    (; 1 + 5 = 6 ;)   (func $write.ERROR    (call $print.ascii (i32.const 1) (i32.const 5)))
        (data (i32.const 6)  "unknown")  (; 6 + 7 = 13 ;)  (func $write.unknown  (call $print.ascii (i32.const 6) (i32.const 7)))
        (data (i32.const 13) "nothing")  (; 13 + 7 = 20 ;) (func $write.nothing  (call $print.ascii (i32.const 13) (i32.const 7)))
        (data (i32.const 20) "terminal") (; 20 + 8 = 28 ;) (func $write.terminal (call $print.ascii (i32.const 20) (i32.const 8)))
        (data (i32.const 28) "external") (; 28 + 8 = 36 ;) (func $write.external (call $print.ascii (i32.const 28) (i32.const 8)))
        (data (i32.const 36) "internal") (; 36 + 8 = 44 ;) (func $write.internal (call $print.ascii (i32.const 36) (i32.const 8)))
        (data (i32.const 44) "template") (; 44 + 8 = 52 ;) (func $write.template (call $print.ascii (i32.const 44) (i32.const 8)))
        (data (i32.const 52) "bind")     (; 52 + 4 = 56 ;) (func $write.bind     (call $print.ascii (i32.const 52) (i32.const 4)))
        (data (i32.const 56) "print")    (; 56 + 5 = 61 ;) (func $write.print    (call $print.ascii (i32.const 56) (i32.const 5)))
        (data (i32.const 61) "type")     (; 61 + 4 = 65 ;) (func $write.type     (call $print.ascii (i32.const 61) (i32.const 4)))
        (data (i32.const 65) "int32")    (; 65 + 5 = 70 ;) (func $write.int32    (call $print.ascii (i32.const 65) (i32.const 5)))
        (data (i32.const 70) "ascii")    (; 70 + 5 = 75 ;) (func $write.ascii    (call $print.ascii (i32.const 70) (i32.const 5)))
        (data (i32.const 75) "+")        (; 75 + 1 = 76 ;) (func $write.add      (call $print.ascii (i32.const 75) (i32.const 1)))
        (data (i32.const 76) "-")        (; 76 + 1 = 77 ;) (func $write.sub      (call $print.ascii (i32.const 76) (i32.const 1)))
        (data (i32.const 77) "*")        (; 77 + 1 = 78 ;) (func $write.mul      (call $print.ascii (i32.const 77) (i32.const 1)))
        (data (i32.const 78) "/")        (; 78 + 1 = 79 ;) (func $write.div      (call $print.ascii (i32.const 78) (i32.const 1)))
        ;; globals
        (func $global.nothing.address  (result i32) i32.const 768 return) (func $global.nothing (result i32) call $global.nothing.address i32.load return)
        (func $global.terminal.address (result i32) i32.const 772 return) (func $global.terminal (result i32) call $global.terminal.address i32.load return)
        (func $global.external.address (result i32) i32.const 776 return) (func $global.external (result i32) call $global.external.address i32.load return)
        (func $global.internal.address (result i32) i32.const 780 return) (func $global.internal (result i32) call $global.internal.address i32.load return)
        (func $global.template.address (result i32) i32.const 784 return) (func $global.template (result i32) call $global.template.address i32.load return)
        (func $global.bind.address     (result i32) i32.const 788 return) (func $global.bind (result i32) call $global.bind.address i32.load return)
        (func $global.print.address    (result i32) i32.const 792 return) (func $global.print (result i32) call $global.print.address i32.load return)
        (func $global.type.address     (result i32) i32.const 796 return) (func $global.type (result i32) call $global.type.address i32.load return)
        (func $global.int32.address    (result i32) i32.const 800 return) (func $global.int32 (result i32) call $global.int32.address i32.load return)
        (func $global.ascii.address    (result i32) i32.const 804 return) (func $global.ascii (result i32) call $global.ascii.address i32.load return)
        (func $global.add.address      (result i32) i32.const 808 return) (func $global.add (result i32) call $global.add.address i32.load return)
        (func $global.sub.address      (result i32) i32.const 812 return) (func $global.sub (result i32) call $global.sub.address i32.load return)
        (func $global.mul.address      (result i32) i32.const 816 return) (func $global.mul (result i32) call $global.mul.address i32.load return)
        (func $global.div.address      (result i32) i32.const 820 return) (func $global.div (result i32) call $global.div.address i32.load return)
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

        (func $type.Int32             (result i32) i32.const 8 return)
        (func $type.ASCII             (result i32) i32.const 9 return)

        (func $type.Add               (result i32) i32.const 10 return)
        (func $type.Sub               (result i32) i32.const 11 return)
        (func $type.Mul               (result i32) i32.const 12 return)
        (func $type.Div               (result i32) i32.const 13 return)

        (func $type.Equal             (result i32) i32.const 14 return)
        (func $type.NotEqual          (result i32) i32.const 15 return)
        (func $type.Greater           (result i32) i32.const 16 return)
        (func $type.GreaterEqual      (result i32) i32.const 17 return)
        (func $type.Less              (result i32) i32.const 18 return)
        (func $type.LessEqual         (result i32) i32.const 19 return)

        (func $type.If                (result i32) i32.const 20 return)

        (func $type.Internal.instance (result i32) i32.const 21 return)
        (func $type.Template.instance (result i32) i32.const 22 return)
        (func $type.Int32.instance    (result i32) i32.const 23 return)
        (func $type.ASCII.instance    (result i32) i32.const 24 return)
    ;; }

    (table 100 funcref)
    ;; { tables
        ;; { step
            (func $virtual.step.offset (result i32) i32.const 0)
            (elem (i32.const 0)
                $virtual.step.error     ;; Nothing
                $Terminal.step          ;; Terminal
                $virtual.step.error     ;; External
                $virtual.step.error     ;; Internal
                $virtual.step.error     ;; Template
                $Bind.step              ;; Bind
                $Print.step             ;; Print
                $Type.step              ;; Type
                $virtual.step.error     ;; Int32
                $virtual.step.error     ;; ASCII
                $Add.step               ;; Add
                $Sub.step               ;; Sub
                $Mul.step               ;; Mul
                $Div.step               ;; Div
                $virtual.step.error     ;; Equal
                $virtual.step.error     ;; NotEqual
                $virtual.step.error     ;; Greater
                $virtual.step.error     ;; GreaterEqual
                $virtual.step.error     ;; Less
                $virtual.step.error     ;; LessEqual
                $virtual.step.error     ;; If
                $Internal.instance.step ;; Internal.instance
                $virtual.step.error     ;; Template.instance
                $virtual.step.error     ;; Int32.instance
                $virtual.step.error     ;; ASCII.instance
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
            (func $virtual.print.offset (result i32) i32.const 25)
            (elem (i32.const 25)
                $Nothing.print           ;; Nothing
                $Terminal.print          ;; Terminal
                $External.print          ;; External
                $Internal.print          ;; Internal
                $Template.print          ;; Template
                $Bind.print              ;; Bind
                $Print.print             ;; Print
                $Type.print              ;; Type
                $Int32.print             ;; Int32
                $ASCII.print             ;; ASCII
                $Add.print               ;; Add
                $Sub.print               ;; Sub
                $Mul.print               ;; Mul
                $Div.print               ;; Div
                $virtual.print.unknown   ;; Equal
                $virtual.print.unknown   ;; NotEqual
                $virtual.print.unknown   ;; Greater
                $virtual.print.unknown   ;; GreaterEqual
                $virtual.print.unknown   ;; Less
                $virtual.print.unknown   ;; LessEqual
                $virtual.print.unknown   ;; If
                $Internal.instance.print ;; Internal.instance
                $Template.instance.print ;; Template.instance
                $Int32.instance.print    ;; Int32.instance
                $ASCII.instance.print    ;; ASCII.instance
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

        ;; { type
            (func $virtual.type.offset (result i32) i32.const 50)
            (elem (i32.const 50)
                $Nothing.type           ;; Nothing
                $virtual.type.external  ;; Terminal
                $virtual.type.external  ;; External
                $virtual.type.external  ;; Internal
                $virtual.type.external  ;; Template
                $virtual.type.external  ;; Bind
                $virtual.type.external  ;; Print
                $virtual.type.external  ;; Type
                $virtual.type.external  ;; Int32
                $virtual.type.external  ;; ASCII
                $virtual.type.external  ;; Add
                $virtual.type.external  ;; Sub
                $virtual.type.external  ;; Mul
                $virtual.type.external  ;; Div
                $virtual.type.external  ;; Equal
                $virtual.type.external  ;; NotEqual
                $virtual.type.external  ;; Greater
                $virtual.type.external  ;; GreaterEqual
                $virtual.type.external  ;; Less
                $virtual.type.external  ;; LessEqual
                $virtual.type.external  ;; If
                $Internal.instance.type ;; Internal.instance
                $Template.instance.type ;; Template.instance
                $virtual.type.unknown   ;; Int32.instance
                $virtual.type.unknown   ;; ASCII.instance
            )
            (type $virtual.type (func (param $something i32) (result i32)))
            (func $virtual.type (param $something i32) (result i32)
                local.get $something

                local.get $something
                call $something.type
                call $virtual.type.offset
                i32.add
                call_indirect (type $virtual.type)

                return
            )
            (func $virtual.type.unknown (param $something i32) (result i32)
                call $global.nothing
                return
            )
            (func $virtual.type.external (param $something i32) (result i32)
                call $global.external
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
            local.get $i
            local.get $array
            call $Array.length
            i32.ge_u
            (if (then
                call $global.nothing
                return
            ))

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
        (func $Nothing.print (param $nothing i32)
            call $write.nothing
            return
        )
        (func $Nothing.type (param $nothing i32) (result i32)
            call $global.nothing
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
        (func $Terminal.step (param $terminal i32) (param $buffer i32) (result i32)
            i32.const 0
            return
        )
        (func $Terminal.print (param $terminal i32)
            call $write.terminal
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
        (func $External.print (param $external i32)
            call $write.external
            return
        )
    ;; }

    ;; { Internal
        (func $sizeof.Internal (result i32)
            i32.const 4
            return
        )
        (func $Internal.constructor (result i32)
            (local $internal i32)
            ;; allocate
            call $sizeof.Internal
            call $mem.allocate
            local.set $internal
            ;; internal.type = type.Internal
            local.get $internal
            call $type.Internal
            call $something.type.set
            ;; return
            local.get $internal
            return
        )
        (func $Internal.print (param $internal i32)
            call $write.internal
            return
        )
    ;; }

    ;; { Template
        (func $sizeof.Template (result i32)
            i32.const 4
            return
        )
        (func $Template.constructor (result i32)
            (local $template i32)
            ;; allocate
            call $sizeof.Template
            call $mem.allocate
            local.set $template
            ;; template.type = type.Template
            local.get $template
            call $type.Template
            call $something.type.set
            ;; return
            local.get $template
            return
        )
        (func $Template.print (param $template i32)
            call $write.template
            return
        )
    ;; }

    ;; { Bind
        (func $sizeof.Bind (result i32)
            i32.const 4
            return
        )
        (func $Bind.constructor (result i32)
            (local $bind i32)
            ;; allocate
            call $sizeof.Bind
            call $mem.allocate
            local.set $bind
            ;; bind.type = type.Bind
            local.get $bind
            call $type.Bind
            call $something.type.set
            ;; return
            local.get $bind
            return
        )
        (func $Bind.step.prepare_internal (param $buffer i32) (result i32)
            (local $target i32)
            (local $target_length i32)
            (local $storage_length i32)
            (local $internal i32)

            ;; get target template
            local.get $buffer
            i32.const 2
            call $Array.get
            local.set $target

            local.get $target
            call $Template.instance.assert
            (if (then i32.const 0 return))

            local.get $target
            call $Template.instance.length
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
            call $Internal.instance.constructor
            local.set $internal

            ;; copy template targets -> internal targets
            local.get $target
            call $Template.instance.first
            local.get $internal
            call $Internal.instance.targets.first
            local.get $target_length
            call $Array.copy

            ;; copy buffer -> internal storage
            local.get $buffer
            call $Array.first
            i32.const 12 ;; 3*4
            i32.add
            local.get $internal
            call $Internal.instance.storage.first
            local.get $storage_length
            call $Array.copy

            ;; storage[last] = internal
            local.get $internal
            call $Internal.instance.storage.first
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
        (func $Bind.step.get (param $first i32) (param $length i32) (param $i i32) (param $internal i32) (result i32)
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

                call $global.nothing
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

                call $global.nothing
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
        (func $Bind.step (param $bind i32) (param $buffer i32) (result i32)
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
            call $Bind.step.prepare_internal
            local.tee $internal
            (if (then) (else
                call $write.ERROR
                call $write.newline
                i32.const 0 return
            ))

            ;; get template info
            local.get $buffer
            i32.const 1
            call $Array.get
            local.tee $template
            call $Template.instance.assert
            (if (then
                call $write.ERROR
                call $write.newline
                i32.const 0 return
            ))

            local.get $template
            call $Template.instance.length
            local.set $template_length
            local.get $template
            call $Template.instance.first
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
                local.get $internal
                call $Bind.step.get
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
        (func $Bind.print (param $bind i32)
            call $write.bind
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
        (func $Print.step (param $print i32) (param $buffer i32) (result i32)
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
        (func $Print.print (param $print i32)
            call $write.print
            return
        )
    ;; }

    ;; { Type
        (func $sizeof.Type (result i32)
            i32.const 4
            return
        )
        (func $Type.constructor (result i32)
            (local $type i32)
            ;; allocate
            call $sizeof.Type
            call $mem.allocate
            local.set $type
            ;; type.type = type.Type
            local.get $type
            call $type.Type
            call $something.type.set
            ;; return
            local.get $type
            return
        )
        (func $Type.step (param $something i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)

            ;; alloc next buffer
            i32.const 3
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

            local.get $next_buffer
            i32.const 2
                ;; get type
                local.get $buffer
                i32.const 2
                call $Array.get
                call $virtual.type
            call $Array.set

            ;; return
            local.get $next_buffer
            return
        )
        (func $Type.print (param $type i32)
            call $write.type
            return
        )
    ;; }

    ;; { Int32
        (func $sizeof.Int32 (result i32)
            i32.const 4
            return
        )
        (func $Int32.constructor (result i32)
            (local $int32 i32)
            ;; allocate
            call $sizeof.Int32
            call $mem.allocate
            local.set $int32
            ;; int32.type = type.Int32
            local.get $int32
            call $type.Int32
            call $something.type.set
            ;; return
            local.get $int32
            return
        )
        (func $Int32.print (param $int32 i32)
            call $write.int32
            return
        )
    ;; }

    ;; { ASCII
        (func $sizeof.ASCII (result i32)
            i32.const 4
            return
        )
        (func $ASCII.constructor (result i32)
            (local $ascii i32)
            ;; allocate
            call $sizeof.ASCII
            call $mem.allocate
            local.set $ascii
            ;; ascii.type = type.ASCII
            local.get $ascii
            call $type.ASCII
            call $something.type.set
            ;; return
            local.get $ascii
            return
        )
        (func $ASCII.print (param $ascii i32)
            call $write.ascii
            return
        )
    ;; }

    ;; { Add
        (func $sizeof.Add (result i32)
            i32.const 4
            return
        )
        (func $Add.constructor (result i32)
            (local $add i32)
            ;; allocate
            call $sizeof.Add
            call $mem.allocate
            local.set $add
            ;; add.type = type.Add
            local.get $add
            call $type.Add
            call $something.type.set
            ;; return
            local.get $add
            return
        )
        (func $Add.add (param $left i32) (param $right i32) (result i32)
            (local $left_type i32)
            (local $right_type i32)

            ;; get types
            local.get $left
            call $something.type
            local.set $left_type

            local.get $right
            call $something.type
            local.set $right_type

            ;; Int32 + Int32
            local.get $left_type
            call $type.Int32.instance
            i32.eq
            local.get $right_type
            call $type.Int32.instance
            i32.eq
            i32.mul
            (if (then
                local.get $left
                call $Int32.instance.value
                local.get $right
                call $Int32.instance.value
                i32.add
                call $Int32.instance.constructor
                return
            ))

            ;; no overloads
            i32.const 0
            return
        )
        (func $Add.step (param $add i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)
            (local $result i32)

            ;; get arguments
            local.get $buffer
            i32.const 2
            call $Array.get
            local.get $buffer
            i32.const 3
            call $Array.get
            call $Add.add
            local.tee $result
            (if (then) (else
                call $write.ERROR
                i32.const 0
                return
            ))

            ;; alloc next buffer
            i32.const 3
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

            local.get $next_buffer
            i32.const 2
            local.get $result
            call $Array.set

            ;; return
            local.get $next_buffer
            return
        )
        (func $Add.print (param $add i32)
            call $write.add
            return
        )
    ;; }

    ;; { Sub
        (func $sizeof.Sub (result i32)
            i32.const 4
            return
        )
        (func $Sub.constructor (result i32)
            (local $sub i32)
            ;; allocate
            call $sizeof.Sub
            call $mem.allocate
            local.set $sub
            ;; sub.type = type.Sub
            local.get $sub
            call $type.Sub
            call $something.type.set
            ;; return
            local.get $sub
            return
        )
        (func $Sub.sub (param $left i32) (param $right i32) (result i32)
            (local $left_type i32)
            (local $right_type i32)

            ;; get types
            local.get $left
            call $something.type
            local.set $left_type

            local.get $right
            call $something.type
            local.set $right_type

            ;; Int32 + Int32
            local.get $left_type
            call $type.Int32.instance
            i32.eq
            local.get $right_type
            call $type.Int32.instance
            i32.eq
            i32.mul
            (if (then
                local.get $left
                call $Int32.instance.value
                local.get $right
                call $Int32.instance.value
                i32.sub
                call $Int32.instance.constructor
                return
            ))

            ;; no overloads
            i32.const 0
            return
        )
        (func $Sub.step (param $sub i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)
            (local $result i32)

            ;; get arguments
            local.get $buffer
            i32.const 2
            call $Array.get
            local.get $buffer
            i32.const 3
            call $Array.get
            call $Sub.sub
            local.tee $result
            (if (then) (else
                call $write.ERROR
                i32.const 0
                return
            ))

            ;; alloc next buffer
            i32.const 3
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

            local.get $next_buffer
            i32.const 2
            local.get $result
            call $Array.set

            ;; return
            local.get $next_buffer
            return
        )
        (func $Sub.print (param $sub i32)
            call $write.sub
            return
        )
    ;; }

    ;; { Mul
        (func $sizeof.Mul (result i32)
            i32.const 4
            return
        )
        (func $Mul.constructor (result i32)
            (local $mul i32)
            ;; allocate
            call $sizeof.Mul
            call $mem.allocate
            local.set $mul
            ;; mul.type = type.Mul
            local.get $mul
            call $type.Mul
            call $something.type.set
            ;; return
            local.get $mul
            return
        )
        (func $Mul.mul (param $left i32) (param $right i32) (result i32)
            (local $left_type i32)
            (local $right_type i32)

            ;; get types
            local.get $left
            call $something.type
            local.set $left_type

            local.get $right
            call $something.type
            local.set $right_type

            ;; Int32 + Int32
            local.get $left_type
            call $type.Int32.instance
            i32.eq
            local.get $right_type
            call $type.Int32.instance
            i32.eq
            i32.mul
            (if (then
                local.get $left
                call $Int32.instance.value
                local.get $right
                call $Int32.instance.value
                i32.mul
                call $Int32.instance.constructor
                return
            ))

            ;; no overloads
            i32.const 0
            return
        )
        (func $Mul.step (param $mul i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)
            (local $result i32)

            ;; get arguments
            local.get $buffer
            i32.const 2
            call $Array.get
            local.get $buffer
            i32.const 3
            call $Array.get
            call $Mul.mul
            local.tee $result
            (if (then) (else
                call $write.ERROR
                i32.const 0
                return
            ))

            ;; alloc next buffer
            i32.const 3
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

            local.get $next_buffer
            i32.const 2
            local.get $result
            call $Array.set

            ;; return
            local.get $next_buffer
            return
        )
        (func $Mul.print (param $mul i32)
            call $write.mul
            return
        )
    ;; }

    ;; { Div
        (func $sizeof.Div (result i32)
            i32.const 4
            return
        )
        (func $Div.constructor (result i32)
            (local $div i32)
            ;; allocate
            call $sizeof.Div
            call $mem.allocate
            local.set $div
            ;; div.type = type.Div
            local.get $div
            call $type.Div
            call $something.type.set
            ;; return
            local.get $div
            return
        )
        (func $Div.step (param $div i32) (param $buffer i32) (result i32)
            (local $next i32)
            (local $next_buffer i32)
            (local $result1 i32)
            (local $result2 i32)
            (local $left i32)
            (local $right i32)
            (local $left_type i32)
            (local $right_type i32)

            ;; get arguments
            local.get $buffer
            i32.const 2
            call $Array.get
            local.set $left

            local.get $buffer
            i32.const 3
            call $Array.get
            local.set $right

            ;; get types
            local.get $left
            call $something.type
            local.set $left_type

            local.get $right
            call $something.type
            local.set $right_type

            i32.const 0
            local.set $result1
            i32.const 0
            local.set $result2

            (block $overload
                ;; Int32 + Int32
                local.get $left_type
                call $type.Int32.instance
                i32.eq
                local.get $right_type
                call $type.Int32.instance
                i32.eq
                i32.mul
                (if (then
                    local.get $left
                    call $Int32.instance.value
                    local.get $right
                    call $Int32.instance.value
                    i32.div_s
                    call $Int32.instance.constructor
                    local.set $result1

                    local.get $left
                    call $Int32.instance.value
                    local.get $right
                    call $Int32.instance.value
                    i32.rem_s
                    call $Int32.instance.constructor
                    local.set $result2

                    br $overload
                ))
            )

            local.get $result1
            (if (then) (else
                call $write.ERROR
                i32.const 0
                return
            ))

            ;; alloc next buffer
            i32.const 4
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

            local.get $next_buffer
            i32.const 2
            local.get $result1
            call $Array.set

            local.get $next_buffer
            i32.const 3
            local.get $result2
            call $Array.set

            ;; return
            local.get $next_buffer
            return
        )
        (func $Div.print (param $div i32)
            call $write.div
            return
        )
    ;; }

    ;; { Internal.instance
        (func $sizeof.Internal.instance.header (result i32)
            i32.const 12
            return
        )
        (func $sizeof.Internal.instance (param $targets_length i32) (param $storage_length i32) (result i32)
            ;; mem.allocate( sizeof.Internal.header + targets_length * 4 + storage_length * 4 )
            call $sizeof.Internal.instance.header
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
        (func $Internal.instance.targets.length.offset (result i32)
            i32.const 4
            return
        )
        (func $Internal.instance.targets.length (param $internal i32) (result i32)
            local.get $internal
            call $Internal.instance.targets.length.offset
            i32.add
            i32.load
            return
        )
        (func $Internal.instance.targets.length.set (param $internal i32) (param $length i32)
            local.get $internal
            call $Internal.instance.targets.length.offset
            i32.add
            local.get $length
            i32.store
        )
        (func $Internal.instance.targets.first.offset (result i32)
            call $sizeof.Internal.instance.header
            return
        )
        (func $Internal.instance.targets.first (param $internal i32) (result i32)
            local.get $internal
            call $Internal.instance.targets.first.offset
            i32.add
            return
        )
        (func $Internal.instance.storage.length.offset (result i32)
            i32.const 8
            return
        )
        (func $Internal.instance.storage.length (param $internal i32) (result i32)
            local.get $internal
            call $Internal.instance.storage.length.offset
            i32.add
            i32.load
            return
        )
        (func $Internal.instance.storage.length.set (param $internal i32) (param $length i32)
            local.get $internal
            call $Internal.instance.storage.length.offset
            i32.add
            local.get $length
            i32.store
        )
        (func $Internal.instance.storage.first.offset (param $internal i32) (result i32)
            call $Internal.instance.targets.first.offset
            local.get $internal
            call $Internal.instance.targets.length
            i32.const 4
            i32.mul
            i32.add
            return
        )
        (func $Internal.instance.storage.first (param $internal i32) (result i32)
            local.get $internal
            local.get $internal
            call $Internal.instance.storage.first.offset
            i32.add
            return
        )
        (func $Internal.instance.constructor (param $targets_length i32) (param $storage_length i32) (result i32)
            (local $internal i32)
            ;; allocate
            local.get $targets_length
            local.get $storage_length
            call $sizeof.Internal.instance
            call $mem.allocate
            local.set $internal
            ;; internal.type = type.Internal
            local.get $internal
            call $type.Internal.instance
            call $something.type.set
            ;; internal.targets.length = targets_length
            local.get $internal
            local.get $targets_length
            call $Internal.instance.targets.length.set
            ;; internal.storage.length = storage_length
            local.get $internal
            local.get $storage_length
            call $Internal.instance.storage.length.set
            ;; return
            local.get $internal
            return
        )
        (func $Internal.instance.step.get
            (param $target i32)
            (param $storage_first i32) (param $storage_length i32)
            (param $buffer_first i32) (param $buffer_length i32)
            (param $internal i32)
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

                i32.const 12345
                call $print.int32
                call $write.newline

                call $global.nothing
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
        (func $Internal.instance.step (param $internal i32) (param $buffer i32) (result i32)
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
            call $Internal.instance.targets.length
            local.tee $targets_length
            call $Array.constructor
            local.tee $next_buffer
            call $Array.first
            local.set $next_buffer_i
            ;; save variables
            local.get $internal
            call $Internal.instance.targets.first
            local.tee $targets_i
            local.get $targets_length
            i32.const 4
            i32.mul
            i32.add
            local.set $targets_last
            local.get $internal
            call $Internal.instance.storage.length
            local.set $storage_length
            local.get $internal
            call $Internal.instance.storage.first
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
                    call $Internal.instance.step.get
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
        (func $Internal.instance.print (param $internal i32)
            call $write.internal
            return
        )
        (func $Internal.instance.type (param $internal i32) (result i32)
            call $global.internal
            return
        )
    ;; }

    ;; { Template.instance
        (func $sizeof.Template.instance.header (result i32)
            i32.const 8
            return
        )
        (func $sizeof.Template.instance (param $length i32) (result i32)
            call $sizeof.Template.instance.header
            local.get $length
            i32.const 4
            i32.mul
            i32.add
            return
        )
        (func $Template.instance.length.offset (result i32)
            i32.const 4
            return
        )
        (func $Template.instance.length (param $template i32) (result i32)
            local.get $template
            call $Template.instance.length.offset
            i32.add
            i32.load
            return
        )
        (func $Template.instance.length.set (param $template i32) (param $length i32)
            local.get $template
            call $Template.instance.length.offset
            i32.add
            local.get $length
            i32.store
        )
        (func $Template.instance.first.offset (result i32)
            call $sizeof.Template.instance.header
            return
        )
        (func $Template.instance.first (param $template i32) (result i32)
            local.get $template
            call $Template.instance.first.offset
            i32.add
            return
        )
        (func $Template.instance.constructor (param $length i32) (result i32)
            (local $template i32)
            ;; allocate
            local.get $length
            call $sizeof.Template.instance
            call $mem.allocate
            local.set $template
            ;; template.type = type.Template.instance
            local.get $template
            call $type.Template.instance
            call $something.type.set
            ;; array.length = length
            local.get $template
            local.get $length
            call $Template.instance.length.set

            ;; return
            local.get $template
            return
        )
        (func $Template.instance.assert (param $template i32) (result i32)
            local.get $template
            call $something.type
            call $type.Template.instance
            i32.ne
            return
        )
        (func $Template.instance.print (param $template i32)
            call $write.template
            return
        )
        (func $Template.instance.type (param $template i32) (result i32)
            call $global.template
            return
        )
    ;; }

    ;; { Int32.instance
        (func $sizeof.Int32.instance (result i32)
            i32.const 8
            return
        )
        (func $Int32.instance.value.offset (result i32)
            i32.const 4
            return
        )
        (func $Int32.instance.value (param $int32 i32) (result i32)
            local.get $int32
            call $Int32.instance.value.offset
            i32.add
            i32.load
            return
        )
        (func $Int32.instance.value.set (param $int32 i32) (param $value i32)
            local.get $int32
            call $Int32.instance.value.offset
            i32.add
            local.get $value
            i32.store
        )
        (func $Int32.instance.constructor (param $value i32) (result i32)
            (local $int32 i32)
            ;; allocate
            call $sizeof.Int32.instance
            call $mem.allocate
            local.set $int32
            ;; int32.type = type.Int32.instance
            local.get $int32
            call $type.Int32.instance
            call $something.type.set
            ;; int32.value = value
            local.get $int32
            local.get $value
            call $Int32.instance.value.set
            ;; return int32
            local.get $int32
            return
        )
        (func $Int32.instance.print (param $int32 i32)
            local.get $int32
            call $Int32.instance.value
            call $print.int32
        )
    ;; }

    ;; { ASCII.instance
        (func $sizeof.ASCII.instance.header (result i32)
            i32.const 8
            return
        )
        (func $ASCII.instance.length.offset (result i32)
            i32.const 4
            return
        )
        (func $ASCII.instance.length (param $ascii i32) (result i32)
            local.get $ascii
            call $ASCII.instance.length.offset
            i32.add
            i32.load
            return
        )
        (func $ASCII.instance.length.set (param $ascii i32) (param $length i32)
            local.get $ascii
            call $ASCII.instance.length.offset
            i32.add
            local.get $length
            i32.store
        )
        (func $ASCII.instance.data.offset (result i32)
            call $sizeof.ASCII.instance.header
            return
        )
        (func $ASCII.instance.data (param $ascii i32) (result i32)
            local.get $ascii
            call $ASCII.instance.data.offset
            i32.add
            return
        )
        (func $ASCII.instance.constructor (param $length i32) (result i32)
            (local $ascii i32)
            ;; mem.allocate( sizeof.ASCII.instance.header + length )
            call $sizeof.ASCII.instance.header
            local.get $length
            i32.add
            call $mem.allocate
            local.set $ascii
            ;; ascii.type = type.ASCII.instance
            local.get $ascii
            call $type.ASCII.instance
            call $something.type.set
            ;; ascii.value = value
            local.get $ascii
            local.get $length
            call $ASCII.instance.length.set
            ;; return ascii
            local.get $ascii
            return
        )
        (func $ASCII.instance.print (param $ascii i32)
            local.get $ascii
            call $ASCII.instance.data
            local.get $ascii
            call $ASCII.instance.length
            call $print.ascii
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

        call $global.internal.address
        call $Internal.constructor
        i32.store

        call $global.template.address
        call $Template.constructor
        i32.store

        call $global.bind.address
        call $Bind.constructor
        i32.store

        call $global.print.address
        call $Print.constructor
        i32.store

        call $global.type.address
        call $Type.constructor
        i32.store

        call $global.int32.address
        call $Int32.constructor
        i32.store

        call $global.ascii.address
        call $ASCII.constructor
        i32.store

        call $global.add.address
        call $Add.constructor
        i32.store

        call $global.sub.address
        call $Sub.constructor
        i32.store

        call $global.mul.address
        call $Mul.constructor
        i32.store

        call $global.div.address
        call $Div.constructor
        i32.store
    )
    (func $step (param $buffer i32) (result i32)
        (local $first i32)

        local.get $buffer
        call $Array.first
        i32.load
        local.set $first

        ;; local.get $first
        ;; call $something.type
        ;; call $print.int32
        ;; call $write.newline

        local.get $first
        local.get $buffer
        call $virtual.step

        ;; free buffer
        local.get $buffer
        call $mem.free

        return
    )

    (export "nothing"          (func $global.nothing))
    (export "terminal"         (func $global.terminal))
    (export "external"         (func $global.external))
    (export "internal"         (func $global.internal))
    (export "template"         (func $global.template))
    (export "bind"             (func $global.bind))
    (export "print"            (func $global.print))
    (export "type"             (func $global.type))
    (export "int32"            (func $global.int32))
    (export "ascii"            (func $global.ascii))
    (export "add"              (func $global.add))
    (export "sub"              (func $global.sub))
    (export "mul"              (func $global.mul))
    (export "div"              (func $global.div))

    (export "memory"           (memory $memory))
    (export "heap_available"   (func $heap.available))
    (export "heap_max"         (func $heap.max))
    (export "Internal"         (func $Internal.instance.constructor))
    (export "Internal.targets" (func $Internal.instance.targets.first))
    (export "Internal.storage" (func $Internal.instance.storage.first))
    (export "Template"         (func $Template.instance.constructor))
    (export "Template.first"   (func $Template.instance.first))
    (export "Array"            (func $Array.constructor))
    (export "Array.set"        (func $Array.set))
    (export "Int32"            (func $Int32.instance.constructor))
    (export "ASCII"            (func $ASCII.instance.constructor))
    (export "ASCII.data"       (func $ASCII.instance.data))
    (export "step"             (func $step))

    (start $init)
)
