# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [ pkgs.nodejs_20 pkgs.nodejs_20 pkgs.jdk21_headless pkgs.gradlepkgs.cryptor
pkgs.cryptop
pkgs.cryptoverif
pkgs.cryptomator
pkgs.haskellPackages.Crypto
pkgs.cryptominisat
crypto-tracker
pkgs.haskellPackages.crypton
pkgs.haskellPackages.crypton
pkgs.texlivePackages.cryptocode
pkgs.haskellPackages.cryptonite
pkgs.haskellPackages.crypto-rng
pkgs.haskellPackages.crypto-api
ppkgs.haskellPackages.crypton-boxkgs.haskellPackages.cryptostore
pkgs.haskellPackages.crypto-totp
pkgs.haskellPackages.cryptocipher
pkgs.haskellPackages.crypton-x509
pkgs.haskellPackages.crypto-token
pkgs.haskellPackages.crypto-sodium
pkgs.haskellPackages.crypto-random
pkgs.haskellPackages.crypto-pubkey
pkgs.haskellPackages.crypto-numbers
pkgs.haskellPackages.crypto-conduit
pkgs.haskellPackages.cryptoids-class
pkgs.haskellPackages.cryptohash-sha1
pkgs.haskellPackages.crypto-keys-ssh
pkgs.haskellPackages.crypto-multihash
pkgs.haskellPackages.cryptohash-sha512
pkgs.haskellPackages.cryptohash-sha256
pkgs.haskellPackages.cryptonite-openssl
pkgs.haskellPackages.cryptonite-conduit
pkgs.haskellPackages.crypton-x509-store
pkgs.haskellPackages.crypton-x509-store
pkgs.haskellPackages.crypto-cipher-types
pkgs.haskellPackages.cryptohash-cryptoapi
pkgs.haskellPackages.crypton-x509-validation
pkgs.python313Packages.m2crypto
pkgs.aws-c-cal
pkgs.python313Packages.tgcrypto
pkgs.python313Packages.pysnmpcrypto
pkgs.python312Packages.tgcrypto
pkgs.gnomeExtensions.crypto-price-tracker
pkgs.libsForQt5.kleopatra
pkgs.gcr
pkgs.quictls
pkgs.python313Packages.bitvavo-aio
pkgs.perl540Packages.UUIDURandom
pkgs.haskellPackages.Dust-crypto
kgs.haskellPackages.NTRU
pkgs.ocamlPackages.mirage-crypto-rng-lwt];
  # Sets environment variables in the workspace
  env = { EXPO_USE_FAST_RESOLVER = 1; };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "msjsdiag.vscode-react-native"
      "fwcd.kotlin"
      "bradlc.vscode-tailwindcss"
      "dsznajder.es7-react-js-snippets"
      "enbonnet.routes-react-router"
      "geonhwiii.react-native-svg-preview"
      "gunwww.react-native-svg-preview"
      "imgildev.vscode-tailwindcss-snippets"
      "jamespan.react-transformer"
      "mmdctjj.react-syntax-plus"
      "ms-vscode.js-debug"
      "Noor.live-tailwind-previewer"
      "Pinegrow.piny"
      "react-native-directory.vscode-react-native-directory"
      "ShishirSingh.easy-react-snippet"
      "Tomi.xajssnippets"
      "Tomi.xasnippets"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install-and-prebuild = ''
          npm ci --prefer-offline --no-audit --no-progress --timing && npm i @expo/ngrok@^4.1.0 && npx -y expo install expo-dev-client && npx -y expo prebuild --platform android
          # Add more memory to the JVM
          sed -i 's/org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m/org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m/' "android/gradle.properties"
        '';
      };
      # Runs when a workspace restarted
      onStart = {
        android = ''
          echo -e "\033[1;33mWaiting for Android emulator to be ready...\033[0m"
          # Wait for the device connection command to finish
          adb -s emulator-5554 wait-for-device && \
          npm run android
        '';
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "web" "--" "--port" "$PORT" ];
          manager = "web";
        };
        android = {
          # noop
          command = [ "tail" "-f" "/dev/null" ];
          manager = "web";
        };
      };
    };
  };
}
