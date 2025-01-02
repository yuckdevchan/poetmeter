"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let syllableDecorationType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: 'rgba(255, 255, 0, 0.5)', // Пример: подсветка желтым цветом
    // color: 'black',
    // border: '1px solid black'
    });
    // Функция для подсчета слогов
    function countSyllables(text) {
        const vowels = /[аеёиоуыэюяaeiouy]/gi; // Гласные буквы
        const matches = text.match(vowels);
        return matches ? matches.length : 0;
    }
    // Функция для обновления декораций
    function updateSyllableDecorations(editor) {
        const text = editor.document.getText();
        const lines = text.split('\n');
        const lineDecorations = [];
        lines.forEach((line, index) => {
            const syllableCount = countSyllables(line);
            // Если слогов 0, не отображаем их
            if (syllableCount > 0) {
                const range = new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, line.length));
                lineDecorations.push({
                    range,
                    renderOptions: {
                        after: {
                            contentText: ` ${syllableCount}`,
                            color: 'green',
                            margin: '0 0 0 10px',
                            fontStyle: 'italic',
                        }
                    }
                });
            }
        });
        editor.setDecorations(syllableDecorationType, lineDecorations);
    }
    // Обработчик изменений в документе
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateSyllableDecorations(editor);
        }
    });
    // Изначальная активация при открытии редактора
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateSyllableDecorations(editor);
        }
    });
    // Команда для подсчета слогов (если нужна)
    let disposable = vscode.commands.registerCommand('syllableCounter.countSyllables', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            updateSyllableDecorations(editor);
        }
    });
    context.subscriptions.push(disposable);
}
//# sourceMappingURL=extension_prev.js.map