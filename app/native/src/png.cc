#include <vector>
#include <sstream>
#include <png++/png.hpp>

#include "png.h"

void Png::Init(v8::Local<v8::Object> exports) {
    exports->Set(Nan::New("decode").ToLocalChecked(),
                     Nan::New<v8::FunctionTemplate>(DecodeSync)->GetFunction());
}

void Png::DecodeSync(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    try {
        auto buffer = Nan::To<v8::Object>(info[0]).ToLocalChecked();

        std::string str(node::Buffer::Data(buffer), node::Buffer::Length(buffer));
        std::stringstream stream(str, std::ios_base::in | std::ios_base::binary);

        png::image<png::index_pixel> image(stream);

        auto result = Nan::New<v8::Object>();

        auto pixels = std::vector<char>(image.get_width() * image.get_height());

        for (size_t y = 0, i = 0; y < image.get_height(); ++y) {
            for (size_t x = 0; x < image.get_width(); ++x) {
                pixels[i++] = image[y][x];
            }
        }

        auto pal = image.get_palette();
        auto trns = image.get_tRNS();
        bool alpha = trns.size() > 0;

        auto palette = Nan::New<v8::Array>();
        for (size_t i = 0; i < pal.size(); ++i) {
            auto color = Nan::New<v8::Array>();

            color->Set(0, Nan::New(pal[i].red));
            color->Set(1, Nan::New(pal[i].green));
            color->Set(2, Nan::New(pal[i].blue));

            if (alpha) {
                color->Set(3, Nan::New(trns[i]));
            }

            palette->Set(i, color);
        }

        Nan::Set(result, Nan::New("width").ToLocalChecked(), Nan::New(image.get_width()));
        Nan::Set(result, Nan::New("height").ToLocalChecked(), Nan::New(image.get_height()));
        Nan::Set(result, Nan::New("alpha").ToLocalChecked(), Nan::New(alpha));
        Nan::Set(result, Nan::New("pixels").ToLocalChecked(),
                 Nan::CopyBuffer(&pixels[0], pixels.size()).ToLocalChecked());
        Nan::Set(result, Nan::New("palette").ToLocalChecked(), palette);

        info.GetReturnValue().Set(result);
    } catch (png::error& e) {
        Nan::ThrowError(e.what());
    }
}
