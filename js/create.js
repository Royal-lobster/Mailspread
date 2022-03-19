const templateForm = document.getElementById("templateForm");
const submitBtn = document.getElementById("submitBtn");
const bodyTextArea = document.getElementById("bodyTextArea");

// auto close baraces entered in textarea
const closeChars = new Map([["{", "}"]]);
bodyTextArea.addEventListener("keyup", (e) => {
  if (e.keyCode == 219) {
    const pos = e.target.selectionStart;
    const val = [...e.target.value];
    const char = val.slice(pos - 1, pos)[0];
    const closeChar = closeChars.get(char);
    if (closeChar) {
      val.splice(pos, 0, closeChar);
      e.target.value = val.join("");
      e.target.selectionEnd = pos;
    }
  }
});

// form submit function
templateForm.addEventListener("submit", function (e) {
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.textContent = "Generating...";

  e.preventDefault();

  const toAddress = templateForm.elements["toAddress"].value;
  const subject = templateForm.elements["subject"].value;
  const body = templateForm.elements["body"].value;

  //encode toAddress, subject, body to base64 each
  const EncodedToAddress = Base64.encode(toAddress);
  const EncodedSubject = Base64.encode(subject);
  const EncodedBody = Base64.encode(body);

  let copyAndEndLoading = () => {
    Toastify({
      text: "Copied to clipboard",
      style: {
        background: "linear-gradient(to right, #1ab3e6, #167D99)",
      },
    }).showToast();
    submitBtn.setAttribute("aria-busy", "");
    submitBtn.textContent = "Generate link";
  };
  let createAndCopyURL = async () => {
    //create a new URL at address /send.html
    const url = `${window.location.origin}/send.html?toAddress=${EncodedToAddress}&subject=${EncodedSubject}&body=${EncodedBody}`;

    //create a tiny url using tinyurl.com
    try {
      const tinyUrlRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${url}`,
        {
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      );
      if(tinyUrlRes.ok)
        await navigator.clipboard.writeText(await tinyUrlRes.text());
      else
        navigator.clipboard.writeText(url)
      copyAndEndLoading();
    } catch (e) {
      await navigator.clipboard.writeText(url);
      copyAndEndLoading();
    }
  };
  createAndCopyURL();
});

// modal open and close functions
const closeModal = () => {
  const modal = document.getElementById("modal");
  modal.removeAttribute("open");
};
const openModal = () => {
  const modal = document.getElementById("modal");
  modal.setAttribute("open", "");
};

// textarea template highlighting
$(".body-textarea").highlightWithinTextarea({
  highlight: [
    {
      highlight: /\{\{(.*?)\}\}/g,
      className: "blue-highlight",
    },
    {
      highlight: /:(.*?)}/g,
      className: "darker-highlight",
    },
    {
      highlight: /ba(na)*/gi,
      className: "yellow",
    },
  ],
});

//autosize textarea to grow its height dynamically
autosize($("textarea"));
