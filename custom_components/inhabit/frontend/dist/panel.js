function t(t,e,o,i){var n,r=arguments.length,s=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,o,s):n(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,o=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let r=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(o&&void 0===t){const o=void 0!==e&&1===e.length;o&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&n.set(e,t))}return t}toString(){return this.cssText}};const s=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new r(o,t,i)},a=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,g=globalThis,f=g.trustedTypes,_=f?f.emptyScript:"",y=g.reactiveElementPolyfillSupport,v=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},m=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(t,o,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const r=i?.call(this);n?.call(this,e),this.requestUpdate(t,r,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...u(t)];for(const o of e)this.createProperty(o,t[o])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,o]of e)this.elementProperties.set(t,o)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const o=this._$Eu(t,e);void 0!==o&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(o)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const o of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=o.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){const o=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:x).toAttribute(e,o.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const o=this.constructor,i=o._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=o.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=i;const r=n.fromAttribute(e,t.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,e,o,i=!1,n){if(void 0!==t){const r=this.constructor;if(!1===i&&(n=this[t]),o??=r.getPropertyOptions(t),!((o.hasChanged??m)(n,e)||o.useDefault&&o.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,o))))return;this.C(t,e,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:i,wrapped:n},r){o&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,o]of t){const{wrapped:t}=o,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,o,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,E=t=>t,k=$.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+M,C=`<${A}>`,N=document,D=()=>N.createComment(""),W=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,L="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,U=/>/g,I=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,T=/"/g,B=/^(?:script|style|textarea|title)$/i,H=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),j=H(1),q=H(2),K=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),X=new WeakMap,V=N.createTreeWalker(N,129);function Z(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}class J{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,r=0;const s=t.length-1,a=this.parts,[l,d]=((t,e)=>{const o=t.length-1,i=[];let n,r=2===e?"<svg>":3===e?"<math>":"",s=R;for(let e=0;e<o;e++){const o=t[e];let a,l,d=-1,c=0;for(;c<o.length&&(s.lastIndex=c,l=s.exec(o),null!==l);)c=s.lastIndex,s===R?"!--"===l[1]?s=z:void 0!==l[1]?s=U:void 0!==l[2]?(B.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=I):void 0!==l[3]&&(s=I):s===I?">"===l[0]?(s=n??R,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?I:'"'===l[3]?T:F):s===T||s===F?s=I:s===z||s===U?s=R:(s=I,n=void 0);const h=s===I&&t[e+1].startsWith("/>")?" ":"";r+=s===R?o+C:d>=0?(i.push(a),o.slice(0,d)+P+o.slice(d)+M+h):o+M+(-2===d?e:h)}return[Z(t,r+(t[o]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]})(t,e);if(this.el=J.createElement(l,o),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=V.nextNode())&&a.length<s;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(P)){const e=d[r++],o=i.getAttribute(t).split(M),s=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:s[2],strings:o,ctor:"."===s[1]?ot:"?"===s[1]?it:"@"===s[1]?nt:et}),i.removeAttribute(t)}else t.startsWith(M)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(B.test(i.tagName)){const t=i.textContent.split(M),e=t.length-1;if(e>0){i.textContent=k?k.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],D()),V.nextNode(),a.push({type:2,index:++n});i.append(t[e],D())}}}else if(8===i.nodeType)if(i.data===A)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(M,t+1));)a.push({type:7,index:n}),t+=M.length-1}n++}}static createElement(t,e){const o=N.createElement("template");return o.innerHTML=t,o}}function G(t,e,o=t,i){if(e===K)return e;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const r=W(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(e=G(t,n._$AS(t,e.values),n,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:o}=this._$AD,i=(t?.creationScope??N).importNode(e,!0);V.currentNode=i;let n=V.nextNode(),r=0,s=0,a=o[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=o[++s]}r!==a?.index&&(n=V.nextNode(),r++)}return V.currentNode=N,i}p(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,i){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),W(t)?t===Y||null==t||""===t?(this._$AH!==Y&&this._$AR(),this._$AH=Y):t!==this._$AH&&t!==K&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Y&&W(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:o}=t,i="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=J.createElement(Z(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),o=t.u(this.options);t.p(e),this.T(o),this._$AH=t}}_$AC(t){let e=X.get(t.strings);return void 0===e&&X.set(t.strings,e=new J(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new tt(this.O(D()),this.O(D()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=E(t).nextSibling;E(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,i,n){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=Y}_$AI(t,e=this,o,i){const n=this.strings;let r=!1;if(void 0===n)t=G(this,t,e,0),r=!W(t)||t!==this._$AH&&t!==K,r&&(this._$AH=t);else{const i=t;let s,a;for(t=n[0],s=0;s<n.length-1;s++)a=G(this,i[o+s],e,s),a===K&&(a=this._$AH[s]),r||=!W(a)||a!==this._$AH[s],a===Y?t=Y:t!==Y&&(t+=(a??"")+n[s+1]),this._$AH[s]=a}r&&!i&&this.j(t)}j(t){t===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Y?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Y)}}class nt extends et{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??Y)===K)return;const o=this._$AH,i=t===Y&&o!==Y||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==Y&&(o===Y||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=$.litHtmlPolyfillSupport;st?.(J,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{const i=o?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=o?.renderBefore??null;i._$litPart$=n=new tt(e.insertBefore(D(),t),t,void 0,o??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,o)=>{void 0!==o?o.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:m},ut=(t=ht,e,o)=>{const{kind:i,metadata:n}=o;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),r.set(o.name,t),"accessor"===i){const{name:i}=o;return{set(o){const n=e.get.call(this);e.set.call(this,o),this.requestUpdate(i,n,t,!0,o)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];e.call(this,o),this.requestUpdate(i,n,t,!0,o)}}throw Error("Unsupported decorator location: "+i)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pt(t){return(e,o)=>"object"==typeof o?ut(t,e,o):((t,e,o)=>{const i=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),i?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t){return pt({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ft=Symbol.for("preact-signals");function _t(){if(mt>1)return void mt--;let t,e=!1;for(;void 0!==vt;){let o=vt;for(vt=void 0,bt++;void 0!==o;){const i=o.o;if(o.o=void 0,o.f&=-3,!(8&o.f)&&St(o))try{o.c()}catch(o){e||(t=o,e=!0)}o=i}}if(bt=0,mt--,e)throw t}let yt,vt;function xt(t){const e=yt;yt=void 0;try{return t()}finally{yt=e}}let mt=0,bt=0,wt=0;function $t(t){if(void 0===yt)return;let e=t.n;return void 0===e||e.t!==yt?(e={i:0,S:t,p:yt.s,n:void 0,t:yt,e:void 0,x:void 0,r:e},void 0!==yt.s&&(yt.s.n=e),yt.s=e,t.n=e,32&yt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=yt.s,e.n=void 0,yt.s.n=e,yt.s=e),e):void 0}function Et(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function kt(t,e){return new Et(t,e)}function St(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Pt(t){for(let e=t.s;void 0!==e;e=e.n){const o=e.S.n;if(void 0!==o&&(e.r=o),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Mt(t){let e,o=t.s;for(;void 0!==o;){const t=o.p;-1===o.i?(o.S.U(o),void 0!==t&&(t.n=o.n),void 0!==o.n&&(o.n.p=t)):e=o,o.S.n=o.r,void 0!==o.r&&(o.r=void 0),o=t}t.s=e}function At(t,e){Et.call(this,void 0),this.x=t,this.s=void 0,this.g=wt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Ct(t,e){return new At(t,e)}function Nt(t){const e=t.u;if(t.u=void 0,"function"==typeof e){mt++;const o=yt;yt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Dt(t),e}finally{yt=o,_t()}}}function Dt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Nt(t)}function Wt(t){if(yt!==this)throw new Error("Out-of-order effect");Mt(this),yt=t,this.f&=-2,8&this.f&&Dt(this),_t()}function Ot(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Lt(t,e){const o=new Ot(t,e);try{o.c()}catch(t){throw o.d(),t}const i=o.d.bind(o);return i[Symbol.dispose]=i,i}function Rt(t,e){const o=e.x-t.x,i=e.y-t.y;return Math.sqrt(o*o+i*i)}function zt(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function Ut(t,e){const o=new Map,i=new Map,n=new Map;for(const e of t)o.set(e.id,e);for(const t of e)i.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:o,edges:i,nodeToEdges:n}}function It(t,e,o,i){return Math.round(t)!==Math.round(o)||Math.round(e)!==Math.round(i)}function Ft(t,e,o,i){const n=t.start_node===e,r=i.get(n?t.end_node:t.start_node),s=i.get(e);if(t.angle_locked&&"free"===t.direction){const e=Math.atan2(r.y-s.y,r.x-s.x),n=Rt(i.get(t.start_node),i.get(t.end_node));return{x:o.x+Math.cos(e)*n,y:o.y+Math.sin(e)*n}}let a={x:r.x,y:r.y};if("horizontal"===t.direction?a={x:a.x,y:o.y}:"vertical"===t.direction&&(a={x:o.x,y:a.y}),t.length_locked){const e=Rt(i.get(t.start_node),i.get(t.end_node)),n=a.x-o.x,r=a.y-o.y,s=Math.sqrt(n*n+r*r);if(s>0&&e>0){const t=e/s;a={x:o.x+n*t,y:o.y+r*t}}}return a}function Tt(t,e,o,i,n){const r=[],s=t.nodeToEdges.get(e)||[],a=[];for(const{edgeId:l,endpoint:d}of s){if(n.has(l))continue;n.add(l);const s=t.edges.get(l);if(!s)continue;const c="start"===d?s.end_node:s.start_node,h=t.nodes.get(c);if(!h)continue;const u=Ft(s,e,{x:o,y:i},t.nodes);It(h.x,h.y,u.x,u.y)&&(r.push({nodeId:c,x:u.x,y:u.y}),a.push({nodeId:c,x:u.x,y:u.y}))}for(const e of a){if(n.size>2*t.edges.size)break;const o=Tt(t,e.nodeId,e.x,e.y,n);if(o.blocked)return o;r.push(...o.updates)}return{updates:r,blocked:!1}}function Bt(t,e,o,i){const n=[{nodeId:e,x:o,y:i}],r=Tt(t,e,o,i,new Set);return r.blocked?r:(n.push(...r.updates),{updates:n,blocked:!1})}function Ht(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};if(i.length_locked)return{updates:[],blocked:!0,blockedBy:i.id};const n=t.nodes.get(i.start_node),r=t.nodes.get(i.end_node);if(!n||!r)return{updates:[],blocked:!1};if(0===Rt(n,r))return{updates:[],blocked:!1};const s=(n.x+r.x)/2,a=(n.y+r.y)/2,l=function(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return Math.atan2(i.y-o.y,i.x-o.x)}(i,t.nodes),d=o/2,c={x:s-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:s+Math.cos(l)*d,y:a+Math.sin(l)*d},u=new Set;u.add(e);const p=[{nodeId:i.start_node,x:c.x,y:c.y},{nodeId:i.end_node,x:h.x,y:h.y}];if(It(n.x,n.y,c.x,c.y)){const e=Tt(t,i.start_node,c.x,c.y,u);if(e.blocked)return e;p.push(...e.updates)}if(It(r.x,r.y,h.x,h.y)){const e=Tt(t,i.end_node,h.x,h.y,u);if(e.blocked)return e;p.push(...e.updates)}return{updates:p,blocked:!1}}function jt(t,e,o,i,n){return function(t){const e=new Map;for(const o of t)e.set(o.nodeId,{x:o.x,y:o.y});return e}(Bt(Ut(t,e),o,i,n).updates)}function qt(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};const n=function(t,e,o){if("free"===e)return null;const i=o.get(t.start_node),n=o.get(t.end_node);if(!i||!n)return null;const r=(i.x+n.x)/2,s=(i.y+n.y)/2,a=Rt(i,n)/2;return"horizontal"===e?Math.round(i.y)===Math.round(n.y)?null:{nodeUpdates:[{nodeId:t.start_node,x:r-a,y:s},{nodeId:t.end_node,x:r+a,y:s}]}:"vertical"===e?Math.round(i.x)===Math.round(n.x)?null:{nodeUpdates:[{nodeId:t.start_node,x:r,y:s-a},{nodeId:t.end_node,x:r,y:s+a}]}:null}(i,o,t.nodes);if(!n)return{updates:[],blocked:!1};const r=new Set;r.add(e);const s=[...n.nodeUpdates],a=t.nodes.get(i.start_node),l=t.nodes.get(i.end_node),d=n.nodeUpdates.find(t=>t.nodeId===i.start_node),c=n.nodeUpdates.find(t=>t.nodeId===i.end_node);if(It(a.x,a.y,d.x,d.y)){const e=Tt(t,i.start_node,d.x,d.y,r);if(e.blocked)return e;s.push(...e.updates)}if(It(l.x,l.y,c.x,c.y)){const e=Tt(t,i.end_node,c.x,c.y,r);if(e.blocked)return e;s.push(...e.updates)}return{updates:s,blocked:!1}}function Kt(t){const e=new Map;for(const o of t)e.set(o.id,o);return e}function Yt(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return o&&i?{...t,startPos:{x:o.x,y:o.y},endPos:{x:i.x,y:i.y}}:null}function Xt(t){const e=Kt(t.nodes),o=[];for(const i of t.edges){const t=Yt(i,e);t&&o.push(t)}return o}function Vt(t,e,o){let i=null,n=o;for(const o of e){const e=Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2);e<n&&(n=e,i=o)}return i}Et.prototype.brand=ft,Et.prototype.h=function(){return!0},Et.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:xt(()=>{var t;null==(t=this.W)||t.call(this)}))},Et.prototype.U=function(t){if(void 0!==this.t){const e=t.e,o=t.x;void 0!==e&&(e.x=o,t.e=void 0),void 0!==o&&(o.e=e,t.x=void 0),t===this.t&&(this.t=o,void 0===o&&xt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},Et.prototype.subscribe=function(t){return Lt(()=>{const e=this.value,o=yt;yt=void 0;try{t(e)}finally{yt=o}},{name:"sub"})},Et.prototype.valueOf=function(){return this.value},Et.prototype.toString=function(){return this.value+""},Et.prototype.toJSON=function(){return this.value},Et.prototype.peek=function(){const t=yt;yt=void 0;try{return this.value}finally{yt=t}},Object.defineProperty(Et.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(bt>100)throw new Error("Cycle detected");this.v=t,this.i++,wt++,mt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{_t()}}}}),At.prototype=new Et,At.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===wt)return!0;if(this.g=wt,this.f|=1,this.i>0&&!St(this))return this.f&=-2,!0;const t=yt;try{Pt(this),yt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return yt=t,Mt(this),this.f&=-2,!0},At.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}Et.prototype.S.call(this,t)},At.prototype.U=function(t){if(void 0!==this.t&&(Et.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},At.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(At.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Ot.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Ot.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Nt(this),Pt(this),mt++;const t=yt;return yt=this,Wt.bind(this,t)},Ot.prototype.N=function(){2&this.f||(this.f|=2,this.o=vt,vt=this)},Ot.prototype.d=function(){this.f|=8,1&this.f||Dt(this)},Ot.prototype.dispose=function(){this.d()};function Zt(t){let e=0;const o=t.length;for(let i=0;i<o;i++){const n=(i+1)%o;e+=t[i].x*t[n].y,e-=t[n].x*t[i].y}return e/2}function Jt(t){let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;const i=t.length;return{x:e/i,y:o/i}}const Gt=kt([]),Qt=kt([]),te=kt(!1),ee=Ct(()=>Gt.value.length>0&&!te.value),oe=Ct(()=>Qt.value.length>0&&!te.value);function ie(t){Gt.value=[...Gt.value.slice(-99),t],Qt.value=[]}async function ne(){const t=Gt.value;if(0===t.length||te.value)return;const e=t[t.length-1];te.value=!0;try{await e.undo()}finally{te.value=!1}Gt.value=t.slice(0,-1),Qt.value=[...Qt.value,e]}async function re(){const t=Qt.value;if(0===t.length||te.value)return;const e=t[t.length-1];te.value=!0;try{await e.redo()}finally{te.value=!1}Qt.value=t.slice(0,-1),Gt.value=[...Gt.value,e]}function se(){Gt.value=[],Qt.value=[]}let ae=class extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._roomEditor=null,this._haAreas=[],this._hoveredNode=null,this._draggingNode=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingLength="",this._pendingDevice=null,this._entitySearch="",this._canvasMode="walls",this._cleanupEffects=[]}static{this.styles=s`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--card-background-color, #f5f5f5);
      position: relative;
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: crosshair;
      outline: none;
    }

    svg:focus {
      outline: none;
    }

    svg.panning {
      cursor: grabbing;
    }

    svg.view-mode {
      cursor: grab;
    }

    svg.view-mode.panning {
      cursor: grabbing;
    }

    svg.select-tool {
      cursor: default;
    }

    .room {
      cursor: pointer;
      transition: fill 0.2s ease;
    }

    .room:hover {
      fill-opacity: 0.8;
    }

    .room.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 3;
      stroke-dasharray: 5,5;
    }

    .wall {
      fill: var(--primary-text-color, #333);
      stroke: none;
      pointer-events: none;
    }

    .wall-selected-highlight {
      fill: var(--primary-color, #2196f3);
      stroke: none;
      pointer-events: none;
    }

    .door {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
    }

    .window {
      fill: #b3e5fc;
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
    }

    .device-marker {
      cursor: pointer;
    }

    .device-marker circle {
      transition: r 0.2s ease;
    }

    .device-marker:hover circle {
      r: 14;
    }

    .device-marker.on circle {
      fill: var(--state-light-active-color, #ffd600);
    }

    .device-marker.off circle {
      fill: var(--disabled-text-color, #bdbdbd);
    }

    .room-label {
      pointer-events: none;
      font-size: 14px;
      font-weight: 500;
      fill: var(--primary-text-color, #333);
      text-anchor: middle;
      dominant-baseline: middle;
    }

    .drawing-preview {
      pointer-events: none;
    }

    .wall-preview {
      stroke: var(--primary-color, #2196f3);
      stroke-width: 8;
      stroke-linecap: round;
    }

    .wall-length-label {
      font-size: 12px;
      font-weight: 500;
      fill: var(--primary-color, #2196f3);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .wall-length-bg {
      fill: var(--card-background-color, white);
      opacity: 0.95;
    }

    .snap-indicator {
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
    }

    .closed-shape-preview {
      fill: rgba(76, 175, 80, 0.3);
      stroke: #4caf50;
      stroke-width: 2;
      stroke-dasharray: 5,5;
    }

    .wall-endpoint {
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
      cursor: pointer;
    }

    .wall-endpoint.dragging {
      cursor: grabbing;
    }

    .wall-original-ghost {
      fill: var(--secondary-text-color, #666);
      fill-opacity: 0.3;
      stroke: none;
      pointer-events: none;
    }

    .wall-preview-shape {
      fill: var(--primary-text-color, #333);
      stroke: none;
      pointer-events: none;
    }

    .wall-editor {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 280px;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wall-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wall-editor-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #333);
    }

    .wall-editor-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color, #666);
      font-size: 16px;
      line-height: 1;
    }

    .wall-editor-close:hover {
      color: var(--primary-text-color, #333);
    }

    .wall-editor-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wall-editor-label {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      min-width: 50px;
    }

    .wall-editor input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      font-size: 14px;
      background: var(--primary-background-color, white);
      color: var(--primary-text-color, #333);
    }

    .wall-editor input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor-unit {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }

    .wall-editor-constraints {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .wall-editor .constraint-btn {
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color, #333);
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .wall-editor .constraint-btn:hover {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor .constraint-btn.active {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .wall-editor-actions button {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }

    .wall-editor .save-btn {
      background: var(--primary-color, #2196f3);
      color: white;
    }

    .wall-editor .save-btn:hover {
      opacity: 0.9;
    }

    .wall-editor .delete-btn {
      background: var(--error-color, #f44336);
      color: white;
    }

    .wall-editor .delete-btn:hover {
      opacity: 0.9;
    }

    .entity-picker {
      position: absolute;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100;
      width: 250px;
      max-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .entity-picker input {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      font-size: 14px;
      background: var(--primary-background-color, white);
      color: var(--primary-text-color, #333);
      box-sizing: border-box;
      margin-bottom: 8px;
    }

    .entity-picker input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
    }

    .entity-list {
      overflow-y: auto;
      max-height: 220px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .entity-item:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color, #666);
    }

    .entity-item.on ha-icon {
      color: var(--state-light-active-color, #ffd600);
    }

    .entity-item .name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-item .state {
      font-size: 11px;
      color: var(--secondary-text-color, #666);
    }

    .wall-annotation-bg {
      fill: var(--card-background-color, white);
      opacity: 0.85;
    }

    .wall-annotation-text {
      font-size: 10px;
      fill: var(--secondary-text-color, #666);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .wall-annotation-icon {
      font-size: 9px;
      fill: var(--primary-color, #2196f3);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .device-preview {
      pointer-events: none;
    }
  `}connectedCallback(){super.connectedCallback(),this._cleanupEffects.push(Lt(()=>{this._viewBox=ye.value}),Lt(()=>{this._canvasMode=pe.value})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault();const e=t.deltaY>0?1.1:.9,o=this._screenToSvg({x:t.clientX,y:t.clientY}),i=this._viewBox.width*e,n=this._viewBox.height*e;if(i<100||i>1e4)return;const r={x:o.x-(o.x-this._viewBox.x)*e,y:o.y-(o.y-this._viewBox.y)*e,width:i,height:n};ye.value=r,this._viewBox=r}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._getSnappedPoint(e),i=this._canvasMode;if(this._pendingDevice&&"device"!==ge.value&&(this._pendingDevice=null),1===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===i&&0===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);const n=ge.value;if(0===t.button)if("select"===n){const o=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;this._handleSelectClick(e,t.shiftKey)||(o&&(fe.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}else if("wall"===n){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:o;this._handleWallClick(e,t.shiftKey)}else"device"===n?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(o)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=ge.value;let i=this._getSnappedPoint(e,"device"===o);if(t.shiftKey&&"wall"===o&&this._wallStartPoint){i=Math.abs(i.x-this._wallStartPoint.x)>=Math.abs(i.y-this._wallStartPoint.y)?{x:i.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:i.y}}if(this._cursorPos=i,this._draggingNode){const o=t.clientX-this._draggingNode.startX,i=t.clientY-this._draggingNode.startY;return(Math.abs(o)>3||Math.abs(i)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),o=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),i={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-o};return this._panStart={x:t.clientX,y:t.clientY},ye.value=i,void(this._viewBox=i)}this._wallStartPoint||"select"!==o||"walls"!==this._canvasMode||this._checkNodeHover(e)}_checkNodeHover(t){const e=ue.value;if(!e)return void(this._hoveredNode=null);const o=Vt(t,e.nodes,15);this._hoveredNode=o}_handlePointerUp(t){if(this._draggingNode)return this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId);this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,ge.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=ue.value,e=he.value;if(!t||!e)return void(this._draggingNode=null);const o=this._cursorPos,i=this._draggingNode.originalCoords;if(Math.abs(o.x-i.x)<1&&Math.abs(o.y-i.y)<1)return void(this._draggingNode=null);const n=Bt(Ut(t.nodes,t.edges),this._draggingNode.node.id,o.x,o.y);if(n.blocked)return alert(`Cannot move node: edge "${n.blockedBy}" has a constraint that blocks this.`),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await $e()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null}else this._draggingNode=null}_handleKeyDown(t){"Escape"===t.key?(this._wallStartPoint=null,this._hoveredNode=null,this._draggingNode=null,this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,fe.value={type:"none",ids:[]},ge.value="select"):"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),re()):(t.preventDefault(),ne()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete())}_handleEditorSave(){if(!this._edgeEditor)return;const t=parseFloat(this._editingLength);isNaN(t)||t<=0||(this._updateEdgeLength(this._edgeEditor.edge,t),this._edgeEditor=null)}_handleEditorCancel(){this._edgeEditor=null,fe.value={type:"none",ids:[]}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=this.hass,i=e.id,n=t.id,r=this._edgeEditor.edge,s=Kt(t.nodes),a=s.get(r.start_node),l=s.get(r.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:r.thickness,is_exterior:r.is_exterior,length_locked:r.length_locked,direction:r.direction},c={id:r.id};try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await $e(),await this._syncRoomsWithEdges(),ie({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await o.callWS({type:"inhabit/edges/add",floor_plan_id:i,floor_id:n,...d});c.id=t.edge.id,await $e(),await this._syncRoomsWithEdges()},redo:async()=>{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await $e(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,fe.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,o){if(!this.hass)return;const i=ue.value,n=he.value;if(!i||!n)return;const r=this.hass,s=n.id,a=i.id,l=new Map;for(const e of t){const t=i.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await o(),await this._syncRoomsWithEdges();const d=ue.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await r.callWS({type:"inhabit/nodes/update",floor_plan_id:s,floor_id:a,updates:e}),await $e(),await this._syncRoomsWithEdges()};ie({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const o=ue.value,i=he.value;if(!o||!i)return;const n=Ht(Ut(o.nodes,o.edges),t.id,e);if(n.blocked)alert(`Cannot change length: edge "${n.blockedBy}" has a constraint that blocks this change.`);else if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await $e()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}fe.value={type:"none",ids:[]}}}_getSnappedPointForNode(t){const e=ue.value;if(e){const o=Vt(t,e.nodes,15);if(o)return{x:o.x,y:o.y}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const o=ue.value;if(!o)return xe.value?zt(t,ve.value):t;const i=Vt(t,o.nodes,15);if(i)return{x:i.x,y:i.y};if(e){const e=Xt(o);let i=null,n=15;for(const o of e){const e=this._getClosestPointOnSegment(t,o.startPos,o.endPos),r=Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));r<n&&(n=r,i=e)}if(i)return i}return xe.value?zt(t,ve.value):t}_getClosestPointOnSegment(t,e,o){const i=o.x-e.x,n=o.y-e.y,r=i*i+n*n;if(0===r)return e;const s=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/r));return{x:e.x+s*i,y:e.y+s*n}}_handleSelectClick(t,e=!1){const o=ue.value;if(!o)return!1;const i=Xt(o);for(const o of i){if(this._pointToSegmentDistance(t,o.startPos,o.endPos)<o.thickness/2+5){if(e&&"walls"===this._canvasMode&&"edge"===fe.value.type){const t=[...fe.value.ids],e=t.indexOf(o.id);return e>=0?t.splice(e,1):t.push(o.id),fe.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return fe.value={type:"edge",ids:[o.id]},this._updateEdgeEditorForSelection([o.id]),!0}}const n=be.value.filter(t=>t.floor_id===o.id);for(const e of n){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return fe.value={type:"device",ids:[e.id]},!0}for(const e of o.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){fe.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null},!0}return fe.value={type:"none",ids:[]},!1}_updateEdgeEditorForSelection(t){const e=ue.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const o=Kt(e.nodes);if(1===t.length){const i=e.edges.find(e=>e.id===t[0]);if(i){const t=o.get(i.start_node),e=o.get(i.end_node);if(t&&e){const o=this._calculateWallLength(t,e);this._edgeEditor={edge:i,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:o},this._editingLength=Math.round(o).toString()}}return void(this._multiEdgeEditor=null)}const i=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:i},this._edgeEditor=null}_pointToSegmentDistance(t,e,o){const i=o.x-e.x,n=o.y-e.y,r=i*i+n*n;if(0===r)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const s=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/r)),a=e.x+s*i,l=e.y+s*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let o="free";if(e){o=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,o),this._wallStartPoint=t}else this._wallStartPoint=t}async _completeWall(t,e,o="free"){if(!this.hass)return;const i=ue.value,n=he.value;if(!i||!n)return;const r=this.hass,s=n.id,a=i.id,l={id:""};try{const i=await r.callWS({type:"inhabit/edges/add",floor_plan_id:s,floor_id:a,start:t,end:e,thickness:8,direction:o});l.id=i.edge.id,await $e(),await this._syncRoomsWithEdges(),ie({type:"edge_add",description:"Add wall",undo:async()=>{await r.callWS({type:"inhabit/edges/delete",floor_plan_id:s,floor_id:a,edge_id:l.id}),await $e(),await this._syncRoomsWithEdges()},redo:async()=>{const i=await r.callWS({type:"inhabit/edges/add",floor_plan_id:s,floor_id:a,start:t,end:e,thickness:8,direction:o});l.id=i.edge.id,await $e(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.inverse();return{x:o.a*t.x+o.c*t.y+o.e,y:o.b*t.x+o.d*t.y+o.f}}const o=this._svg.getBoundingClientRect(),i=this._viewBox.width/o.width,n=this._viewBox.height/o.height;return{x:this._viewBox.x+(t.x-o.left)*i,y:this._viewBox.y+(t.y-o.top)*n}}_pointInPolygon(t,e){if(e.length<3)return!1;let o=!1;const i=e.length;for(let n=0,r=i-1;n<i;r=n++){const i=e[n],s=e[r];i.y>t.y!=s.y>t.y&&t.x<(s.x-i.x)*(t.y-i.y)/(s.y-i.y)+i.x&&(o=!o)}return o}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=function(t,e){if(0===e.length)return[];const o=new Map;for(const e of t)o.set(e.id,e);const i=new Map,n=(t,e)=>{const n=o.get(t),r=o.get(e);if(!n||!r)return;if(t===e)return;const s=Math.atan2(r.y-n.y,r.x-n.x);i.has(t)||i.set(t,[]),i.get(t).push({targetId:e,angle:s})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of i)t.sort((t,e)=>t.angle-e.angle);const r=new Set,s=[],a=(t,e)=>`${t}->${e}`;for(const[t,e]of i)for(const n of e){const e=a(t,n.targetId);if(r.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=a(d,c);if(r.has(e)){h=!1;break}r.add(e),l.push(d);const s=o.get(d),u=o.get(c),p=Math.atan2(s.y-u.y,s.x-u.x),g=i.get(c);if(!g||0===g.length){h=!1;break}let f=null;for(const t of g)if(t.angle>p){f=t;break}if(f||(f=g[0]),d=c,c=f.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&s.push(l.map(t=>{const e=o.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of s){const e=Zt(t),o=Math.abs(e);if(o<100)continue;if(e>0)continue;const i=Jt(t);l.push({vertices:t,area:o,centroid:i})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}(t.nodes,t.edges),i=[...t.rooms],n=new Set;for(const r of o){let o=null,s=1/0;for(const t of i){if(n.has(t.id))continue;const e=this._getPolygonCenter(t.polygon.vertices);if(!e)continue;const i=Math.sqrt(Math.pow(r.centroid.x-e.x,2)+Math.pow(r.centroid.y-e.y,2));i<50&&i<s&&(s=i,o=t)}if(o){n.add(o.id);if(this._verticesChanged(o.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,polygon:{vertices:r.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{const o=this._getNextRoomNumber(i);try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${o}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of i)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await $e()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let o=0;o<t.length;o++)if(Math.abs(t[o].x-e[o].x)>1||Math.abs(t[o].y-e[o].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const o of t){const t=o.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const{room:o,editName:i,editColor:n,editAreaId:r}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,name:i,color:n,ha_area_id:r}),await $e()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,fe.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,fe.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=he.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await $e()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,fe.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Room Properties</span>
          <button class="wall-editor-close" @click=${this._handleRoomEditorCancel}>✕</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">HA Area</span>
          <select
            .value=${this._roomEditor.editAreaId??""}
            @change=${t=>{if(this._roomEditor){const e=t.target.value,o=this._haAreas.find(t=>t.area_id===e);this._roomEditor={...this._roomEditor,editAreaId:e||null,editName:o?o.name:this._roomEditor.editName}}}}
            style="flex:1; padding:8px; border:1px solid var(--divider-color,#ccc); border-radius:6px; font-size:14px; background:var(--primary-background-color,white); color:var(--primary-text-color,#333);"
          >
            <option value="">None</option>
            ${this._haAreas.map(t=>j`
              <option value=${t.area_id} ?selected=${this._roomEditor?.editAreaId===t.area_id}>${t.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Name</span>
          <input
            type="text"
            .value=${this._roomEditor.editName}
            ?disabled=${!!this._roomEditor.editAreaId}
            @input=${t=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editName:t.target.value})}}
            @keydown=${t=>{"Enter"===t.key?this._handleRoomEditorSave():"Escape"===t.key&&this._handleRoomEditorCancel()}}
            style="${this._roomEditor.editAreaId?"opacity:0.5;":""}"
          />
        </div>

        <div class="wall-editor-row" style="flex-wrap:wrap;">
          <span class="wall-editor-label">Color</span>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(t=>j`
              <button
                style="width:24px; height:24px; border-radius:4px; border:2px solid ${this._roomEditor?.editColor===t?"var(--primary-color,#2196f3)":"transparent"}; background:${t}; cursor:pointer; padding:0;"
                @click=${()=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editColor:t})}}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleRoomEditorSave}>Save</button>
          <button class="delete-btn" @click=${this._handleRoomDelete}>Delete</button>
        </div>
      </div>
    `}_renderEdgeChains(t,e){const o=Xt(t);let i=o.map(t=>({id:t.id,start:t.startPos,end:t.endPos,thickness:t.thickness}));if(this._draggingNode){const e=jt(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);i=o.map(t=>{const o=e.get(t.start_node),i=e.get(t.end_node);return{id:t.id,start:o??t.startPos,end:i??t.endPos,thickness:t.thickness}})}const n=function(t){if(0===t.length)return[];const e=new Set,o=[],i=(t,e)=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1;for(const n of t){if(e.has(n.id))continue;const r=[n];e.add(n.id);let s=n.end,a=!0;for(;a;){a=!1;for(const o of t)if(!e.has(o.id)){if(i(o.start,s)){r.push(o),e.add(o.id),s=o.end,a=!0;break}if(i(o.end,s)){r.push({...o,start:o.end,end:o.start}),e.add(o.id),s=o.start,a=!0;break}}}let l=n.start;for(a=!0;a;){a=!1;for(const o of t)if(!e.has(o.id)){if(i(o.end,l)){r.unshift(o),e.add(o.id),l=o.start,a=!0;break}if(i(o.start,l)){r.unshift({...o,start:o.end,end:o.start}),e.add(o.id),l=o.end,a=!0;break}}}o.push(r)}return o}(i),r="edge"===e.type?i.filter(t=>e.ids.includes(t.id)):[];return q`
      <!-- Base edges rendered as chains for proper corners -->
      ${n.map((t,e)=>q`
        <path class="wall"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,o=[t[0].start];for(const e of t)o.push(e.end);const i=o.length>2&&Math.abs(o[0].x-o[o.length-1].x)<1&&Math.abs(o[0].y-o[o.length-1].y)<1,n=[],r=[];for(let t=0;t<o.length;t++){const s=o[t];let a,l=null,d=null;if(t>0||i){const e=o[t>0?t-1:o.length-2],i=s.x-e.x,n=s.y-e.y,r=Math.sqrt(i*i+n*n);r>0&&(l={x:i/r,y:n/r})}if(t<o.length-1||i){const e=o[t<o.length-1?t+1:1],i=e.x-s.x,n=e.y-s.y,r=Math.sqrt(i*i+n*n);r>0&&(d={x:i/r,y:n/r})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},o=t.x+e.x,i=t.y+e.y,n=Math.sqrt(o*o+i*i);if(n<.01)a=t;else{a={x:o/n,y:i/n};const e=t.x*a.x+t.y*a.y;if(Math.abs(e)>.1){const t=1/e,o=Math.min(Math.abs(t),3)*Math.sign(t);a={x:a.x*o,y:a.y*o}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:s.x+a.x*e,y:s.y+a.y*e}),r.push({x:s.x-a.x*e,y:s.y-a.y*e})}let s=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)s+=` L${n[t].x},${n[t].y}`;if(i){s+=` L${r[r.length-1].x},${r[r.length-1].y}`;for(let t=r.length-2;t>=0;t--)s+=` L${r[t].x},${r[t].y}`}else for(let t=r.length-1;t>=0;t--)s+=` L${r[t].x},${r[t].y}`;return s+=" Z",s}(t)}"
              data-chain-idx="${e}"/>
      `)}

      <!-- Selected edge highlights -->
      ${r.map(t=>q`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath(t)}"/>
      `)}
    `}_singleEdgePath(t){const{start:e,end:o,thickness:i}=t,n=o.x-e.x,r=o.y-e.y,s=Math.sqrt(n*n+r*r);if(0===s)return"";const a=-r/s*(i/2),l=n/s*(i/2);return`M${e.x+a},${e.y+l}\n            L${o.x+a},${o.y+l}\n            L${o.x-a},${o.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_renderFloor(){const t=ue.value;if(!t)return null;const e=fe.value,o=me.value;return q`
      <!-- Background layer -->
      ${o.find(t=>"background"===t.id)?.visible&&t.background_image?q`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${o.find(t=>"background"===t.id)?.opacity??1}"/>
      `:null}

      <!-- Structure layer -->
      ${o.find(t=>"structure"===t.id)?.visible?q`
        <g class="structure-layer" opacity="${o.find(t=>"structure"===t.id)?.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>q`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""}"
                  d="${function(t){const e=t.vertices;if(0===e.length)return"";const o=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return o.join(" ")+" Z"}(t.polygon)}"
                  fill="${t.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}

          <!-- Edges (rendered as chains for proper corners) -->
          ${this._renderEdgeChains(t,e)}
        </g>
      `:null}

      <!-- Labels layer -->
      ${o.find(t=>"labels"===t.id)?.visible?q`
        <g class="labels-layer" opacity="${o.find(t=>"labels"===t.id)?.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);return e?q`
              <text class="room-label" x="${e.x}" y="${e.y}">
                ${t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name}
              </text>
            `:null})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${o.find(t=>"devices"===t.id)?.visible?q`
        <g class="devices-layer" opacity="${o.find(t=>"devices"===t.id)?.opacity??1}">
          ${be.value.filter(e=>e.floor_id===t.id).map(t=>this._renderDevice(t))}
        </g>
      `:null}
    `}_renderDevice(t){const e=this.hass?.states[t.entity_id],o="on"===e?.state,i=fe.value;return q`
      <g class="device-marker ${o?"on":"off"} ${"device"===i.type&&i.ids.includes(t.id)?"selected":""}"
         transform="translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})">
        <circle r="12" fill="${o?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${t.show_label?q`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${t.label||e?.attributes.friendly_name||t.entity_id}
          </text>
        `:null}
      </g>
    `}_renderNodeEndpoints(){const t=ue.value;if(!t||0===t.nodes.length)return null;const e=[];return this._draggingNode?e.push({node:this._draggingNode.node,coords:this._cursorPos,isDragging:!0}):this._hoveredNode&&e.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1}),0===e.length?null:q`
      <g class="wall-endpoints-layer">
        ${e.map(t=>q`
          <circle
            class="wall-endpoint ${t.isDragging?"dragging":""}"
            cx="${t.coords.x}"
            cy="${t.coords.y}"
            r="6"
            @pointerdown=${e=>this._handleNodePointerDown(e,t.node)}
          />
        `)}
        ${this._draggingNode?this._renderDraggedEdgeLengths(t):null}
      </g>
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,o=jt(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y),i=Xt(t),n=[];for(const t of i){const e=o.get(t.start_node),i=o.get(t.end_node);if(!e&&!i)continue;const r=e??t.startPos,s=i??t.endPos,a=this._calculateWallLength(r,s),l=Math.atan2(s.y-r.y,s.x-r.x);n.push({start:r,end:s,origStart:t.startPos,origEnd:t.endPos,length:a,angle:l,thickness:t.thickness})}const r=[];for(let t=0;t<n.length;t++)for(let o=t+1;o<n.length;o++){const i=Math.abs(n[t].angle-n[o].angle)%Math.PI;Math.abs(i-Math.PI/2)<.02&&r.push({point:e,angle:Math.min(n[t].angle,n[o].angle)})}return q`
      <!-- Original edge positions (ghost) -->
      ${n.map(({origStart:t,origEnd:e,thickness:o})=>{const i=e.x-t.x,n=e.y-t.y,r=Math.sqrt(i*i+n*n);if(0===r)return null;const s=-n/r*(o/2),a=i/r*(o/2);return q`
          <path
            class="wall-original-ghost"
            d="M${t.x+s},${t.y+a}
               L${e.x+s},${e.y+a}
               L${e.x-s},${e.y-a}
               L${t.x-s},${t.y-a}
               Z"
          />
        `})}

      <!-- Edge length labels -->
      ${n.map(({start:t,end:e,length:o})=>{const i=(t.x+e.x)/2,n=(t.y+e.y)/2,r=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return q`
          <g transform="translate(${i}, ${n}) rotate(${r>90||r<-90?r+180:r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${r.map(({point:t,angle:e})=>q`
        <g transform="translate(${t.x}, ${t.y}) rotate(${180*e/Math.PI})">
          <path
            class="right-angle-indicator"
            d="M 12 0 L 12 12 L 0 12"
            fill="none"
            stroke="var(--primary-color, #2196f3)"
            stroke-width="2"
          />
        </g>
      `)}
    `}_handleNodePointerDown(t,e){t.stopPropagation(),t.preventDefault();const o=this._hoveredNode||e;this._draggingNode={node:o,originalCoords:{x:o.x,y:o.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_renderDrawingPreview(){if("wall"===ge.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,o=this._calculateWallLength(t,e),i=(t.x+e.x)/2,n=(t.y+e.y)/2,r=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),s=r>90||r<-90?r+180:r;return q`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${t.x}" y1="${t.y}"
                x2="${e.x}" y2="${e.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${i}, ${n}) rotate(${s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_getPolygonCenter(t){if(0===t.length)return null;let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;return{x:e/t.length,y:o/t.length}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.a*t.x+e.c*t.y+e.e,i=e.b*t.x+e.d*t.y+e.f,n=this._svg.getBoundingClientRect();return{x:o-n.left,y:i-n.top}}const o=this._svg.getBoundingClientRect(),i=o.width/this._viewBox.width,n=o.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*i,y:(t.y-this._viewBox.y)*n}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const t=this._edgeEditor.edge;return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Wall Properties</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}>✕</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Length</span>
          <input
            type="number"
            .value=${this._editingLength}
            @input=${t=>this._editingLength=t.target.value}
            @keydown=${this._handleEditorKeyDown}
            ?disabled=${t.length_locked}
            autofocus
          />
          <span class="wall-editor-unit">cm</span>
          <button
            class="constraint-btn ${t.length_locked?"active":""}"
            @click=${()=>this._toggleLengthLock()}
            title="${t.length_locked?"Unlock length":"Lock length"}"
          >${t.length_locked?"🔒":"🔓"}</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Angle</span>
          <button
            class="constraint-btn ${t.angle_locked?"active":""}"
            @click=${()=>this._toggleAngleLock()}
            title="${t.angle_locked?"Unlock angle":"Lock angle"}"
          >${t.angle_locked?"🔒 Locked":"🔓 Free"}</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Direction</span>
          <div class="wall-editor-constraints">
            <button
              class="constraint-btn ${"free"===t.direction?"active":""}"
              @click=${()=>this._setDirection("free")}
              title="Free direction"
            >Free</button>
            <button
              class="constraint-btn ${"horizontal"===t.direction?"active":""}"
              @click=${()=>this._setDirection("horizontal")}
              title="Lock horizontal"
            ><span>―</span> H</button>
            <button
              class="constraint-btn ${"vertical"===t.direction?"active":""}"
              @click=${()=>this._setDirection("vertical")}
              title="Lock vertical"
            ><span>|</span> V</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}>Apply</button>
          <button class="delete-btn" @click=${this._handleEdgeDelete}>Delete</button>
        </div>
      </div>
    `}async _toggleLengthLock(){if(!this._edgeEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=this._edgeEditor.edge;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id,length_locked:!o.length_locked}),await $e(),this._refreshEdgeEditor(o.id)}catch(t){console.error("Error toggling length lock:",t),alert(`Failed to toggle length lock: ${t}`)}}async _toggleAngleLock(){if(!this._edgeEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=this._edgeEditor.edge;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id,angle_locked:!o.angle_locked}),await $e(),this._refreshEdgeEditor(o.id)}catch(t){console.error("Error toggling angle lock:",t),alert(`Failed to toggle angle lock: ${t}`)}}async _setDirection(t){if(!this._edgeEditor||!this.hass)return;const e=ue.value,o=he.value;if(!e||!o)return;const i=this._edgeEditor.edge;try{const n=qt(Ut(e.nodes,e.edges),i.id,t);if(n.blocked)return void alert("Cannot apply direction: blocked by connected edges.");await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:o.id,floor_id:e.id,edge_id:i.id,direction:t}),n.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:e.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await $e(),await this._syncRoomsWithEdges(),this._refreshEdgeEditor(i.id)}catch(t){console.error("Error setting edge direction:",t),alert(`Failed to set edge direction: ${t}`)}}_refreshEdgeEditor(t){const e=ue.value;if(e){const o=e.edges.find(e=>e.id===t);if(o&&this._edgeEditor){const t=Kt(e.nodes),i=t.get(o.start_node),n=t.get(o.end_node);if(i&&n){const t=this._calculateWallLength(i,n);this._edgeEditor={edge:o,position:{x:(i.x+n.x)/2,y:(i.y+n.y)/2},length:t},this._editingLength=Math.round(t).toString()}}}}_getFilteredEntities(){if(!this.hass)return[];const t=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));if(this._entitySearch){const t=this._entitySearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[e]||"mdi:devices"}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=ue.value,o=he.value;if(!e||!o)return;const i=this.hass,n=o.id,r=e.id,s={...this._pendingDevice.position},a=t.startsWith("binary_sensor.")||t.startsWith("sensor."),l={id:""};try{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:r,entity_id:t,position:s,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await $e(),ie({type:"device_place",description:"Place device",undo:async()=>{await i.callWS({type:"inhabit/devices/remove",floor_plan_id:n,device_id:l.id}),await $e()},redo:async()=>{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:r,entity_id:t,position:s,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await $e()}})}catch(t){console.error("Error placing device:",t),alert(`Failed to place device: ${t}`)}this._pendingDevice=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return j`
      <div class="entity-picker"
           style="left: ${t.x+20}px; top: ${t.y-10}px;"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <input
          type="text"
          placeholder="Search entities..."
          .value=${this._entitySearch}
          @input=${t=>this._entitySearch=t.target.value}
          @keydown=${t=>"Escape"===t.key&&this._cancelDevicePlacement()}
          autofocus
        />
        <div class="entity-list">
          ${e.map(t=>j`
              <div
                class="entity-item ${"on"===t.state?"on":""}"
                @click=${()=>this._placeDevice(t.entity_id)}
              >
                <ha-icon icon=${this._getEntityIcon(t)}></ha-icon>
                <span class="name">${t.attributes.friendly_name||t.entity_id}</span>
                <span class="state">${t.state}</span>
              </div>
            `)}
        </div>
      </div>
    `}render(){const t=this._canvasMode,e=[this._isPanning?"panning":"","select"===ge.value?"select-tool":"","viewing"===t?"view-mode":""].filter(Boolean).join(" ");return j`
      <svg
        class="${e}"
        viewBox="${o=this._viewBox,`${o.x} ${o.y} ${o.width} ${o.height}`}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderFloor()}
        ${"walls"===t?this._renderEdgeAnnotations():null}
        ${"walls"===t?this._renderNodeEndpoints():null}
        ${"viewing"!==t?this._renderDrawingPreview():null}
        ${"placement"===t?this._renderDevicePreview():null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"placement"===t?this._renderEntityPicker():null}
    `;var o}_renderEdgeAnnotations(){const t=ue.value;if(!t||0===t.edges.length)return null;const e=Xt(t);return q`
      <g class="wall-annotations-layer">
        ${e.map(t=>{const e=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,i=this._calculateWallLength(t.startPos,t.endPos),n=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),r=n>90||n<-90?n+180:n,s=[];t.length_locked&&s.push("📏"),t.angle_locked&&s.push("📐"),"horizontal"===t.direction&&s.push("―"),"vertical"===t.direction&&s.push("|");const a=`${this._formatLength(i)}${s.length>0?` ${s.join("")}`:""}`,l=t.endPos.x-t.startPos.x,d=t.endPos.y-t.startPos.y,c=Math.sqrt(l*l+d*d);if(0===c)return null;const h=-d/c,u=l/c,p=t.thickness/2+10;return q`
            <g transform="translate(${e+h*p}, ${o+u*p}) rotate(${r})">
              <rect class="wall-annotation-bg" x="${3.2*-a.length}" y="-7" width="${6.4*a.length}" height="14" rx="3"/>
              <text class="wall-annotation-text" x="0" y="0">${a}</text>
            </g>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const t=this._multiEdgeEditor.edges,e=t.every(t=>t.angle_locked),o=t.some(t=>t.angle_locked);return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,fe.value={type:"none",ids:[]}}}>✕</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Angle</span>
          <button
            class="constraint-btn ${e?"active":""}"
            @click=${()=>this._toggleMultiAngleLock()}
            title="${e?"Unlock all angles":"Lock all angles"}"
          >${e?"🔒 All Locked":o?"🔓 Partial":"🔓 All Free"}</button>
        </div>

        <div class="wall-editor-actions">
          <button class="delete-btn" @click=${()=>this._handleMultiEdgeDelete()}>Delete All</button>
        </div>
      </div>
    `}async _toggleMultiAngleLock(){if(!this._multiEdgeEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges,i=o.every(t=>t.angle_locked),n=!i;try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id,angle_locked:n});await $e();const i=ue.value;if(i){const t=o.map(t=>t.id),e=t.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:e}}}catch(t){console.error("Error toggling multi-edge angle lock:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=ue.value,e=he.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges;try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id});await $e(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,fe.value={type:"none",ids:[]}}_renderDevicePreview(){return"device"!==ge.value||this._pendingDevice?null:q`
      <g class="device-preview">
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="12"
          fill="var(--primary-color, #2196f3)"
          fill-opacity="0.3"
          stroke="var(--primary-color, #2196f3)"
          stroke-width="2"
          stroke-dasharray="4,2"
        />
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="3"
          fill="var(--primary-color, #2196f3)"
        />
      </g>
    `}};t([pt({attribute:!1})],ae.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,o,i)=>((t,e,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,o),o))(e,o,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],ae.prototype,"_svg",void 0),t([gt()],ae.prototype,"_viewBox",void 0),t([gt()],ae.prototype,"_isPanning",void 0),t([gt()],ae.prototype,"_panStart",void 0),t([gt()],ae.prototype,"_cursorPos",void 0),t([gt()],ae.prototype,"_wallStartPoint",void 0),t([gt()],ae.prototype,"_roomEditor",void 0),t([gt()],ae.prototype,"_haAreas",void 0),t([gt()],ae.prototype,"_hoveredNode",void 0),t([gt()],ae.prototype,"_draggingNode",void 0),t([gt()],ae.prototype,"_edgeEditor",void 0),t([gt()],ae.prototype,"_multiEdgeEditor",void 0),t([gt()],ae.prototype,"_editingLength",void 0),t([gt()],ae.prototype,"_pendingDevice",void 0),t([gt()],ae.prototype,"_entitySearch",void 0),t([gt()],ae.prototype,"_canvasMode",void 0),ae=t([ct("fpb-canvas")],ae);const le=[{id:"wall",icon:"mdi:wall",label:"Wall"}],de=[{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"},{id:"device",icon:"mdi:devices",label:"Device"}];let ce=class extends lt{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._canvasMode="walls",this._cleanupEffects=[],this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=s`
    :host {
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 4px;
      background: var(--app-header-background-color, var(--primary-color));
      color: var(--app-header-text-color, var(--text-primary-color));
      box-sizing: border-box;
    }

    /* --- Floor selector dropdown --- */
    .floor-selector {
      position: relative;
    }

    .floor-trigger {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font-size: 16px;
      font-weight: 400;
      cursor: pointer;
      white-space: nowrap;
    }

    .floor-trigger:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .floor-trigger ha-icon {
      --mdc-icon-size: 18px;
      transition: transform 0.2s ease;
    }

    .floor-trigger.open ha-icon {
      transform: rotate(180deg);
    }

    .floor-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
      padding: 4px 0;
    }

    .floor-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
    }

    .floor-option:hover {
      background: var(--secondary-background-color);
    }

    .floor-option.selected {
      color: var(--primary-color);
      font-weight: 500;
    }

    .floor-option.selected ha-icon {
      color: var(--primary-color);
    }

    .floor-option ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }

    .floor-dropdown-divider {
      height: 1px;
      background: var(--divider-color);
      margin: 4px 0;
    }

    .floor-option .delete-btn {
      display: none;
      margin-left: auto;
      padding: 2px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
    }

    .floor-option .delete-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .delete-btn {
      display: flex;
    }

    .floor-option .delete-btn:hover {
      color: var(--error-color, #f44336);
    }

    .floor-option.add-floor {
      color: var(--secondary-text-color);
    }

    .floor-option.add-floor:hover {
      color: var(--primary-text-color);
    }

    /* --- Divider --- */
    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 4px;
    }

    .tool-group {
      display: flex;
      gap: 2px;
    }

    .tool-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .tool-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .tool-button.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .tool-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .tool-button:disabled:hover {
      background: transparent;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* --- Mode switcher --- */
    .mode-group {
      display: flex;
      gap: 0;
    }

    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .mode-button:first-child {
      border-radius: 4px 0 0 4px;
    }

    .mode-button:last-child {
      border-radius: 0 4px 4px 0;
    }

    .mode-button:not(:first-child) {
      border-left: none;
    }

    .mode-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mode-button.active {
      background: rgba(255, 255, 255, 0.25);
    }

    .mode-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .spacer {
      flex: 1;
    }

    /* --- Add button + menu --- */
    .add-button-container {
      position: relative;
    }

    .add-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .add-button:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button.menu-open {
      background: rgba(255, 255, 255, 0.25);
      border-radius: 4px 4px 0 0;
    }

    .add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-width: 140px;
      z-index: 100;
      overflow: hidden;
      padding: 4px 0;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
    }

    .add-menu-item:hover {
      background: var(--secondary-background-color);
    }

    .add-menu-item.active {
      color: var(--primary-color);
      font-weight: 500;
    }

    .add-menu-item ha-icon {
      --mdc-icon-size: 18px;
    }
  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){ge.value=t,this._addMenuOpen=!1}_handleUndo(){ne()}_handleRedo(){re()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,o){t.stopPropagation(),confirm(`Delete "${o}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick),this._cleanupEffects.push(Lt(()=>{this._canvasMode=pe.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}render(){const t=he.value,e=ue.value,o=ge.value,i=this._canvasMode,n=t?.floors||[],r="walls"===i?le:"placement"===i?de:[];return j`
      <!-- Floor Selector -->
      ${n.length>0?j`
        <div class="floor-selector">
          <button
            class="floor-trigger ${this._floorMenuOpen?"open":""}"
            @click=${this._toggleFloorMenu}
          >
            ${e?.name||"Select floor"}
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          ${this._floorMenuOpen?j`
            <div class="floor-dropdown">
              ${n.map(t=>j`
                  <button
                    class="floor-option ${t.id===e?.id?"selected":""}"
                    @click=${()=>this._selectFloor(t.id)}
                  >
                    <ha-icon icon="mdi:layers"></ha-icon>
                    ${t.name}
                    <span class="delete-btn"
                          @click=${e=>this._handleDeleteFloor(e,t.id,t.name)}
                          title="Delete floor">
                      <ha-icon icon="mdi:delete-outline"></ha-icon>
                    </span>
                  </button>
                `)}
              <div class="floor-dropdown-divider"></div>
              <button class="floor-option add-floor" @click=${this._handleAddFloor}>
                <ha-icon icon="mdi:plus"></ha-icon>
                Add floor
              </button>
            </div>
          `:null}
        </div>
      `:j`
        <button class="floor-trigger" @click=${this._handleAddFloor}>
          <ha-icon icon="mdi:plus" style="--mdc-icon-size: 16px;"></ha-icon>
          Add floor
        </button>
      `}

      <div class="spacer"></div>

      <!-- Mode Switcher -->
      <div class="mode-group">
        <button
          class="mode-button ${"viewing"===i?"active":""}"
          @click=${()=>_e("viewing")}
          title="View mode"
        >
          <ha-icon icon="mdi:eye-outline"></ha-icon>
        </button>
        <button
          class="mode-button ${"walls"===i?"active":""}"
          @click=${()=>_e("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===i?"active":""}"
          @click=${()=>_e("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
      </div>

      <div class="spacer"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!ee.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!oe.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Add Menu (right side, hidden in viewing mode) -->
      ${r.length>0?j`
        <div class="add-button-container">
          <button
            class="add-button ${this._addMenuOpen?"menu-open":""}"
            @click=${this._toggleAddMenu}
            title="Add element"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
          ${this._addMenuOpen?j`
                <div class="add-menu">
                  ${r.map(t=>j`
                      <button
                        class="add-menu-item ${o===t.id?"active":""}"
                        @click=${()=>this._handleToolSelect(t.id)}
                      >
                        <ha-icon icon=${t.icon}></ha-icon>
                        ${t.label}
                      </button>
                    `)}
                </div>
              `:null}
        </div>
      `:null}
    `}};t([pt({attribute:!1})],ce.prototype,"hass",void 0),t([pt({attribute:!1})],ce.prototype,"floorPlans",void 0),t([gt()],ce.prototype,"_addMenuOpen",void 0),t([gt()],ce.prototype,"_floorMenuOpen",void 0),t([gt()],ce.prototype,"_canvasMode",void 0),ce=t([ct("fpb-toolbar")],ce);const he=kt(null),ue=kt(null),pe=kt("walls"),ge=kt("select"),fe=kt({type:"none",ids:[]});function _e(t){pe.value=t,ge.value="select",fe.value={type:"none",ids:[]}}const ye=kt({x:0,y:0,width:1e3,height:800}),ve=kt(10),xe=kt(!0);kt(!0);const me=kt([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),be=kt([]);let we=null;async function $e(){we&&await we()}class Ee extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1}static{this.styles=s`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      --toolbar-height: var(--header-height, 48px);
    }

    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    fpb-toolbar {
      height: var(--toolbar-height);
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .loading,
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }

    .error {
      color: var(--error-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      padding: 32px;
      text-align: center;
    }

    .empty-state h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      color: var(--secondary-text-color);
      max-width: 400px;
    }

    .empty-state .init-form {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .empty-state .init-form label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .empty-state .init-form input {
      width: 60px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .empty-state button {
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .empty-state button:hover {
      opacity: 0.9;
    }
  `}connectedCallback(){super.connectedCallback(),this._loadFloorPlans(),we=()=>this._reloadCurrentFloor()}async _reloadCurrentFloor(){if(!this.hass)return;const t=he.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const o=e.find(e=>e.id===t.id);if(o){he.value=o;const t=ue.value?.id;if(t){const e=o.floors.find(e=>e.id===t);e?ue.value=e:o.floors.length>0&&(ue.value=o.floors[0])}else o.floors.length>0&&(ue.value=o.floors[0]);await this._loadDevicePlacements(o.id)}}catch(t){console.error("Error reloading floor data:",t)}}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(he.value=t[0],t[0].floors.length>0&&(ue.value=t[0].floors[0],ve.value=t[0].grid_size),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});be.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let o=0;o<t;o++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${o+1}`,level:o});e.floors.push(t)}this._floorPlans=[e],he.value=e,ue.value=e.floors[0],ve.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t}`)}}async _addFloor(){if(!this.hass)return;const t=he.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const o=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),i={...t,floors:[...t.floors,o]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?i:e),he.value=i,ue.value=o}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=he.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const o=e.floors.filter(e=>e.id!==t),i={...e,floors:o};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?i:t),he.value=i,ue.value?.id===t&&(se(),ue.value=o.length>0?o[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t}`)}}_handleFloorSelect(t){const e=he.value;if(e){const o=e.floors.find(e=>e.id===t);o&&(ue.value?.id!==o.id&&se(),ue.value=o)}}render(){return this._loading?j`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plans...</p>
        </div>
      `:this._error?j`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?j`
        <div class="empty-state">
          <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
          <h2>Welcome to Inhabit</h2>
          <p>
            Create visual floor plans of your home, place devices, and set up
            spatial automations with occupancy detection.
          </p>
          <div class="init-form">
            <label>Floors</label>
            <input
              type="number"
              min="1"
              max="10"
              .value=${String(this._floorCount)}
              @input=${t=>{const e=parseInt(t.target.value,10);e>=1&&e<=10&&(this._floorCount=e)}}
            />
            <button @click=${()=>this._initializeFloors(this._floorCount)}>Get Started</button>
          </div>
        </div>
      `:j`
      <div class="container">
        <div class="main-area">
          <fpb-toolbar
            .hass=${this.hass}
            .floorPlans=${this._floorPlans}
            @floor-select=${t=>this._handleFloorSelect(t.detail.id)}
            @add-floor=${this._addFloor}
            @delete-floor=${t=>this._deleteFloor(t.detail.id)}
          ></fpb-toolbar>

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>
      </div>
    `}}t([pt({attribute:!1})],Ee.prototype,"hass",void 0),t([pt({type:Boolean})],Ee.prototype,"narrow",void 0),t([gt()],Ee.prototype,"_floorPlans",void 0),t([gt()],Ee.prototype,"_loading",void 0),t([gt()],Ee.prototype,"_error",void 0),t([gt()],Ee.prototype,"_floorCount",void 0),customElements.define("ha-floorplan-builder",Ee);export{Ee as HaFloorplanBuilder};
