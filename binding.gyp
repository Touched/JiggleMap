{
  "variables": {
    "src_dir": "./app/native/src"
  },
  "targets": [
    {
      "target_name": "jigglemap_native",
      "sources": [
        "<(src_dir)/init.cc",
        "<(src_dir)/png.cc",
      ],
      "include_dirs": [
        "./app/native/include",
        "<!(node -e \"require('nan')\")",
      ],
      "dependencies": [
        "./app/native/third-party/libpng/libpng.gyp:libpng"
      ],
      "conditions": [
        [ "OS=='mac'", {
            "xcode_settings": {
                "OTHER_CPLUSPLUSFLAGS" : ["-std=c++11", "-stdlib=libc++"],
                "OTHER_LDFLAGS": ["-stdlib=libc++"],
                "MACOSX_DEPLOYMENT_TARGET": "10.7",
                "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
            }
        }],
        [ "OS=='linux'", {
            "cflags": ["-std=c++0x"],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"]
        }],
        [ "OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "AdditionalOptions": ["/EHsc", "/wd4506"]
            },
            "VCLinkerTool": {
              "GenerateDebugInformation": "false" # Avoid 'incorrect MSPDB120.DLL version' link error
            }
          }
        }]
      ]
    }
  ]
}
