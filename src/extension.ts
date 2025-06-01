import * as vscode from 'vscode';
// Fallback: simple vowel-count function
let syllableFn: (text: string) => number = (text: string) => {
  const m = text.match(/[aeiouy]/gi);
  return m ? m.length : 0;
};
// Dynamically import `syllable` ESM module for accurate counts
(async () => {
  try {
    const mod = (await import('syllable')) as { syllable: (text: string) => number };
    syllableFn = mod.syllable;
  } catch {
    // If import fails, fallback will be used
  }
})();

export function activate(context: vscode.ExtensionContext) {
  let syllableDecorationType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: 'rgba(255, 255, 0, 0.5)', // Пример: подсветка желтым цветом
    // color: 'black',
    // border: '1px solid black'
  });





  // Функция для подсчета слогов
  function countSyllables(text: string): number {
    try {
      return syllableFn(text);
    } catch {
      // Should never throw, but fallback to vowel count
      const m = text.match(/[aeiouy]/gi);
      return m ? m.length : 0;
    }
  }



  // Функция для обновления декораций
  function updateSyllableDecorations(editor: vscode.TextEditor) {
    const text = editor.document.getText();
    const lines = text.split('\n');
    const lineDecorations: vscode.DecorationOptions[] = [];

    lines.forEach((line, index) => {
      const syllableCount = countSyllables(line);

      // Если слогов 0, не отображаем их
      if (syllableCount > 0) {
        const range = new vscode.Range(
          new vscode.Position(index, 0),
          new vscode.Position(index, line.length)
        );
        lineDecorations.push({
          range,
          renderOptions: {
            after: {
              contentText: ` ${syllableCount} `,
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


///////////////////////////////////////////////

// Генерация карты строки
function generatePoetMap(line: string): string {
  return line
    .split(/\s+/) // Разбиваем строку на слова по пробелам
    .map(word => {
      // Обрабатываем каждое слово
      let wordMap = word
        .split('') // Разбиваем слово на символы
        .map(char => {
          if (/[^а-яa-zё]/gi.test(char)) { return ''; } // Убираем лишние символы
          if (/[аеёиоуыэюяaeiouy]/i.test(char)) { return '|'; } // Гласные -> '|'
          if (/[а-яa-z]/i.test(char)) { return '.'; } // Согласные -> '.'
          return ''; // Всё остальное игнорируем
        })
        .join(''); // Объединяем символы в строку
      
      // Убираем последовательности точек внутри слова
      return wordMap.replace(/\.{2,}/g, '.');
    })
    .join(''); // Соединяем обработанные слова обратно в строку
}



  // Функция для обновления карты
  function updatePoetMap(editor: vscode.TextEditor) {
    const text = editor.document.getText();
    const lines = text.split('\n');
    const poetMaps = lines.map(line => generatePoetMap(line)).join('\n');

    vscode.workspace.openTextDocument({ content: poetMaps, language: 'plaintext' })
      .then(doc => {
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside).then(mapEditor => {
          // Обновляем карту при изменении текста
          vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document === editor.document) {
              const updatedText = editor.document.getText();
              const updatedLines = updatedText.split('\n');
              const updatedPoetMaps = updatedLines.map(line => generatePoetMap(line)).join('\n');
              mapEditor.edit(editBuilder => {
                editBuilder.replace(new vscode.Range(0, 0, mapEditor.document.lineCount, 0), updatedPoetMaps);
              });
            }
          });
        });
      });
  }


///////////////////////////////////////////////


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

// Команда для генерации карты
let poetMapCommand = vscode.commands.registerCommand('syllableCounter.poetmap', () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    updatePoetMap(editor);
  }
});



  context.subscriptions.push(disposable);
}
