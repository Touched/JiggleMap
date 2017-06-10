#include <nan.h>
#include "png.h"

void InitAll(v8::Local<v8::Object> exports) {
    Png::Init(exports);
}

NODE_MODULE(png, InitAll)
