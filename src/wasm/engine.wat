(module
    (import "print" "int32" (func $print.int32 (param i32)))
    (import "print" "ascii" (func $print.ascii (param i32) (param i32)))

    (memory $memory 1)
    ;; constants
    (data (i32.const 0)  "\n")       ;; 0-1,   1
    (data (i32.const 1)  "unknown")  ;; 1-8,   7
    (data (i32.const 8)  "[")        ;; 8-9,   1
    (data (i32.const 9)  "]")        ;; 9-10,  1
    (data (i32.const 10) ",")        ;; 10-11, 1
    (data (i32.const 11) "internal") ;; 11-19, 8
    (data (i32.const 19) "|")        ;; 19-20, 1
    (data (i32.const 20) "print")    ;; 20-25, 5
    (data (i32.const 25) "template") ;; 25-33, 8
    (data (i32.const 33) "bind")     ;; 33-37, 4
    (data (i32.const 37) "terminal") ;; 37-45, 8
    (data (i32.const 45) "(")        ;; 45-46, 1
    (data (i32.const 46) ")")        ;; 46-47, 1
    (data (i32.const 47) "nothing")  ;; 47-54, 7
    (data (i32.const 54) "+")        ;; 54-55, 1
    ;; memory nodes
    (data (i32.const 1024)  "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 1028)  "\F4\FF\00\00") ;; begin.next = &end (65524)
    (data (i32.const 1032)  "\00\00\00\00") ;; begin.size = 0
    (data (i32.const 65524) "\00\04\00\00") ;; begin.prev = &begin (1024)
    (data (i32.const 65528) "\F4\FF\00\00") ;; begin.next = &end (65524)
    (data (i32.const 65532) "\00\00\00\00") ;; begin.size = 0

    (func $type.Nothing  (result i32) i32.const 0 return)
    (func $type.Terminal (result i32) i32.const 1 return)
    (func $type.Internal (result i32) i32.const 2 return)
    (func $type.Template (result i32) i32.const 3 return)
    (func $type.Bind     (result i32) i32.const 4 return)
    (func $type.Print    (result i32) i32.const 5 return)
    (func $type.Add      (result i32) i32.const 6 return)
    (func $type.Sub      (result i32) i32.const 7 return)
    (func $type.Mul      (result i32) i32.const 8 return)
    (func $type.Div      (result i32) i32.const 9 return)
    ;; (func $type.Length   (result i32) i32.const 10 return)
    ;; (func $type.Get      (result i32) i32.const 11 return)
    ;; (func $type.Set      (result i32) i32.const 12 return)
    (func $type.Int32    (result i32) i32.const 13 return)
    (func $type.ASCII    (result i32) i32.const 14 return)
    ;; (func $type.List     (result i32) i32.const 0 return)

    (table 30 funcref)

    (func $virtual.step.offset (result i32) i32.const 0)
    (elem (i32.const 0)
        $virtual.step.Nothing
        $virtual.step.Terminal
        $virtual.step.Internal
        $virtual.step.Nothing ;; @todo: $virtual.print.Template
        $virtual.step.Bind
        $virtual.step.Print
        $virtual.step.Add
        $virtual.step.Sub
        $virtual.step.Mul
        $virtual.step.Div
        $virtual.step.Nothing ;; @todo: $virtual.print.Length
        $virtual.step.Nothing ;; @todo: $virtual.print.Get
        $virtual.step.Nothing ;; @todo: $virtual.print.Set
        $virtual.step.Nothing ;; @todo: $virtual.print.Int32
        $virtual.step.Nothing ;; @todo: $virtual.print.ASCII
    )
    (type $virtual.step (func (param $print i32) (param $buffer i32) (param $nothing i32) (result i32)))
    (func $virtual.step (param $first i32) (param $buffer i32) (param $nothing i32) (result i32)
        local.get $first
        local.get $buffer
        local.get $nothing

        local.get $first
        call $something.type
        call $virtual.step.offset
        i32.add
        call_indirect (type $virtual.step)
    )
    (func $virtual.step.Nothing (param $nothing_ i32) (param $buffer i32) (param $nothing i32) (result i32)
        ;; print "unknown"
        i32.const 1
        i32.const 7
        call $print.ascii
        call $print.newline

        i32.const 0
        return
    )
    (func $virtual.step.Terminal (param $terminal i32) (param $buffer i32) (param $nothing i32) (result i32)
        i32.const 0
        return
    )
    (func $virtual.step.Internal.get
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
    (func $virtual.step.Internal (param $internal i32) (param $buffer i32) (param $nothing i32) (result i32)
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
                call $virtual.step.Internal.get
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
    (func $virtual.step.Bind.prepare_internal (param $buffer i32) (result i32)
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
    (func $virtual.step.Bind.get (param $first i32) (param $length i32) (param $i i32) (param $nothing i32) (param $internal i32) (result i32)
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
    (func $virtual.step.Bind (param $bind i32) (param $buffer i32) (param $nothing i32) (result i32)
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
        call $virtual.step.Bind.prepare_internal
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
            call $virtual.step.Bind.get
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
    (func $virtual.step.Print (param $print i32) (param $buffer i32) (param $nothing i32) (result i32)
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
    (func $virtual.step.result1 (param $buffer i32) (param $result i32) (result i32)
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

        ;; save result
        local.get $next_buffer
        i32.const 2
        local.get $result
        call $Array.set

        ;; return
        local.get $next_buffer
        return
    )
    (func $virtual.step.result2 (param $buffer i32) (param $result1 i32) (param $result2 i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)

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

        ;; save results
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
    (func $virtual.step.Add (param $add i32) (param $buffer i32) (param $nothing i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)
        (local $left i32)
        (local $right i32)

        ;; extract & check left
        local.get $buffer
        i32.const 2
        call $Array.get
        local.set $left

        (block $check_left
            local.get $left
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_left

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; extract & check right
        local.get $buffer
        i32.const 3
        call $Array.get
        local.set $right

        (block $check_right
            local.get $right
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_right

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; return
        local.get $buffer

        local.get $left
        call $Int32.value
        local.get $right
        call $Int32.value
        i32.add
        call $Int32.constructor

        call $virtual.step.result1
        return
    )
    (func $virtual.step.Sub (param $sub i32) (param $buffer i32) (param $nothing i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)
        (local $left i32)
        (local $right i32)

        ;; extract & check left
        local.get $buffer
        i32.const 2
        call $Array.get
        local.set $left

        (block $check_left
            local.get $left
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_left

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; extract & check right
        local.get $buffer
        i32.const 3
        call $Array.get
        local.set $right

        (block $check_right
            local.get $right
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_right

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; return
        local.get $buffer

        local.get $left
        call $Int32.value
        local.get $right
        call $Int32.value
        i32.sub
        call $Int32.constructor

        call $virtual.step.result1
        return
    )
    (func $virtual.step.Mul (param $mul i32) (param $buffer i32) (param $nothing i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)
        (local $left i32)
        (local $right i32)

        ;; extract & check left
        local.get $buffer
        i32.const 2
        call $Array.get
        local.set $left

        (block $check_left
            local.get $left
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_left

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; extract & check right
        local.get $buffer
        i32.const 3
        call $Array.get
        local.set $right

        (block $check_right
            local.get $right
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_right

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; return
        local.get $buffer

        local.get $left
        call $Int32.value
        local.get $right
        call $Int32.value
        i32.mul
        call $Int32.constructor

        call $virtual.step.result1
        return
    )
    (func $virtual.step.Div (param $div i32) (param $buffer i32) (param $nothing i32) (result i32)
        (local $next i32)
        (local $next_buffer i32)
        (local $left i32)
        (local $right i32)

        ;; extract & check left
        local.get $buffer
        i32.const 2
        call $Array.get
        local.set $left

        (block $check_left
            local.get $left
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_left

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; extract & check right
        local.get $buffer
        i32.const 3
        call $Array.get
        local.set $right

        (block $check_right
            local.get $right
            call $something.type
            call $Int32.type
            i32.eq
            br_if $check_right

            ;; @todo: error state
            i32.const 0
            return
        )

        ;; return
        local.get $buffer

        local.get $left
        call $Int32.value
        local.tee $left
        local.get $right
        call $Int32.value
        local.tee $right
        i32.div_s
        call $Int32.constructor
        local.get $left
        local.get $right
        i32.rem_s
        call $Int32.constructor

        call $virtual.step.result2
        return
    )

    (func $virtual.print.offset (result i32) i32.const 15)
    (elem (i32.const 15)
        $virtual.print.Nothing
        $virtual.print.Terminal
        $virtual.print.Internal
        $virtual.print.Template
        $virtual.print.Bind
        $virtual.print.Print
        $virtual.print.Add
        $virtual.print.Nothing ;; Sub
        $virtual.print.Nothing ;; Mul
        $virtual.print.Nothing ;; Div
        $virtual.print.Nothing ;; Length
        $virtual.print.Nothing ;; Get
        $virtual.print.Nothing ;; Set
        $virtual.print.Int32
        $virtual.print.ASCII
    )
    (type $virtual.print (func (param $something i32)))
    (func $virtual.print (param $something i32)
        local.get $something

        local.get $something
        call $something.type
        call $virtual.print.offset
        i32.add
        call_indirect (type $virtual.print)

        call $print.newline
    )
    (func $virtual.print.Nothing (param $nothing i32)
        i32.const 47
        i32.const 7
        call $print.ascii
    )
    (func $virtual.print.Terminal (param $terminal i32)
        i32.const 37
        i32.const 8
        call $print.ascii
    )
    (func $virtual.print.Internal (param $internal i32)
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
        call $print.square_opening

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

                call $print.comma
            )

            br $continue
        ))

        call $print.square_closing
        call $print.round_opening

        local.get $internal
        call $Internal.storage.length
        call $print.int32

        call $print.round_closing
    )
    (func $virtual.print.Template (param $template i32)
        i32.const 25
        i32.const 8
        call $print.ascii
    )
    (func $virtual.print.Bind (param $bind i32)
        i32.const 33
        i32.const 4
        call $print.ascii
    )
    (func $virtual.print.Print (param $print i32)
        i32.const 20
        i32.const 5
        call $print.ascii
    )
    (func $virtual.print.Add (param $print i32)
        i32.const 54
        i32.const 1
        call $print.ascii
    )
    (func $virtual.print.Int32 (param $int32 i32)
        local.get $int32
        call $Int32.value
        call $print.int32
    )
    (func $virtual.print.ASCII (param $ascii i32)
        local.get $ascii
        call $ASCII.data
        local.get $ascii
        call $ASCII.length
        call $print.ascii
    )
    (func $print.newline
        i32.const 0
        i32.const 1
        call $print.ascii
    )
    (func $print.comma
        i32.const 10
        i32.const 1
        call $print.ascii
    )
    (func $print.square_opening
        i32.const 8
        i32.const 1
        call $print.ascii
    )
    (func $print.square_closing
        i32.const 9
        i32.const 1
        call $print.ascii
    )
    (func $print.round_opening
        i32.const 45
        i32.const 1
        call $print.ascii
    )
    (func $print.round_closing
        i32.const 46
        i32.const 1
        call $print.ascii
    )

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
        call $type.Nothing
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
        call $type.Int32
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
        call $type.ASCII
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
        call $type.Internal
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
        call $type.Template
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
        call $type.Terminal
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
    )

    (func $sizeof.external.Print (result i32)
        i32.const 4
        return
    )
    (func $external.Print.type (result i32)
        call $type.Print
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
        call $type.Bind
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

    (func $sizeof.external.Add (result i32)
        i32.const 4
        return
    )
    (func $external.Add.type (result i32)
        call $type.Add
        return
    )
    (func $external.Add.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Add
        call $mem.allocate
        local.set $external
        ;; external.type = external.Add.type
        local.get $external
        call $external.Add.type
        call $something.type.set
        ;; return
        local.get $external
        return
    )

    (func $sizeof.external.Sub (result i32)
        i32.const 4
        return
    )
    (func $external.Sub.type (result i32)
        call $type.Sub
        return
    )
    (func $external.Sub.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Sub
        call $mem.allocate
        local.set $external
        ;; external.type = external.Sub.type
        local.get $external
        call $external.Sub.type
        call $something.type.set
        ;; return
        local.get $external
        return
    )

    (func $sizeof.external.Mul (result i32)
        i32.const 4
        return
    )
    (func $external.Mul.type (result i32)
        call $type.Mul
        return
    )
    (func $external.Mul.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Mul
        call $mem.allocate
        local.set $external
        ;; external.type = external.Mul.type
        local.get $external
        call $external.Mul.type
        call $something.type.set
        ;; return
        local.get $external
        return
    )

    (func $sizeof.external.Div (result i32)
        i32.const 4
        return
    )
    (func $external.Div.type (result i32)
        call $type.Div
        return
    )
    (func $external.Div.constructor (result i32)
        (local $external i32)
        ;; allocate
        call $sizeof.external.Div
        call $mem.allocate
        local.set $external
        ;; external.type = external.Div.type
        local.get $external
        call $external.Div.type
        call $something.type.set
        ;; return
        local.get $external
        return
    )

    (func $machine.step (param $buffer i32) (param $nothing i32) (result i32)
        (local $first i32)

        local.get $buffer
        call $Array.first
        i32.load
        local.set $first

        local.get $first
        local.get $buffer
        local.get $nothing
        call $virtual.step

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
    (export "ASCII_data" (func $ASCII.data))
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
    (export "Add" (func $external.Add.constructor))
    (export "Sub" (func $external.Sub.constructor))
    (export "Mul" (func $external.Mul.constructor))
    (export "Div" (func $external.Div.constructor))
    (export "step" (func $machine.step))
    (export "_print" (func $virtual.print))
)
