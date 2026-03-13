var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-brand.js
  function getComponentJson(element, selector) {
    const el = element.querySelector(`${selector}[data-json]`);
    if (el) return el.getAttribute("data-json");
    const script = element.querySelector(`${selector} script[type="application/json"]`);
    if (script) return script.textContent;
    return null;
  }
  function parse(element, { document }) {
    const raw = getComponentJson(element, "bsx-hero");
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    const cells = [];
    if (data.heroImage && data.heroImage.desktopSrc) {
      const img = document.createElement("img");
      img.src = data.heroImage.desktopSrc;
      img.alt = data.heroImageAltText || "";
      cells.push([img]);
    }
    const contentDiv = document.createElement("div");
    if (data.heroTitle) {
      const h1 = document.createElement("h1");
      h1.textContent = data.heroTitle;
      contentDiv.append(h1);
    }
    if (data.heroSubtitle) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = data.heroSubtitle;
      const paras = wrapper.querySelectorAll("p");
      paras.forEach((p) => contentDiv.append(p));
      if (paras.length === 0 && wrapper.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = wrapper.textContent.trim();
        contentDiv.append(p);
      }
    }
    if (data.heroActions && data.heroActions.children) {
      const actionP = document.createElement("p");
      data.heroActions.children.forEach((action) => {
        if (action.href || action.children) {
          const a = document.createElement("a");
          a.href = action.href || "#";
          a.textContent = action.children || action.text || "";
          actionP.append(a);
          actionP.append(document.createTextNode(" "));
        }
      });
      if (actionP.childNodes.length > 0) contentDiv.append(actionP);
    }
    if (contentDiv.childNodes.length > 0) {
      cells.push([contentDiv]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-brand", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function getAllComponentJson(element, selector) {
    const els = element.querySelectorAll(`${selector}[data-json]`);
    if (els.length > 0) {
      return Array.from(els).map((el) => ({ json: el.getAttribute("data-json"), el }));
    }
    const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
    return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
  }
  function parse2(element, { document }) {
    const items = getAllComponentJson(element, "bsx-card-base");
    if (!items.length) return;
    const cells = [];
    items.forEach(({ json }) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        return;
      }
      const imgCol = document.createElement("div");
      if (data.cardMedia && data.cardMedia.src) {
        const img = document.createElement("img");
        img.src = data.cardMedia.src;
        imgCol.append(img);
      }
      const contentCol = document.createElement("div");
      if (data.cardContent && data.cardContent.children) {
        data.cardContent.children.forEach((child) => {
          if (child.component === "h5") {
            const h5 = document.createElement("h5");
            h5.textContent = child.children;
            contentCol.append(h5);
          } else if (child.component === "span" && child.children) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = child.children;
            Array.from(wrapper.children).forEach((el) => contentCol.append(el));
          }
        });
      }
      if (data.cardActions && data.cardActions.children) {
        const actionP = document.createElement("p");
        data.cardActions.children.forEach((action) => {
          if (action.link || action.text) {
            const a = document.createElement("a");
            a.href = action.link || "#";
            a.textContent = action.text || "";
            actionP.append(a);
            actionP.append(document.createTextNode(" "));
          }
        });
        if (actionP.childNodes.length > 0) contentCol.append(actionP);
      }
      cells.push([imgCol, contentCol]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function getContentCardJson(element) {
    const el = element.querySelector("bsx-content-card[data-json]");
    if (el) {
      return el.getAttribute("data-json").split("|||").map((s) => s.trim());
    }
    const scripts = element.querySelectorAll('bsx-content-card script[type="application/json"]');
    return Array.from(scripts).map((s) => s.textContent);
  }
  function parse3(element, { document }) {
    const jsonParts = getContentCardJson(element);
    if (!jsonParts.length) return;
    let data;
    for (const part of jsonParts) {
      try {
        const parsed = JSON.parse(part);
        if (parsed.title) {
          data = parsed;
          break;
        }
      } catch (e) {
      }
    }
    if (!data) return;
    const textCol = document.createElement("div");
    if (data.title) {
      const h4 = document.createElement("h4");
      h4.textContent = data.title;
      textCol.append(h4);
    }
    if (data.bodyText) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = data.bodyText;
      Array.from(wrapper.children).forEach((el) => textCol.append(el));
    }
    if (data.cardActions && data.cardActions.children) {
      const actionP = document.createElement("p");
      data.cardActions.children.forEach((action) => {
        if (action.href || action.text) {
          const a = document.createElement("a");
          a.href = action.href || "#";
          a.textContent = action.text || "";
          actionP.append(a);
          actionP.append(document.createTextNode(" "));
        }
      });
      if (actionP.childNodes.length > 0) textCol.append(actionP);
    }
    if (data.cardIcons && data.cardIcons.children) {
      const ul = document.createElement("ul");
      data.cardIcons.children.forEach((icon) => {
        if (icon.iconText) {
          const li = document.createElement("li");
          li.textContent = icon.iconText;
          ul.append(li);
        }
      });
      if (ul.children.length > 0) textCol.append(ul);
    }
    const imgCol = document.createElement("div");
    if (data.assets && data.assets.desktopSrc) {
      const img = document.createElement("img");
      img.src = data.assets.desktopSrc;
      img.alt = data.imageAltText || "";
      imgCol.append(img);
    }
    const cells = [[textCol, imgCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-bento.js
  function getAllComponentJson2(element, selector) {
    const els = element.querySelectorAll(`${selector}[data-json]`);
    if (els.length > 0) {
      return Array.from(els).map((el) => ({ json: el.getAttribute("data-json"), el }));
    }
    const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
    return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
  }
  function getImageJson(imgEl) {
    if (imgEl.hasAttribute("data-json")) return imgEl.getAttribute("data-json");
    const script = imgEl.querySelector('script[type="application/json"]');
    return script ? script.textContent : null;
  }
  function parse4(element, { document }) {
    const cells = [];
    const cardItems = getAllComponentJson2(element, "bsx-card-base");
    const pairedImages = /* @__PURE__ */ new Set();
    cardItems.forEach(({ json, el: cardEl }) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        return;
      }
      const parentDiv = cardEl.parentElement;
      const grandParent = parentDiv ? parentDiv.parentElement : null;
      const siblingImageEl = grandParent ? grandParent.querySelector("bsx-image") : null;
      const imgCol = document.createElement("div");
      if (siblingImageEl) {
        pairedImages.add(siblingImageEl);
        const imgJson = getImageJson(siblingImageEl);
        if (imgJson) {
          try {
            const imgData = JSON.parse(imgJson);
            if (imgData.assets && imgData.assets.desktopSrc) {
              const img = document.createElement("img");
              img.src = imgData.assets.desktopSrc;
              imgCol.append(img);
            }
          } catch (e) {
          }
        }
      }
      const contentCol = document.createElement("div");
      if (data.cardContent && data.cardContent.children) {
        data.cardContent.children.forEach((item) => {
          if (item.component === "span" && item.children) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = item.children;
            Array.from(wrapper.children).forEach((el) => contentCol.append(el));
          }
        });
      }
      if (data.cardActions && data.cardActions.children) {
        const actionP = document.createElement("p");
        data.cardActions.children.forEach((action) => {
          if (action.link || action.text) {
            const a = document.createElement("a");
            a.href = action.link || "#";
            a.textContent = action.text || "";
            actionP.append(a);
          }
        });
        if (actionP.childNodes.length > 0) contentCol.append(actionP);
      }
      cells.push([imgCol, contentCol]);
    });
    const allImageEls = element.querySelectorAll("bsx-image");
    allImageEls.forEach((imgEl) => {
      if (pairedImages.has(imgEl)) return;
      const imgJson = getImageJson(imgEl);
      if (!imgJson) return;
      try {
        const imgData = JSON.parse(imgJson);
        if (imgData.assets && imgData.assets.desktopSrc) {
          const img = document.createElement("img");
          img.src = imgData.assets.desktopSrc;
          cells.push([img]);
        }
      } catch (e) {
      }
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-bento", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function getAllComponentJson3(element, selector) {
    const els = element.querySelectorAll(`${selector}[data-json]`);
    if (els.length > 0) {
      return Array.from(els).map((el) => ({ json: el.getAttribute("data-json"), el }));
    }
    const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
    return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
  }
  function parse5(element, { document }) {
    const items = getAllComponentJson3(element, "bsx-card-base");
    if (!items.length) return;
    const cells = [];
    items.forEach(({ json }) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        return;
      }
      const imgCol = document.createElement("div");
      if (data.cardMedia && data.cardMedia.src) {
        const img = document.createElement("img");
        img.src = data.cardMedia.src;
        imgCol.append(img);
      }
      const contentCol = document.createElement("div");
      if (data.cardHeader) {
        if (data.cardHeader.title) {
          const h4 = document.createElement("h4");
          h4.textContent = data.cardHeader.title;
          contentCol.append(h4);
        }
        if (data.cardHeader.subheader) {
          const p = document.createElement("p");
          p.textContent = data.cardHeader.subheader;
          contentCol.append(p);
        }
      }
      if (data.cardContent && data.cardContent.children) {
        data.cardContent.children.forEach((child) => {
          if (child.component === "h6") {
            const h6 = document.createElement("h6");
            h6.textContent = child.children;
            contentCol.append(h6);
          } else if (child.component === "h5") {
            const h5 = document.createElement("h5");
            h5.textContent = child.children;
            contentCol.append(h5);
          } else if (child.component === "span" && child.children) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = child.children;
            Array.from(wrapper.children).forEach((el) => contentCol.append(el));
          }
        });
      }
      if (data.cardActions && data.cardActions.children) {
        const actionP = document.createElement("p");
        data.cardActions.children.forEach((action) => {
          if (action.link || action.text) {
            const a = document.createElement("a");
            a.href = action.link || "#";
            a.textContent = action.text || "";
            actionP.append(a);
            actionP.append(document.createTextNode(" "));
          }
        });
        if (actionP.childNodes.length > 0) contentCol.append(actionP);
      }
      cells.push([imgCol, contentCol]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-showcase.js
  function getContentCardJson2(element) {
    const el = element.querySelector("bsx-content-card[data-json]");
    if (el) {
      return el.getAttribute("data-json").split("|||").map((s) => s.trim());
    }
    const scripts = element.querySelectorAll('bsx-content-card script[type="application/json"]');
    return Array.from(scripts).map((s) => s.textContent);
  }
  function parse6(element, { document }) {
    const jsonParts = getContentCardJson2(element);
    if (!jsonParts.length) return;
    let data;
    for (const part of jsonParts) {
      try {
        const parsed = JSON.parse(part);
        if (parsed.title) {
          data = parsed;
          break;
        }
      } catch (e) {
      }
    }
    if (!data) return;
    const imgCol = document.createElement("div");
    if (data.assets && data.assets.desktopSrc) {
      const img = document.createElement("img");
      img.src = data.assets.desktopSrc;
      img.alt = data.imageAltText || "";
      imgCol.append(img);
    }
    const textCol = document.createElement("div");
    if (data.title) {
      const h4 = document.createElement("h4");
      h4.textContent = data.title;
      textCol.append(h4);
    }
    if (data.subTitle) {
      const h6 = document.createElement("h6");
      h6.textContent = data.subTitle;
      textCol.append(h6);
    }
    if (data.bodyText) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = data.bodyText;
      Array.from(wrapper.children).forEach((el) => textCol.append(el));
    }
    if (data.cardActions && data.cardActions.children) {
      const actionP = document.createElement("p");
      data.cardActions.children.forEach((action) => {
        if (action.href || action.text) {
          const a = document.createElement("a");
          a.href = action.href || "#";
          a.textContent = action.text || "";
          actionP.append(a);
          actionP.append(document.createTextNode(" "));
        }
      });
      if (actionP.childNodes.length > 0) textCol.append(actionP);
    }
    const cells = [[imgCol, textCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function getAllComponentJson4(element, selector) {
    const els = element.querySelectorAll(`${selector}[data-json]`);
    if (els.length > 0) {
      return Array.from(els).map((el) => ({ json: el.getAttribute("data-json"), el }));
    }
    const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
    return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
  }
  function parse7(element, { document }) {
    const items = getAllComponentJson4(element, "bsx-card-base");
    if (!items.length) return;
    const cells = [];
    items.forEach(({ json }) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        return;
      }
      const imgCol = document.createElement("div");
      if (data.cardMedia && data.cardMedia.src) {
        const img = document.createElement("img");
        img.src = data.cardMedia.src;
        imgCol.append(img);
      }
      const contentCol = document.createElement("div");
      if (data.cardContent && data.cardContent.children) {
        data.cardContent.children.forEach((child) => {
          if (child.component === "h6") {
            const h6 = document.createElement("h6");
            h6.textContent = child.children;
            contentCol.append(h6);
          } else if (child.cardCategories) {
            const p = document.createElement("p");
            p.textContent = child.cardCategories.join(", ");
            contentCol.append(p);
          } else if (child.component === "span" && child.children) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = child.children;
            Array.from(wrapper.children).forEach((el) => contentCol.append(el));
          }
        });
      }
      if (data.cardLinkURL) {
        const a = document.createElement("a");
        a.href = data.cardLinkURL;
        a.textContent = "";
        const p = document.createElement("p");
        p.append(a);
        contentCol.append(p);
      }
      cells.push([imgCol, contentCol]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-support.js
  function getAllComponentJson5(element, selector) {
    const els = element.querySelectorAll(`${selector}[data-json]`);
    if (els.length > 0) {
      return Array.from(els).map((el) => ({ json: el.getAttribute("data-json"), el }));
    }
    const scripts = element.querySelectorAll(`${selector} script[type="application/json"]`);
    return Array.from(scripts).map((s) => ({ json: s.textContent, el: s.closest(selector) || s.parentElement }));
  }
  function parse8(element, { document }) {
    const items = getAllComponentJson5(element, "bsx-card-base");
    if (!items.length) return;
    const cells = [];
    items.forEach(({ json }) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch (e) {
        return;
      }
      const imgCol = document.createElement("div");
      const contentCol = document.createElement("div");
      if (data.cardContent && data.cardContent.children) {
        data.cardContent.children.forEach((child) => {
          if (child.component === "h6") {
            const h6 = document.createElement("h6");
            h6.textContent = child.children;
            contentCol.append(h6);
          } else if (child.component === "h5") {
            const h5 = document.createElement("h5");
            h5.textContent = child.children;
            contentCol.append(h5);
          } else if (child.component === "span" && child.children) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = child.children;
            Array.from(wrapper.children).forEach((el) => contentCol.append(el));
          }
        });
      }
      if (data.cardActions && data.cardActions.children) {
        const actionP = document.createElement("p");
        data.cardActions.children.forEach((action) => {
          if (action.link || action.text) {
            const a = document.createElement("a");
            a.href = action.link || "#";
            a.textContent = action.text || "";
            actionP.append(a);
            actionP.append(document.createTextNode(" "));
          }
        });
        if (actionP.childNodes.length > 0) contentCol.append(actionP);
      }
      cells.push([imgCol, contentCol]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-support", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bridgestone-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [".cookie-consent-container"]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [".cmp-experiencefragment--header"]);
      WebImporter.DOMUtils.remove(element, [".cmp-experiencefragment--footer"]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript"]);
    }
  }

  // tools/importer/transformers/bridgestone-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const document = element.ownerDocument;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-brand": parse,
    "cards-category": parse2,
    "columns-feature": parse3,
    "cards-bento": parse4,
    "cards-promo": parse5,
    "columns-showcase": parse6,
    "cards-article": parse7,
    "cards-support": parse8
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Bridgestone Tires homepage with hero, product categories, promotions, and brand content",
    urls: ["https://tires.bridgestone.com/"],
    blocks: [
      {
        name: "hero-brand",
        instances: ["div.hero.aem-GridColumn"]
      },
      {
        name: "cards-category",
        instances: ["bsx-section#auto .column"]
      },
      {
        name: "columns-feature",
        instances: ["bsx-section#guide .content-card"]
      },
      {
        name: "cards-bento",
        instances: ["bsx-section#why .bento-box"]
      },
      {
        name: "cards-promo",
        instances: ["bsx-section#offers .column:has(.card)"]
      },
      {
        name: "columns-showcase",
        instances: ["bsx-section#wrm .content-card"]
      },
      {
        name: "cards-article",
        instances: ["bsx-section#resource:has(.separator) .column:has(.card)"]
      },
      {
        name: "cards-support",
        instances: ["section:has(bsx-section#resource) ~ section bsx-grid:has(.card)"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: "div.hero.aem-GridColumn",
        style: null,
        blocks: ["hero-brand"],
        defaultContent: []
      },
      {
        id: "section-subnav",
        name: "Subnav",
        selector: "div.subnav.aem-GridColumn",
        style: null,
        blocks: [],
        defaultContent: ["bsx-subnav a"]
      },
      {
        id: "section-categories",
        name: "Tire Categories",
        selector: "section:has(bsx-section#auto)",
        style: null,
        blocks: ["cards-category"],
        defaultContent: []
      },
      {
        id: "section-guide",
        name: "Tire Decision Guide",
        selector: "section:has(bsx-section#guide)",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-welcome",
        name: "Welcome to Bridgestone",
        selector: "section:has(bsx-section#why)",
        style: null,
        blocks: ["cards-bento"],
        defaultContent: ["#title-eb9241a6ce"]
      },
      {
        id: "section-offers",
        name: "Tire Offers and Promotions",
        selector: "section:has(bsx-section#offers)",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: ["#title-558866290d", "bsx-section#offers .separator"]
      },
      {
        id: "section-wrm",
        name: "What Really Matters",
        selector: "section:has(bsx-section#wrm)",
        style: null,
        blocks: ["columns-showcase"],
        defaultContent: []
      },
      {
        id: "section-whats-new",
        name: "Whats New",
        selector: "section:has(bsx-section#resource)",
        style: null,
        blocks: ["cards-article"],
        defaultContent: ["#title-ecf2f7fd84", "bsx-section#resource .separator"]
      },
      {
        id: "section-support",
        name: "Support Cards",
        selector: ["section:has(bsx-section#resource) ~ section:has(.card)", "section:nth-of-type(8)"],
        style: null,
        blocks: ["cards-support"],
        defaultContent: []
      },
      {
        id: "section-contact",
        name: "Contact Us",
        selector: "section:has(bsx-section#about)",
        style: null,
        blocks: [],
        defaultContent: ["#title-7588a694d7", "bsx-section#about .typography"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    /**
     * Preprocess: runs BEFORE the helix importer strips scripts.
     * Preserves JSON config data as data-json attributes on parent web components.
     */
    preprocess: ({ document }) => {
      const scripts = document.querySelectorAll('script[type="application/json"]');
      console.log(`[preprocess] Found ${scripts.length} JSON scripts to preserve`);
      scripts.forEach((script) => {
        const parent = script.parentElement;
        if (parent) {
          const existing = parent.getAttribute("data-json") || "";
          if (existing) {
            parent.setAttribute("data-json", existing + "|||" + script.textContent.trim());
          } else {
            parent.setAttribute("data-json", script.textContent.trim());
          }
        }
      });
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let path = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "").toLowerCase();
      if (!path || path === "") path = "/index";
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
