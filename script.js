const FormValidator = {
  fields: [
    {
      id: "name",
      regex: /^[А-ЯІЇЄҐ][а-яіїєґ']+\s[А-ЯІЇЄҐ]\.[А-ЯІЇЄҐ]\.$/,
      label: "ПІБ",
    },
    {
      id: "faculty",
      regex: /^[А-ЯІЇЄҐ]+$/,
      label: "Факультет",
    },
    {
      id: "birth",
      regex: /^\d{2}\.\d{2}\.\d{4}$/,
      label: "Дата народження",
    },
    {
      id: "address",
      regex: /^м\.\s[А-ЯІЇЄҐ][а-яіїєґ']+$/,
      label: "Адреса",
    },
    {
      id: "email",
      regex: /^[a-z]+@[a-z]+\.com$/,
      label: "Email",
    },
  ],

  validateField(input, regex) {
    const isValid = regex.test(input.value.trim());
    input.classList.toggle("error", !isValid);
    return isValid;
  },

  validate() {
    let allValid = true;

    this.fields.forEach((field) => {
      const input = document.getElementById(field.id);
      const isValid = this.validateField(input, field.regex);
      if (!isValid) allValid = false;
    });

    if (allValid) {
      const info = this.fields
        .map((field) => {
          const input = document.getElementById(field.id);
          return `<p><b>${field.label}:</b> ${input.value}</p>`;
        })
        .join("");
      const newWin = window.open("", "_blank", "width=400,height=400");
      newWin.document.write(`<h3>Введені дані:</h3>${info}`);
    } else {
      alert("Перевірте правильність полів");
    }
  },

  init() {
    document
      .getElementById("checkBtn")
      .addEventListener("click", () => this.validate());
  },
};

const TableManager = {
  variantNumber: 5,
  rows: 6,
  cols: 6,

  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },

  createTable() {
    const table = document.getElementById("variantTable");
    let num = 1;

    for (let i = 0; i < this.rows; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < this.cols; j++, num++) {
        const td = document.createElement("td");
        td.textContent = num;
        if (num === this.variantNumber) {
          td.addEventListener("mouseenter", () => {
            td.style.backgroundColor = this.getRandomColor();
          });
          td.addEventListener("click", () => {
            ColorPicker.open(td);
          });
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  },

  init() {
    this.createTable();
  },
};

const ColorPicker = {
  mainColors: [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800080",
    "#FFA500",
    "#008000",
    "#FFC0CB",
  ],
  customColors: JSON.parse(localStorage.getItem("customColors")) || [],
  currentColor: { r: 255, g: 0, b: 0, h: 0, s: 1, l: 0.5 },
  selectedCell: null,

  elements: {
    modal: document.getElementById("colorPickerModal"),
    colorCanvas: document.getElementById("colorCanvas"),
    hueCanvas: document.getElementById("hueCanvas"),
    hueInput: document.getElementById("hueInput"),
    contrastSlider: document.getElementById("contrast"),
    brightnessSlider: document.getElementById("brightness"),
    redInput: document.getElementById("red"),
    greenInput: document.getElementById("green"),
    blueInput: document.getElementById("blue"),
    selectedColorDisplay: document.getElementById("selectedColor"),
    mainColorsGrid: document.getElementById("mainColors"),
    customColorsGrid: document.getElementById("customColors"),
    addToCustomBtn: document.getElementById("addToCustom"),
    pickColorBtn: document.getElementById("pickColor"),
    okBtn: document.getElementById("okColor"),
    cancelBtn: document.getElementById("cancelColor"),
  },

  colorCtx: document.getElementById("colorCanvas").getContext("2d"),
  hueCtx: document.getElementById("hueCanvas").getContext("2d"),
  hueMarkerX: 0,

  rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  },

  hslToRgb(h, s, l) {
    h = h % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h / 360 + 1 / 3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, h / 360 - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  },

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: s,
      l: l,
    };
  },

  updateColorCanvas() {
    this.colorCtx.clearRect(
      0,
      0,
      this.elements.colorCanvas.width,
      this.elements.colorCanvas.height
    );
    for (let x = 0; x < this.elements.colorCanvas.width; x++) {
      for (let y = 0; y < this.elements.colorCanvas.height; y++) {
        const s = x / this.elements.colorCanvas.width;
        const l = 1 - y / this.elements.colorCanvas.height;
        const rgb = this.hslToRgb(this.currentColor.h, s, l);
        this.colorCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.colorCtx.fillRect(x, y, 1, 1);
      }
    }
  },

  updateHueCanvas() {
    this.hueCtx.clearRect(
      0,
      0,
      this.elements.hueCanvas.width,
      this.elements.hueCanvas.height
    );
    for (let x = 0; x < this.elements.hueCanvas.width; x++) {
      const h = (x / this.elements.hueCanvas.width) * 360;
      const rgb = this.hslToRgb(h, 1, 0.5);
      this.hueCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      this.hueCtx.fillRect(x, 0, 1, this.elements.hueCanvas.height);
    }
    this.hueMarkerX =
      (this.currentColor.h / 360) * this.elements.hueCanvas.width;
    this.hueCtx.fillStyle = "black";
    this.hueCtx.fillRect(
      this.hueMarkerX - 1.5,
      0,
      3,
      this.elements.hueCanvas.height
    );
  },

  updateColorUI() {
    const rgb = this.hslToRgb(
      this.currentColor.h,
      this.currentColor.s,
      this.currentColor.l
    );
    this.currentColor.r = rgb.r;
    this.currentColor.g = rgb.g;
    this.currentColor.b = rgb.b;
    const hexColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.elements.selectedColorDisplay.style.backgroundColor = hexColor;
    this.elements.redInput.value = rgb.r;
    this.elements.greenInput.value = rgb.g;
    this.elements.blueInput.value = rgb.b;
    this.elements.hueInput.value = this.currentColor.h;
    this.elements.contrastSlider.value = Math.round(this.currentColor.s * 100);
    this.elements.brightnessSlider.value = Math.round(
      this.currentColor.l * 100
    );
    this.updateColorCanvas();
    this.updateHueCanvas();
  },

  initMainColors() {
    this.elements.mainColorsGrid.innerHTML = "";
    this.mainColors.forEach((color) => {
      const div = document.createElement("div");
      div.style.backgroundColor = color;
      div.addEventListener("click", () => this.selectColorFromGrid(color));
      this.elements.mainColorsGrid.appendChild(div);
    });
  },

  initCustomColors() {
    this.elements.customColorsGrid.innerHTML = "";
    this.customColors.forEach((color) => {
      const div = document.createElement("div");
      div.style.backgroundColor = color;
      div.addEventListener("click", () => this.selectColorFromGrid(color));
      this.elements.customColorsGrid.appendChild(div);
    });
  },

  selectColorFromGrid(color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    this.currentColor.r = r;
    this.currentColor.g = g;
    this.currentColor.b = b;
    const hsl = this.rgbToHsl(r, g, b);
    this.currentColor.h = hsl.h;
    this.currentColor.s = hsl.s;
    this.currentColor.l = hsl.l;
    this.updateColorUI();
  },

  open(cell) {
    this.selectedCell = cell;
    this.elements.modal.style.display = "flex";
    this.updateColorUI();
  },

  close() {
    this.elements.modal.style.display = "none";
    this.selectedCell = null;
  },

  initEvents() {
    this.elements.colorCanvas.addEventListener("click", (e) => {
      const rect = this.elements.colorCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pixel = this.colorCtx.getImageData(x, y, 1, 1).data;
      this.currentColor.r = pixel[0];
      this.currentColor.g = pixel[1];
      this.currentColor.b = pixel[2];
      const hsl = this.rgbToHsl(
        this.currentColor.r,
        this.currentColor.g,
        this.currentColor.b
      );
      this.currentColor.h = hsl.h;
      this.currentColor.s = hsl.s;
      this.currentColor.l = hsl.l;
      this.updateColorUI();
    });

    this.elements.hueCanvas.addEventListener("mousedown", (e) => {
      const updateHue = (event) => {
        const rect = this.elements.hueCanvas.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(this.elements.hueCanvas.width, event.clientX - rect.left)
        );
        this.currentColor.h = Math.round(
          (x / this.elements.hueCanvas.width) * 360
        );
        this.elements.hueInput.value = this.currentColor.h;
        this.updateColorUI();
      };
      updateHue(e);
      const onMouseMove = (moveEvent) => updateHue(moveEvent);
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    this.elements.hueInput.addEventListener("input", () => {
      this.currentColor.h = parseInt(this.elements.hueInput.value) || 0;
      this.updateColorUI();
    });

    this.elements.contrastSlider.addEventListener("input", () => {
      this.currentColor.s =
        (parseInt(this.elements.contrastSlider.value) || 0) / 100;
      this.updateColorUI();
    });

    this.elements.brightnessSlider.addEventListener("input", () => {
      this.currentColor.l =
        (parseInt(this.elements.brightnessSlider.value) || 0) / 100;
      this.updateColorUI();
    });

    this.elements.redInput.addEventListener("input", () => {
      this.currentColor.r = parseInt(this.elements.redInput.value) || 0;
      const hsl = this.rgbToHsl(
        this.currentColor.r,
        this.currentColor.g,
        this.currentColor.b
      );
      this.currentColor.h = hsl.h;
      this.currentColor.s = hsl.s;
      this.currentColor.l = hsl.l;
      this.updateColorUI();
    });

    this.elements.greenInput.addEventListener("input", () => {
      this.currentColor.g = parseInt(this.elements.greenInput.value) || 0;
      const hsl = this.rgbToHsl(
        this.currentColor.r,
        this.currentColor.g,
        this.currentColor.b
      );
      this.currentColor.h = hsl.h;
      this.currentColor.s = hsl.s;
      this.currentColor.l = hsl.l;
      this.updateColorUI();
    });

    this.elements.blueInput.addEventListener("input", () => {
      this.currentColor.b = parseInt(this.elements.blueInput.value) || 0;
      const hsl = this.rgbToHsl(
        this.currentColor.r,
        this.currentColor.g,
        this.currentColor.b
      );
      this.currentColor.h = hsl.h;
      this.currentColor.s = hsl.s;
      this.currentColor.l = hsl.l;
      this.updateColorUI();
    });

    this.elements.addToCustomBtn.addEventListener("click", () => {
      const hexColor = this.rgbToHex(
        this.currentColor.r,
        this.currentColor.g,
        this.currentColor.b
      );
      if (!this.customColors.includes(hexColor)) {
        this.customColors.push(hexColor);
        localStorage.setItem("customColors", JSON.stringify(this.customColors));
        this.initCustomColors();
      }
    });

    this.elements.pickColorBtn.addEventListener("click", async () => {
      if (!window.EyeDropper) {
        alert(
          "Ваш браузер не підтримує функцію визначення кольору"
        );
        return;
      }
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        const color = result.sRGBHex;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this.currentColor.r = r;
        this.currentColor.g = g;
        this.currentColor.b = b;
        const hsl = this.rgbToHsl(r, g, b);
        this.currentColor.h = hsl.h;
        this.currentColor.s = hsl.s;
        this.currentColor.l = hsl.l;
        this.updateColorUI();
      } catch (err) {
        alert("Не вдалося вибрати колір");
      }
    });

    this.elements.okBtn.addEventListener("click", () => {
      if (this.selectedCell) {
        this.selectedCell.style.backgroundColor = this.rgbToHex(
          this.currentColor.r,
          this.currentColor.g,
          this.currentColor.b
        );
      }
      this.close();
    });

    this.elements.cancelBtn.addEventListener("click", () => this.close());

    window.addEventListener("click", (e) => {
      if (e.target === this.elements.modal) {
        this.close();
      }
    });
  },

  init() {
    this.initMainColors();
    this.initCustomColors();
    this.initEvents();
    this.updateColorCanvas();
    this.updateHueCanvas();
  },
};

FormValidator.init();
TableManager.init();
ColorPicker.init();
