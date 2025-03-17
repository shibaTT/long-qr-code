import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import * as pako from "pako";
import { encode as base64Encode, decode as base64Decode } from "js-base64";
import "./App.css";

function App() {
    const [inputText, setInputText] = useState("");
    const [qrData, setQrData] = useState("");
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodedText, setDecodedText] = useState("");

    // テキストをUint8Arrayに変換
    const textToUint8Array = (text: string): Uint8Array => {
        return new TextEncoder().encode(text);
    };

    // Uint8Arrayをテキストに変換
    const uint8ArrayToText = (array: Uint8Array): string => {
        return new TextDecoder().decode(array);
    };

    // URLからデコードされたテキストを取得
    React.useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const data = queryParams.get("data");
        if (data) {
            try {
                const binaryString = base64Decode(data);
                const binaryData = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
                const decompressed = uint8ArrayToText(pako.inflate(binaryData));
                setDecodedText(decompressed);
                setIsDecoding(true);
            } catch (error) {
                console.error("デコードエラー:", error);
            }
        }
    }, []);

    // テキストを圧縮してQRコードデータを生成
    const generateQRCode = () => {
        try {
            const binaryData = textToUint8Array(inputText);
            const compressed = pako.deflate(binaryData);
            const binaryString = Array.from(compressed, (byte) => String.fromCharCode(byte)).join(
                ""
            );
            const encoded = base64Encode(binaryString);
            const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
            setQrData(url);
        } catch (error) {
            console.error("エンコードエラー:", error);
            alert("エラーが発生しました。テキストを確認してください。");
        }
    };

    if (isDecoding) {
        return (
            <div className="App">
                <h1>デコードされたテキスト</h1>
                <div className="decoded-text">{decodedText}</div>
            </div>
        );
    }

    return (
        <div className="App">
            <h1>長文QRコード生成</h1>
            <div className="container">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="ここに長文を入力してください"
                    rows={10}
                />
                <div className="controls">
                    <button onClick={generateQRCode} disabled={!inputText}>
                        QRコード生成
                    </button>
                    <div className="stats">文字数: {inputText.length} / 30000（目安）</div>
                </div>
                {qrData && (
                    <div className="qr-container">
                        <QRCodeCanvas value={qrData} size={256} level="H" />
                        <p className="help-text">
                            このQRコードをスキャンすると、圧縮された内容を含むURLが表示されます。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
