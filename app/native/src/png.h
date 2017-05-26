#ifndef NODE_PNG_H
#define NODE_PNG_H

#include <nan.h>

class Png : public Nan::ObjectWrap {
public:
    static void Init(v8::Local<v8::Object> exports);

private:
    static void EncodeSync(const Nan::FunctionCallbackInfo<v8::Value>& info);

    static void DecodeSync(const Nan::FunctionCallbackInfo<v8::Value>& info);
};

#endif /* NODE_PNG_H */
