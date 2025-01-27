/**
 * @licstart The following is the entire license notice for the
 * Javascript code in this page
 *
 * Copyright 2021 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend The above is the entire license notice for the
 * Javascript code in this page
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XFAFactory = void 0;

var _xfa_object = require("./xfa_object.js");

var _bind = require("./bind.js");

var _data = require("./data.js");

var _fonts = require("./fonts.js");

var _utils = require("./utils.js");

var _util = require("../../shared/util.js");

var _parser = require("./parser.js");

class XFAFactory {
  constructor(data) {
    try {
      this.root = new _parser.XFAParser().parse(XFAFactory._createDocument(data));
      const binder = new _bind.Binder(this.root);
      this.form = binder.bind();
      this.dataHandler = new _data.DataHandler(this.root, binder.getData());
      this.form[_xfa_object.$globalData].template = this.form;
    } catch (e) {
      (0, _util.warn)(`XFA - an error occurred during parsing and binding: ${e}`);
    }
  }

  isValid() {
    return this.root && this.form;
  }

  _createPages() {
    try {
      this.pages = this.form[_xfa_object.$toHTML]();
      this.dims = this.pages.children.map(c => {
        const {
          width,
          height
        } = c.attributes.style;
        return [0, 0, parseInt(width), parseInt(height)];
      });
    } catch (e) {
      (0, _util.warn)(`XFA - an error occurred during layout: ${e}`);
    }
  }

  getBoundingBox(pageIndex) {
    return this.dims[pageIndex];
  }

  get numberPages() {
    if (!this.pages) {
      this._createPages();
    }

    return this.dims.length;
  }

  setImages(images) {
    this.form[_xfa_object.$globalData].images = images;
  }

  setFonts(fonts) {
    this.form[_xfa_object.$globalData].fontFinder = new _fonts.FontFinder(fonts);
    const missingFonts = [];

    for (let typeface of this.form[_xfa_object.$globalData].usedTypefaces) {
      typeface = (0, _utils.stripQuotes)(typeface);

      const font = this.form[_xfa_object.$globalData].fontFinder.find(typeface);

      if (!font) {
        missingFonts.push(typeface);
      }
    }

    if (missingFonts.length > 0) {
      return missingFonts;
    }

    return null;
  }

  appendFonts(fonts, reallyMissingFonts) {
    this.form[_xfa_object.$globalData].fontFinder.add(fonts, reallyMissingFonts);
  }

  getPages() {
    if (!this.pages) {
      this._createPages();
    }

    const pages = this.pages;
    this.pages = null;
    return pages;
  }

  serializeData(storage) {
    return this.dataHandler.serialize(storage);
  }

  static _createDocument(data) {
    if (!data["/xdp:xdp"]) {
      return data["xdp:xdp"];
    }

    return Object.values(data).join("");
  }

}

exports.XFAFactory = XFAFactory;
