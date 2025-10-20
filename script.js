const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "text/x-c++src",
  theme: "dracula",
  lineNumbers: true,
  tabSize: 2,
});

editor.setValue(`#include <bits/stdc++.h>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(0);
    cout << "hello world!";
}`);

const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  toggleBtn.textContent = light ? "🌗 Dark" : "🌙 Light";
  editor.setOption("theme", light ? "eclipse" : "dracula");
});

document.getElementById("run-btn").addEventListener("click", async () => {
  const code = editor.getValue();
  const input = document.getElementById("input").value;
  const outputArea = document.getElementById("output");

  outputArea.textContent = "⏳ Running...";

  const encodedSource = btoa(unescape(encodeURIComponent(code)));
  const encodedInput = btoa(unescape(encodeURIComponent(input)));

  try {
    // 🔹 ส่ง request ไปที่ Judge0 CE
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "408d15886emsh920000823e3000ep1edbd0jsn5f5b3c245839"  // ใส่ API key ของคุณ
      },
      body: JSON.stringify({
        language_id: 54, // C++ (GCC 9.2.0)
        source_code: encodedSource,
        stdin: encodedInput
      })
    });

    const result = await response.json();

    if (result.stdout) {
      const decoded = decodeURIComponent(escape(atob(result.stdout)));
      outputArea.textContent = decoded;
    } else if (result.stderr) {
      const decoded = decodeURIComponent(escape(atob(result.stderr)));
      outputArea.textContent = "⚠️ Runtime Error:\n" + decoded;
    } else if (result.compile_output) {
      const decoded = decodeURIComponent(escape(atob(result.compile_output)));
      outputArea.textContent = "❌ Compilation Error:\n" + decoded;
    } else {
      outputArea.textContent = "No output.";
    }
  } catch (err) {
    outputArea.textContent = "❌ Error connecting to Judge0 API:\n" + err.message;
  }
});
