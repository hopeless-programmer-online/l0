enum class Type : public uint32_t  {
    Nothing        = 0,
    Variable       = 1,
    Int32          = 2,
    ASCII          = 3,
    List           = 4,
    Internal       = 5,
    Terminal       = 6,
    External_Print = 7,
}

struct Anything {
    const Type type;
};

struct Nothing : public Anything {
};

struct Int32 : public Anything {
    const int32_t value;
};

struct ASCII : public Anything {
    const uint32_t   length;
    const char*const data;
};

struct List : public Anything {
    Anything* first;
    uint32_t  length;
    uint32_t  capacity;
};

struct Variable : public Anything {
    Anything* value;
};

struct Internal : public Anything {
    uint32_t targets_length;
    uint32_t buffer_length;
    // uint32_t  targets[targets_length]
    // Variable* buffer[buffer_length]
};

struct Terminal : public Anything {

};

struct Array {
    uint32_t  length;
    // Anything first[length];
};

auto add(Anything* a, Anything* b) {
    if (a->type === Type.Int32 && b->type === Type.Int32) {
        const auto value = reinterpret_cast<Int32*>(a)->value + reinterpret_cast<Int32*>(b)->value;
    }
}
