import plyvel
import os

def scan_wallet_db(folder):
    print(f"📂 Scanning LevelDB folder: {folder}")
    db = plyvel.DB(folder, create_if_missing=False)

    for key, value in db:
        try:
            k = key.decode("utf-8", errors="ignore")
            v = value.decode("utf-8", errors="ignore")

            if any(x in k.lower() for x in ['xpub', 'xprv', 'hdseed', 'key', 'addr', 'tx']):
                print(f"\n🔑 KEY: {k}\n📦 VALUE: {v}")
            elif b'xprv' in value or b'xpub' in value:
                print(f"\n🔍 Embedded Key Match:\nKEY: {k}\nVALUE HEX: {value.hex()}")
        except Exception:
            continue

    db.close()
    print("\n✅ Scan complete.")

# 🔧 Set your wallet path here:
wallet_folder = r"C:\Users\brett\AppData\Local\Application Data\Application Data\Bitcoin"
scan_wallet_db(wallet_folder)
