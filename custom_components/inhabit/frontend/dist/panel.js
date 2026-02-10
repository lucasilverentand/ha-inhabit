function t(t,e,o,i){var n,s=arguments.length,r=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(s<3?n(r):s>3?n(e,o,r):n(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,o=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let s=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(o&&void 0===t){const o=void 0!==e&&1===e.length;o&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&n.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new s(o,t,i)},a=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,g=globalThis,f=g.trustedTypes,_=f?f.emptyScript:"",y=g.reactiveElementPolyfillSupport,v=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},m=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(t,o,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const s=i?.call(this);n?.call(this,e),this.requestUpdate(t,s,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...u(t)];for(const o of e)this.createProperty(o,t[o])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,o]of e)this.elementProperties.set(t,o)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const o=this._$Eu(t,e);void 0!==o&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(o)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const o of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=o.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){const o=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:x).toAttribute(e,o.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const o=this.constructor,i=o._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=o.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=i;const s=n.fromAttribute(e,t.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(t,e,o,i=!1,n){if(void 0!==t){const s=this.constructor;if(!1===i&&(n=this[t]),o??=s.getPropertyOptions(t),!((o.hasChanged??m)(n,e)||o.useDefault&&o.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,o))))return;this.C(t,e,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:i,wrapped:n},s){o&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,o]of t){const{wrapped:t}=o,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,o,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=t=>t,E=$.trustedTypes,M=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+P,C=`<${A}>`,I=document,L=()=>I.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,W="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,O=/>/g,B=RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,F=/"/g,T=/^(?:script|style|textarea|title)$/i,H=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),j=H(1),V=H(2),q=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),Y=new WeakMap,X=I.createTreeWalker(I,129);function Z(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(e):e}class G{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,s=0;const r=t.length-1,a=this.parts,[l,d]=((t,e)=>{const o=t.length-1,i=[];let n,s=2===e?"<svg>":3===e?"<math>":"",r=z;for(let e=0;e<o;e++){const o=t[e];let a,l,d=-1,c=0;for(;c<o.length&&(r.lastIndex=c,l=r.exec(o),null!==l);)c=r.lastIndex,r===z?"!--"===l[1]?r=R:void 0!==l[1]?r=O:void 0!==l[2]?(T.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=B):void 0!==l[3]&&(r=B):r===B?">"===l[0]?(r=n??z,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?B:'"'===l[3]?F:U):r===F||r===U?r=B:r===R||r===O?r=z:(r=B,n=void 0);const h=r===B&&t[e+1].startsWith("/>")?" ":"";s+=r===z?o+C:d>=0?(i.push(a),o.slice(0,d)+S+o.slice(d)+P+h):o+P+(-2===d?e:h)}return[Z(t,s+(t[o]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]})(t,e);if(this.el=G.createElement(l,o),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=X.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(S)){const e=d[s++],o=i.getAttribute(t).split(P),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:o,ctor:"."===r[1]?ot:"?"===r[1]?it:"@"===r[1]?nt:et}),i.removeAttribute(t)}else t.startsWith(P)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(T.test(i.tagName)){const t=i.textContent.split(P),e=t.length-1;if(e>0){i.textContent=E?E.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],L()),X.nextNode(),a.push({type:2,index:++n});i.append(t[e],L())}}}else if(8===i.nodeType)if(i.data===A)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(P,t+1));)a.push({type:7,index:n}),t+=P.length-1}n++}}static createElement(t,e){const o=I.createElement("template");return o.innerHTML=t,o}}function J(t,e,o=t,i){if(e===q)return e;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const s=N(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(e=J(t,n._$AS(t,e.values),n,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:o}=this._$AD,i=(t?.creationScope??I).importNode(e,!0);X.currentNode=i;let n=X.nextNode(),s=0,r=0,a=o[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=o[++r]}s!==a?.index&&(n=X.nextNode(),s++)}return X.currentNode=I,i}p(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),N(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(I.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:o}=t,i="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=G.createElement(Z(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),o=t.u(this.options);t.p(e),this.T(o),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new G(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new tt(this.O(L()),this.O(L()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,i,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=K}_$AI(t,e=this,o,i){const n=this.strings;let s=!1;if(void 0===n)t=J(this,t,e,0),s=!N(t)||t!==this._$AH&&t!==q,s&&(this._$AH=t);else{const i=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=J(this,i[o+r],e,r),a===q&&(a=this._$AH[r]),s||=!N(a)||a!==this._$AH[r],a===K?t=K:t!==K&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!i&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends et{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??K)===q)return;const o=this._$AH,i=t===K&&o!==K||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==K&&(o===K||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const rt=$.litHtmlPolyfillSupport;rt?.(G,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{const i=o?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=o?.renderBefore??null;i._$litPart$=n=new tt(e.insertBefore(L(),t),t,void 0,o??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,o)=>{void 0!==o?o.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:m},ut=(t=ht,e,o)=>{const{kind:i,metadata:n}=o;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),s.set(o.name,t),"accessor"===i){const{name:i}=o;return{set(o){const n=e.get.call(this);e.set.call(this,o),this.requestUpdate(i,n,t,!0,o)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];e.call(this,o),this.requestUpdate(i,n,t,!0,o)}}throw Error("Unsupported decorator location: "+i)};
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
 */const ft=Symbol.for("preact-signals");function _t(){if(mt>1)return void mt--;let t,e=!1;for(;void 0!==vt;){let o=vt;for(vt=void 0,bt++;void 0!==o;){const i=o.o;if(o.o=void 0,o.f&=-3,!(8&o.f)&&Mt(o))try{o.c()}catch(o){e||(t=o,e=!0)}o=i}}if(bt=0,mt--,e)throw t}let yt,vt;function xt(t){const e=yt;yt=void 0;try{return t()}finally{yt=e}}let mt=0,bt=0,wt=0;function $t(t){if(void 0===yt)return;let e=t.n;return void 0===e||e.t!==yt?(e={i:0,S:t,p:yt.s,n:void 0,t:yt,e:void 0,x:void 0,r:e},void 0!==yt.s&&(yt.s.n=e),yt.s=e,t.n=e,32&yt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=yt.s,e.n=void 0,yt.s.n=e,yt.s=e),e):void 0}function kt(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Et(t,e){return new kt(t,e)}function Mt(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function St(t){for(let e=t.s;void 0!==e;e=e.n){const o=e.S.n;if(void 0!==o&&(e.r=o),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Pt(t){let e,o=t.s;for(;void 0!==o;){const t=o.p;-1===o.i?(o.S.U(o),void 0!==t&&(t.n=o.n),void 0!==o.n&&(o.n.p=t)):e=o,o.S.n=o.r,void 0!==o.r&&(o.r=void 0),o=t}t.s=e}function At(t,e){kt.call(this,void 0),this.x=t,this.s=void 0,this.g=wt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Ct(t,e){return new At(t,e)}function It(t){const e=t.u;if(t.u=void 0,"function"==typeof e){mt++;const o=yt;yt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Lt(t),e}finally{yt=o,_t()}}}function Lt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,It(t)}function Nt(t){if(yt!==this)throw new Error("Out-of-order effect");Pt(this),yt=t,this.f&=-2,8&this.f&&Lt(this),_t()}function Dt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Wt(t,e){const o=new Dt(t,e);try{o.c()}catch(t){throw o.d(),t}const i=o.d.bind(o);return i[Symbol.dispose]=i,i}function zt(t,e){const o=e.x-t.x,i=e.y-t.y;return Math.sqrt(o*o+i*i)}function Rt(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function Ot(t){if(t.length<2)return{anchor:t[0]||{x:0,y:0},dir:{x:1,y:0}};let e=0,o=t[0],i=t[1];for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const r=zt(t[n],t[s]);r>e&&(e=r,o=t[n],i=t[s])}if(e<1e-9)return{anchor:o,dir:{x:1,y:0}};return{anchor:o,dir:{x:(i.x-o.x)/e,y:(i.y-o.y)/e}}}function Bt(t,e,o){const i=t.x-e.x,n=t.y-e.y,s=i*o.x+n*o.y;return{x:e.x+s*o.x,y:e.y+s*o.y}}kt.prototype.brand=ft,kt.prototype.h=function(){return!0},kt.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:xt(()=>{var t;null==(t=this.W)||t.call(this)}))},kt.prototype.U=function(t){if(void 0!==this.t){const e=t.e,o=t.x;void 0!==e&&(e.x=o,t.e=void 0),void 0!==o&&(o.e=e,t.x=void 0),t===this.t&&(this.t=o,void 0===o&&xt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},kt.prototype.subscribe=function(t){return Wt(()=>{const e=this.value,o=yt;yt=void 0;try{t(e)}finally{yt=o}},{name:"sub"})},kt.prototype.valueOf=function(){return this.value},kt.prototype.toString=function(){return this.value+""},kt.prototype.toJSON=function(){return this.value},kt.prototype.peek=function(){const t=yt;yt=void 0;try{return this.value}finally{yt=t}},Object.defineProperty(kt.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(bt>100)throw new Error("Cycle detected");this.v=t,this.i++,wt++,mt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{_t()}}}}),At.prototype=new kt,At.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===wt)return!0;if(this.g=wt,this.f|=1,this.i>0&&!Mt(this))return this.f&=-2,!0;const t=yt;try{St(this),yt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return yt=t,Pt(this),this.f&=-2,!0},At.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}kt.prototype.S.call(this,t)},At.prototype.U=function(t){if(void 0!==this.t&&(kt.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},At.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(At.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Dt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Dt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,It(this),St(this),mt++;const t=yt;return yt=this,Nt.bind(this,t)},Dt.prototype.N=function(){2&this.f||(this.f|=2,this.o=vt,vt=this)},Dt.prototype.d=function(){this.f|=8,1&this.f||Lt(this)},Dt.prototype.dispose=function(){this.d()};const Ut=.05,Ft=.2,Tt="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),Ht="%c[constraint]",jt="color:#8b5cf6;font-weight:bold",Vt="color:#888",qt="color:#ef4444;font-weight:bold",Kt="color:#22c55e;font-weight:bold";function Yt(t){return`(${t.x.toFixed(1)},${t.y.toFixed(1)})`}function Xt(t,e){const o=e.get(t.start_node),i=e.get(t.end_node),n=[];"free"!==t.direction&&n.push(t.direction),t.length_locked&&n.push("len🔒"),t.angle_group&&n.push(`ang:${t.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=o&&i?zt(o,i).toFixed(1):"?";return`${t.id.slice(0,8)}… (${r}cm${s})`}function Zt(t){return t.slice(0,8)+"…"}function Gt(t,e){const o=new Map,i=new Map,n=new Map;for(const e of t)o.set(e.id,e);for(const t of e)i.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:o,edges:i,nodeToEdges:n}}function Jt(t){return"free"!==t.direction||t.length_locked}function Qt(t){const e=new Map;for(const[o,i]of t.nodes)e.set(o,{x:i.x,y:i.y});return e}function te(t,e,o,i,n){let s={x:i.x,y:i.y};if("horizontal"===t.direction?s={x:s.x,y:o.y}:"vertical"===t.direction&&(s={x:o.x,y:s.y}),t.length_locked){const e=zt(n.nodes.get(t.start_node),n.nodes.get(t.end_node)),i=s.x-o.x,r=s.y-o.y,a=Math.sqrt(i*i+r*r);if(a>0&&e>0){const t=e/a;s={x:o.x+i*t,y:o.y+r*t}}}return s}function ee(t,e,o,i,n){const s=i.has(t.start_node),r=i.has(t.end_node);if(s&&r)return{idealStart:e,idealEnd:o};if(s){return{idealStart:e,idealEnd:te(t,t.start_node,e,o,n)}}if(r){return{idealStart:te(t,t.end_node,o,e,n),idealEnd:o}}return function(t,e,o,i){const n=zt(i.nodes.get(t.start_node),i.nodes.get(t.end_node));let s={x:e.x,y:e.y},r={x:o.x,y:o.y};if("horizontal"===t.direction){const t=(s.y+r.y)/2;s={x:s.x,y:t},r={x:r.x,y:t}}else if("vertical"===t.direction){const t=(s.x+r.x)/2;s={x:t,y:s.y},r={x:t,y:r.y}}if(t.length_locked){const t=(s.x+r.x)/2,e=(s.y+r.y)/2,o=r.x-s.x,i=r.y-s.y,a=Math.sqrt(o*o+i*i);if(a>0&&n>0){const l=n/2/(a/2);s={x:t-o/2*l,y:e-i/2*l},r={x:t+o/2*l,y:e+i/2*l}}}return{idealStart:s,idealEnd:r}}(t,e,o,n)}function oe(t,e){let o=0;const i=[],n=new Map;for(const[s,r]of t.edges){if(!Jt(r))continue;const a=e.get(r.start_node),l=e.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const e=zt(t.nodes.get(r.start_node),t.nodes.get(r.end_node)),o=zt(a,l);d=Math.max(d,Math.abs(o-e))}n.set(s,d),d>Ft&&i.push(s),d>o&&(o=d)}const s=ne(t,e);for(const[,r]of s){let s=0;for(const t of r.nodeIds){const o=e.get(t);if(!o)continue;const i=zt(o,Bt(o,r.anchor,r.dir));s=Math.max(s,i)}for(const[e,o]of t.edges)if(o.collinear_group&&r.nodeIds.has(o.start_node)){const t=n.get(e)??0;n.set(e,Math.max(t,s)),s>Ft&&(i.includes(e)||i.push(e));break}o=Math.max(o,s)}const r=se(t);for(const[,s]of r){const r=e.get(s.sharedNodeId);if(!r)continue;let a=0;for(let o=0;o<s.edgeIds.length;o++){const i=t.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=e.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=zt(r,l);for(let i=o+1;i<s.edgeIds.length;i++){const o=t.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=e.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let u=d-h;for(;u>Math.PI;)u-=2*Math.PI;for(;u<-Math.PI;)u+=2*Math.PI;const p=(c+zt(r,l))/2;a=Math.max(a,Math.abs(u)*p)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>Ft&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}const a=ae(t);for(const[,s]of a){const r=[];for(const o of s.edgeIds){const i=t.edges.get(o),n=e.get(i.start_node),s=e.get(i.end_node);n&&s?r.push(zt(n,s)):r.push(0)}let a=0;for(const t of r)a=Math.max(a,Math.abs(t-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>Ft&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}return{maxViolation:o,violatingEdgeIds:i,magnitudes:n}}function ie(t,e,o,i){const n=function(t,e){const o=[],i=new Set,n=new Set,s=[];for(const t of e)s.push(t),n.add(t);for(;s.length>0;){const e=s.shift(),r=t.nodeToEdges.get(e)||[];for(const{edgeId:a}of r){if(i.has(a))continue;i.add(a);const r=t.edges.get(a);if(!r)continue;o.push(r);const l=r.start_node===e?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return o}(t,e),s=n.filter(Jt),r=ne(t,o),a=se(t),l=ae(t);let d=0,c=0;Tt&&(console.groupCollapsed(Ht+" solveIterative: %c%d constrained edges, %d pinned nodes",jt,Vt,s.length,e.size),console.log("  Pinned nodes:",[...e].map(Zt).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(e=>Xt(e,t.nodes)).join(" | ")||"(none)"),i&&i.size>0&&console.log("  Pre-existing violations:",[...i.entries()].map(([e,o])=>{const i=t.edges.get(e);return(i?Xt(i,t.nodes):e.slice(0,8)+"…")+` (${o.toFixed(2)})`}).join(" | ")));for(let i=0;i<100;i++){d=0,c=i+1;const s=0===i?new Set(e):e;for(const r of n){if(!Jt(r))continue;const n=o.get(r.start_node),a=o.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=ee(r,n,a,s,t);if(!e.has(r.start_node)){const t=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,t),o.set(r.start_node,l)}if(!e.has(r.end_node)){const t=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,t),o.set(r.end_node,c)}0===i&&(s.add(r.start_node),s.add(r.end_node))}for(const[,t]of r)for(const i of t.nodeIds){if(e.has(i))continue;const n=o.get(i);if(!n)continue;const s=Bt(n,t.anchor,t.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>Ut&&(d=Math.max(d,r),o.set(i,s))}const h=re(t,a,e,o);d=Math.max(d,h);const u=le(t,l,e,o);if(d=Math.max(d,u),d<Ut)break}const h=[];for(const[e,i]of o){const o=t.nodes.get(e);(Math.abs(i.x-o.x)>Ut||Math.abs(i.y-o.y)>Ut)&&h.push({nodeId:e,x:i.x,y:i.y})}if(d<Ut)Tt&&console.log(Ht+" %cConverged%c in %d iteration(s), %d node(s) moved",jt,Kt,"",c,h.length);else{const{violatingEdgeIds:e,maxViolation:n,magnitudes:s}=oe(t,o),r=[];for(const t of e)if(i){const e=i.get(t);if(void 0===e)r.push(t);else{(s.get(t)??0)>e+Ut&&r.push(t)}}else r.push(t);if(r.length>0)return Tt&&(console.log(`${Ht} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,jt,qt,""),console.log("  All violating edges:",e.map(e=>{const o=t.edges.get(e);return o?Xt(o,t.nodes):e.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",r.map(e=>{const i=t.edges.get(e);if(!i)return e.slice(0,8)+"…";const n=o.get(i.start_node),s=o.get(i.end_node),r=n&&s?` now ${Yt(n)}→${Yt(s)}`:"";return Xt(i,t.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};Tt&&console.log(`${Ht} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,jt,"color:#f59e0b;font-weight:bold","")}return Tt&&console.groupEnd(),{updates:h,blocked:!1}}function ne(t,e){const o=new Map,i=new Map;for(const[,e]of t.edges){if(!e.collinear_group)continue;i.has(e.collinear_group)||i.set(e.collinear_group,new Set);const t=i.get(e.collinear_group);t.add(e.start_node),t.add(e.end_node)}for(const[t,n]of i){const i=[];for(const t of n){const o=e.get(t);o&&i.push(o)}if(i.length<2)continue;const{anchor:s,dir:r}=Ot(i);o.set(t,{nodeIds:n,anchor:s,dir:r})}return o}function se(t){const e=new Map,o=new Map;for(const[,e]of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e.id));for(const[i,n]of o){if(n.length<2)continue;const o=n.map(e=>t.edges.get(e)),s=new Map;for(const t of o)s.set(t.start_node,(s.get(t.start_node)??0)+1),s.set(t.end_node,(s.get(t.end_node)??0)+1);let r=null;for(const[t,e]of s)if(e===n.length){r=t;break}if(!r)continue;const a=t.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const e of o){const o=e.start_node===r?e.end_node:e.start_node,i=t.nodes.get(o);if(!i){d=!1;break}l.push(Math.atan2(i.y-a.y,i.x-a.x))}d&&e.set(i,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return e}function re(t,e,o,i){let n=0;for(const[,s]of e){const e=i.get(s.sharedNodeId);if(!e)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let o=0;o<r;o++){const n=t.edges.get(s.edgeIds[o]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=i.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-e.y,h.x-e.x))}if(!c)continue;const h=[];for(let t=0;t<r;t++){let e=d[t]-s.originalAngles[t];for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;h.push(e)}const u=a.map(t=>o.has(t)),p=u.filter(Boolean).length;if(p===r)continue;let g=0,f=0;if(p>0)for(let t=0;t<r;t++)u[t]&&(g+=Math.sin(h[t]),f+=Math.cos(h[t]));else for(let t=0;t<r;t++)g+=Math.sin(h[t]),f+=Math.cos(h[t]);const _=Math.atan2(g,f);for(let t=0;t<r;t++){if(u[t])continue;const o=s.originalAngles[t]+_,r=zt(e,l[t]),d={x:e.x+Math.cos(o)*r,y:e.y+Math.sin(o)*r},c=Math.max(Math.abs(d.x-l[t].x),Math.abs(d.y-l[t].y));n=Math.max(n,c),i.set(a[t],d)}}return n}function ae(t){const e=new Map,o=new Map;for(const[,e]of t.edges)e.link_group&&(o.has(e.link_group)||o.set(e.link_group,[]),o.get(e.link_group).push(e.id));for(const[i,n]of o){if(n.length<2)continue;let o=0;for(const e of n){const i=t.edges.get(e);o+=zt(t.nodes.get(i.start_node),t.nodes.get(i.end_node))}e.set(i,{edgeIds:n,targetLength:o/n.length})}return e}function le(t,e,o,i){let n=0;for(const[,s]of e)for(const e of s.edgeIds){const r=t.edges.get(e),a=i.get(r.start_node),l=i.get(r.end_node);if(!a||!l)continue;const d=zt(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=Ut)continue;const c=o.has(r.start_node),h=o.has(r.end_node);if(c&&h)continue;const u=l.x-a.x,p=l.y-a.y,g=s.targetLength/d;if(c){const t={x:a.x+u*g,y:a.y+p*g},e=Math.max(Math.abs(t.x-l.x),Math.abs(t.y-l.y));n=Math.max(n,e),i.set(r.end_node,t)}else if(h){const t={x:l.x-u*g,y:l.y-p*g},e=Math.max(Math.abs(t.x-a.x),Math.abs(t.y-a.y));n=Math.max(n,e),i.set(r.start_node,t)}else{const t=(a.x+l.x)/2,e=(a.y+l.y)/2,o=s.targetLength/2/(d/2),c={x:t-u/2*o,y:e-p/2*o},h={x:t+u/2*o,y:e+p/2*o},g=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,g),i.set(r.start_node,c),i.set(r.end_node,h)}}return n}function de(t,e,o,i){let n=o,s=i;const r=function(t,e){const o=t.nodeToEdges.get(e);if(!o)return null;for(const{edgeId:e}of o){const o=t.edges.get(e);if(o?.collinear_group)return o.collinear_group}return null}(t,e);if(r){const e=function(t,e){const o=new Set;for(const[,i]of t.edges)i.collinear_group===e&&(o.add(i.start_node),o.add(i.end_node));return o}(t,r),a=[];for(const o of e){const e=t.nodes.get(o);e&&a.push({x:e.x,y:e.y})}if(a.length>=2){const{anchor:t,dir:e}=Ot(a),r=Bt({x:o,y:i},t,e);n=r.x,s=r.y}}const a=Qt(t),{magnitudes:l}=oe(t,a),d=Qt(t);d.set(e,{x:n,y:s});const c=new Set([e]);for(const[o,i]of t.nodes)i.pinned&&o!==e&&c.add(o);const h=ie(t,c,d,l),u=h.updates.some(t=>t.nodeId===e);if(!u){const o=t.nodes.get(e);o.x===n&&o.y===s||h.updates.unshift({nodeId:e,x:n,y:s})}const p=h.updates.find(t=>t.nodeId===e);if(p&&(p.x=n,p.y=s),h.updates=h.updates.filter(o=>o.nodeId===e||!t.nodes.get(o.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:e,magnitudes:o}=oe(t,d),i=[];for(const t of e){const e=l.get(t);if(void 0===e)i.push(t);else{(o.get(t)??0)>e+Ut&&i.push(t)}}i.length>0&&(h.blocked=!0,h.blockedBy=i)}return h}function ce(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};if(Tt&&console.log(Ht+" solveEdgeLengthChange: %c%s → %scm",jt,Vt,Xt(i,t.nodes),o.toFixed(1)),i.length_locked)return Tt&&console.log(Ht+" %c→ BLOCKED: edge is length-locked",jt,qt),{updates:[],blocked:!0,blockedBy:[i.id]};const n=t.nodes.get(i.start_node),s=t.nodes.get(i.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===zt(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return Math.atan2(i.y-o.y,i.x-o.x)}(i,t.nodes),d=o/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},u=Qt(t);u.set(i.start_node,c),u.set(i.end_node,h);const p=new Set([i.start_node,i.end_node]);for(const[e,o]of t.nodes)o.pinned&&p.add(e);const g=ie(t,p,u);return g.updates.some(t=>t.nodeId===i.start_node)||g.updates.unshift({nodeId:i.start_node,x:c.x,y:c.y}),g.updates.some(t=>t.nodeId===i.end_node)||g.updates.push({nodeId:i.end_node,x:h.x,y:h.y}),g.updates=g.updates.filter(e=>e.nodeId===i.start_node||e.nodeId===i.end_node||!t.nodes.get(e.nodeId)?.pinned),g.blocked=!1,delete g.blockedBy,g}function he(t){const e=new Map;for(const o of t)e.set(o.nodeId,{x:o.x,y:o.y});return e}function ue(t,e,o,i,n){const s=de(Gt(t,e),o,i,n);return{positions:he(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function pe(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};const n=t.nodes.get(i.start_node),s=t.nodes.get(i.end_node);Tt&&(console.group(Ht+" solveConstraintSnap: %csnap %s → %s",jt,Vt,Xt(i,t.nodes),o),console.log(`  Nodes: ${Zt(i.start_node)} ${Yt(n)} → ${Zt(i.end_node)} ${Yt(s)}`));const r=function(t,e,o){if("free"===e)return null;const i=o.get(t.start_node),n=o.get(t.end_node);if(!i||!n)return null;const s=(i.x+n.x)/2,r=(i.y+n.y)/2,a=zt(i,n)/2;if("horizontal"===e){if(Math.round(i.y)===Math.round(n.y))return null;const e=i.x<=n.x;return{nodeUpdates:[{nodeId:t.start_node,x:e?s-a:s+a,y:r},{nodeId:t.end_node,x:e?s+a:s-a,y:r}]}}if("vertical"===e){if(Math.round(i.x)===Math.round(n.x))return null;const e=i.y<=n.y;return{nodeUpdates:[{nodeId:t.start_node,x:s,y:e?r-a:r+a},{nodeId:t.end_node,x:s,y:e?r+a:r-a}]}}return null}(i,o,t.nodes);if(!r)return Tt&&(console.log(Ht+" %cAlready satisfies %s — no-op",jt,Kt,o),console.groupEnd()),{updates:[],blocked:!1};const a=Qt(t),{magnitudes:l}=oe(t,a),d=r.nodeUpdates.find(t=>t.nodeId===i.start_node),c=r.nodeUpdates.find(t=>t.nodeId===i.end_node);Tt&&console.log(`  Snap target: ${Zt(i.start_node)} ${Yt(d)} → ${Zt(i.end_node)} ${Yt(c)}`);const h=Qt(t);h.set(i.start_node,{x:d.x,y:d.y}),h.set(i.end_node,{x:c.x,y:c.y});const u=new Set([i.start_node,i.end_node]);for(const[e,o]of t.nodes)o.pinned&&u.add(e);const p=ie(t,u,h,l);return p.updates.some(t=>t.nodeId===i.start_node)||p.updates.unshift({nodeId:i.start_node,x:d.x,y:d.y}),p.updates.some(t=>t.nodeId===i.end_node)||p.updates.push({nodeId:i.end_node,x:c.x,y:c.y}),p.updates=p.updates.filter(e=>e.nodeId===i.start_node||e.nodeId===i.end_node||!t.nodes.get(e.nodeId)?.pinned),Tt&&(p.blocked?console.log(Ht+" %c→ SNAP BLOCKED by: %s",jt,qt,(p.blockedBy||[]).map(e=>{const o=t.edges.get(e);return o?Xt(o,t.nodes):e.slice(0,8)+"…"}).join(" | ")):console.log(Ht+" %c→ Snap OK%c, %d node(s) to update",jt,Kt,"",p.updates.length),console.groupEnd()),p}function ge(t,e,o=.2){const i=new Map;for(const e of t)i.set(e.id,e);const n=[];for(const t of e){const e=i.get(t.start_node),s=i.get(t.end_node);if(e&&s)if("horizontal"===t.direction){const i=Math.abs(e.y-s.y);i>o&&n.push({edgeId:t.id,type:"direction",expected:0,actual:i})}else if("vertical"===t.direction){const i=Math.abs(e.x-s.x);i>o&&n.push({edgeId:t.id,type:"direction",expected:0,actual:i})}}const s=new Map,r=new Map;for(const t of e)t.collinear_group&&(s.has(t.collinear_group)||(s.set(t.collinear_group,new Set),r.set(t.collinear_group,t.id)),s.get(t.collinear_group).add(t.start_node),s.get(t.collinear_group).add(t.end_node));for(const[t,e]of s){const s=[];for(const t of e){const e=i.get(t);e&&s.push({x:e.x,y:e.y})}if(s.length<2)continue;const{anchor:a,dir:l}=Ot(s);let d=0;for(const t of s){const e=Bt(t,a,l);d=Math.max(d,zt(t,e))}d>o&&n.push({edgeId:r.get(t),type:"collinear",expected:0,actual:d})}const a=new Map;for(const t of e)t.link_group&&(a.has(t.link_group)||a.set(t.link_group,[]),a.get(t.link_group).push(t.id));for(const[,t]of a){if(t.length<2)continue;const s=[];for(const o of t){const t=e.find(t=>t.id===o),n=i.get(t.start_node),r=i.get(t.end_node);n&&r?s.push(zt(n,r)):s.push(0)}const r=s.reduce((t,e)=>t+e,0)/s.length;let a=0;for(const t of s)a=Math.max(a,Math.abs(t-r));a>o&&n.push({edgeId:t[0],type:"link_group",expected:r,actual:a})}return n}function fe(t){const e=new Map;for(const o of t)e.set(o.id,o);return e}function _e(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return o&&i?{...t,startPos:{x:o.x,y:o.y},endPos:{x:i.x,y:i.y}}:null}function ye(t){const e=fe(t.nodes),o=[];for(const i of t.edges){const t=_e(i,e);t&&o.push(t)}return o}function ve(t,e){return e.filter(e=>e.start_node===t||e.end_node===t)}function xe(t,e,o){let i=null,n=o;for(const o of e){const e=Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2);e<n&&(n=e,i=o)}return i}function me(t){let e=0;const o=t.length;for(let i=0;i<o;i++){const n=(i+1)%o;e+=t[i].x*t[n].y,e-=t[n].x*t[i].y}return e/2}function be(t){const e=t.length;if(e<3){let o=0,i=0;for(const e of t)o+=e.x,i+=e.y;return{x:o/e,y:i/e}}let o=0,i=0,n=0;for(let s=0;s<e;s++){const r=(s+1)%e,a=t[s].x*t[r].y-t[r].x*t[s].y;o+=a,i+=(t[s].x+t[r].x)*a,n+=(t[s].y+t[r].y)*a}if(o/=2,Math.abs(o)<1e-6){let o=0,i=0;for(const e of t)o+=e.x,i+=e.y;return{x:o/e,y:i/e}}const s=1/(6*o);return{x:i*s,y:n*s}}const we=Et([]),$e=Et([]),ke=Et(!1),Ee=Ct(()=>we.value.length>0&&!ke.value),Me=Ct(()=>$e.value.length>0&&!ke.value);function Se(t){we.value=[...we.value.slice(-99),t],$e.value=[]}async function Pe(){const t=we.value;if(0===t.length||ke.value)return;const e=t[t.length-1];ke.value=!0;try{await e.undo()}finally{ke.value=!1}we.value=t.slice(0,-1),$e.value=[...$e.value,e]}async function Ae(){const t=$e.value;if(0===t.length||ke.value)return;const e=t[t.length-1];ke.value=!0;try{await e.redo()}finally{ke.value=!1}$e.value=t.slice(0,-1),we.value=[...we.value,e]}function Ce(){we.value=[],$e.value=[]}const Ie=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function Le(t){let e=0;for(let o=0;o<t.length;o++)e=(e<<5)-e+t.charCodeAt(o);return Ie[Math.abs(e)%Ie.length]}let Ne=class extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._blinkingEdgeIds=[],this._blinkTimer=null,this._pendingDevice=null,this._entitySearch="",this._canvasMode="walls",this._cleanupEffects=[]}static{this.styles=r`
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
      user-select: none;
      -webkit-user-select: none;
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

    @keyframes wall-blink {
      0%, 100% { opacity: 0; }
      25%, 75% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    .wall-blocked-blink {
      fill: var(--error-color, #f44336);
      stroke: none;
      pointer-events: none;
      animation: wall-blink 0.6s ease-in-out 3;
    }

    .wall-conflict-highlight {
      fill: none;
      stroke: #ff9800;
      stroke-width: 2;
      stroke-dasharray: 6,4;
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

    .room-label-group {
      pointer-events: none;
    }

    .room-label {
      font-size: 14px;
      font-weight: 500;
      fill: #000;
      text-anchor: middle;
      dominant-baseline: middle;
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
    }

    .room-link-icon {
      opacity: 0.7;
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
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
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

    .wall-endpoint.pinned rect {
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
    }

    .wall-endpoint.pinned {
      cursor: not-allowed;
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
      width: 300px;
      background: var(--card-background-color, white);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .wall-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .wall-editor-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary-text-color, #333);
      letter-spacing: -0.01em;
    }

    .wall-editor-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 20px;
      transition: color 0.15s, background 0.15s;
    }

    .wall-editor-close:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .wall-editor-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .wall-editor-section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--secondary-text-color, #999);
    }

    .wall-editor-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wall-editor-label {
      font-size: 13px;
      color: var(--secondary-text-color, #888);
      min-width: 54px;
    }

    .wall-editor input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .wall-editor input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .wall-editor input:disabled {
      opacity: 0.5;
    }

    .wall-editor-unit {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
    }

    .wall-editor-constraints {
      display: flex;
      gap: 6px;
      flex: 1;
    }

    .wall-editor .constraint-btn {
      padding: 7px 12px;
      border: 1.5px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color, #555);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      --mdc-icon-size: 15px;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .wall-editor .constraint-btn:hover {
      border-color: var(--primary-color, #2196f3);
      color: var(--primary-color, #2196f3);
      background: rgba(33, 150, 243, 0.06);
    }

    .wall-editor .constraint-btn.active {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor .constraint-btn.lock-btn {
      padding: 7px 8px;
    }

    .wall-editor-actions {
      display: flex;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .wall-editor-actions button {
      flex: 1;
      padding: 10px 14px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      --mdc-icon-size: 16px;
      transition: opacity 0.15s, transform 0.1s;
    }

    .wall-editor-actions button:active {
      transform: scale(0.97);
    }

    .wall-editor .save-btn {
      background: var(--primary-color, #2196f3);
      color: white;
    }

    .wall-editor .save-btn:hover {
      opacity: 0.9;
    }

    .wall-editor .delete-btn {
      background: transparent;
      color: var(--error-color, #f44336);
      border: 1.5px solid var(--error-color, #f44336);
    }

    .wall-editor .delete-btn:hover {
      background: var(--error-color, #f44336);
      color: white;
    }

    .wall-editor-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      transition: border-color 0.15s;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23999' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .wall-editor-select:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .wall-editor-colors {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2.5px solid transparent;
      cursor: pointer;
      padding: 0;
      transition: border-color 0.15s, transform 0.1s;
    }

    .color-swatch:hover {
      transform: scale(1.1);
    }

    .color-swatch.active {
      border-color: var(--primary-color, #2196f3);
    }

    .entity-picker {
      position: absolute;
      background: var(--card-background-color, white);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      width: 280px;
      max-height: 340px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .entity-picker input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .entity-picker input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .entity-list {
      overflow-y: auto;
      max-height: 240px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.12s;
    }

    .entity-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color, #999);
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
      color: var(--secondary-text-color, #999);
      font-weight: 500;
    }

    .wall-annotation-text {
      font-size: 10px;
      fill: #000;
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
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
  `}connectedCallback(){super.connectedCallback(),this._cleanupEffects.push(Wt(()=>{this._viewBox=He.value}),Wt(()=>{this._canvasMode=Be.value})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault();const e=t.deltaY>0?1.1:.9,o=this._screenToSvg({x:t.clientX,y:t.clientY}),i=this._viewBox.width*e,n=this._viewBox.height*e;if(i<100||i>1e4)return;const s={x:o.x-(o.x-this._viewBox.x)*e,y:o.y-(o.y-this._viewBox.y)*e,width:i,height:n};He.value=s,this._viewBox=s}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Ue.value,i=this._getSnappedPoint(e,"device"===o||"wall"===o),n=this._canvasMode;if(this._pendingDevice&&"device"!==Ue.value&&(this._pendingDevice=null),1===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===n&&0===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if(0===t.button)if("select"===o){const o=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;this._handleSelectClick(e,t.shiftKey)||(o&&(Fe.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}else if("wall"===o){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:i;this._handleWallClick(e,t.shiftKey)}else"device"===o?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(i)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Ue.value;let i=this._getSnappedPoint(e,"device"===o||"wall"===o);if(t.shiftKey&&"wall"===o&&this._wallStartPoint){i=Math.abs(i.x-this._wallStartPoint.x)>=Math.abs(i.y-this._wallStartPoint.y)?{x:i.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:i.y}}if(this._cursorPos=i,this._draggingNode){const o=t.clientX-this._draggingNode.startX,i=t.clientY-this._draggingNode.startY;return(Math.abs(o)>3||Math.abs(i)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),o=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),i={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-o};return this._panStart={x:t.clientX,y:t.clientY},He.value=i,void(this._viewBox=i)}this._wallStartPoint||"select"!==o||"walls"!==this._canvasMode||this._checkNodeHover(e)}_checkNodeHover(t){const e=Oe.value;if(!e)return void(this._hoveredNode=null);const o=xe(t,e.nodes,15);this._hoveredNode=o}_handlePointerUp(t){if(this._draggingNode)return this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId);this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}async _handleDblClick(t){if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Oe.value,i=Re.value;if(!o||!i||!this.hass)return;const n=xe(e,o.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=ye(o);for(const t of s){if(this._pointToSegmentDistance(e,t.startPos,t.endPos)<t.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:i.id,floor_id:o.id,edge_id:t.id,point:{x:e.x,y:e.y}}),await Ze(),await this._syncRoomsWithEdges()}catch(t){console.error("Failed to split edge:",t)}return}}}async _handleContextMenu(t){if("walls"!==this._canvasMode)return;t.preventDefault();const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Oe.value,i=Re.value;if(!o||!i||!this.hass)return;const n=xe(e,o.nodes,15);if(!n)return;if(2===ve(n.id,o.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:i.id,floor_id:o.id,node_id:n.id}),await Ze(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Fe.value={type:"none",ids:[]},this._edgeEditor=null}catch(t){console.error("Failed to dissolve node:",t)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Ue.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=Oe.value,e=Re.value;if(!t||!e)return void(this._draggingNode=null);const o=this._cursorPos,i=this._draggingNode.originalCoords;if(Math.abs(o.x-i.x)<1&&Math.abs(o.y-i.y)<1)return void(this._draggingNode=null);const n=de(Gt(t.nodes,t.edges),this._draggingNode.node.id,o.x,o.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Ze()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=function(t,e,o=.5){const i=new Map;for(const e of t)i.set(e.id,e);const n=[];for(const t of e){const e=i.get(t.start_node),s=i.get(t.end_node);e&&s&&zt(e,s)<=o&&n.push(t.id)}return n}(t.nodes,t.edges);if(0!==o.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",o.length,o.map(t=>t.slice(0,8)+"…").join(", "));try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:i});await Ze(),await this._syncRoomsWithEdges()}catch(t){console.error("Error removing degenerate edges:",t)}}}_handleKeyDown(t){"Escape"===t.key?(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,Fe.value={type:"none",ids:[]},Ue.value="select"):"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),Ae()):(t.preventDefault(),Pe()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._edgeEditor.edge,i=parseFloat(this._editingLength);if(isNaN(i)||i<=0)return;const n=Math.abs(i-this._edgeEditor.length)>=.01,s=this._editingDirection!==o.direction,r=this._editingLengthLocked!==o.length_locked,a=s||r;try{if(s){if(!await this._applyDirection(o,this._editingDirection))return}if(n&&await this._updateEdgeLength(o,i),a){const i=Oe.value;if(i&&r){const t={};s&&(t.direction=this._editingDirection),r&&(t.length_locked=this._editingLengthLocked);const e=function(t,e,o,i){if(Tt){const t=Object.entries(i).map(([t,e])=>`${t}=${e}`).join(", ");console.group(Ht+" checkConstraintsFeasible: %cedge %s → {%s}",jt,Vt,o.slice(0,8)+"…",t)}const n=Gt(t,e),s=Qt(n),{magnitudes:r}=oe(n,s),a=e.map(t=>t.id!==o?t:{...t,...void 0!==i.direction&&{direction:i.direction},...void 0!==i.length_locked&&{length_locked:i.length_locked},...void 0!==i.angle_group&&{angle_group:i.angle_group??void 0}}),l=Gt(t,a),d=Qt(l),c=new Set;for(const[t,e]of l.nodes)e.pinned&&c.add(t);const h=ie(l,c,d,r);return h.blocked?(Tt&&(console.log(Ht+" %c→ NOT FEASIBLE%c — blocked by: %s",jt,qt,"",(h.blockedBy||[]).map(t=>{const e=l.edges.get(t);return e?Xt(e,l.nodes):t.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(Tt&&(console.log(Ht+" %c→ Feasible",jt,Kt),console.groupEnd()),{feasible:!0})}(i.nodes,i.edges,o.id,t);if(!e.feasible)return void(e.blockedBy&&this._blinkEdges(e.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),await this.hass.callWS(n),await Ze()}}catch(t){console.error("Error applying edge changes:",t)}this._edgeEditor=null,Fe.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Fe.value={type:"none",ids:[]}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this.hass,i=e.id,n=t.id,s=this._edgeEditor.edge,r=fe(t.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Ze(),await this._syncRoomsWithEdges(),Se({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await o.callWS({type:"inhabit/edges/add",floor_plan_id:i,floor_id:n,...d});c.id=t.edge.id,await Ze(),await this._syncRoomsWithEdges()},redo:async()=>{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Ze(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,Fe.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,o){if(!this.hass)return;const i=Oe.value,n=Re.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l=new Map;for(const e of t){const t=i.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await o(),await this._syncRoomsWithEdges();const d=Oe.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:e}),await Ze(),await this._syncRoomsWithEdges()};Se({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const o=Oe.value,i=Re.value;if(!o||!i)return;const n=o.edges.map(e=>e.id===t.id?{...e,length_locked:!1}:e),s=ce(Gt(o.nodes,n),t.id,e);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Ze()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(t){const e=Oe.value;if(e){const o=xe(t,e.nodes,15);if(o)return{x:o.x,y:o.y}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const o=Oe.value;if(!o)return Ve.value?Rt(t,je.value):t;const i=xe(t,o.nodes,15);if(i)return{x:i.x,y:i.y};if(e){const e=ye(o);let i=null,n=15;for(const o of e){const e=this._getClosestPointOnSegment(t,o.startPos,o.endPos),s=Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));s<n&&(n=s,i=e)}if(i)return i}return Ve.value?Rt(t,je.value):t}_getClosestPointOnSegment(t,e,o){const i=o.x-e.x,n=o.y-e.y,s=i*i+n*n;if(0===s)return e;const r=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/s));return{x:e.x+r*i,y:e.y+r*n}}_handleSelectClick(t,e=!1){const o=Oe.value;if(!o)return!1;const i=ye(o);for(const o of i){if(this._pointToSegmentDistance(t,o.startPos,o.endPos)<o.thickness/2+5){if(e&&"walls"===this._canvasMode&&"edge"===Fe.value.type){const t=[...Fe.value.ids],e=t.indexOf(o.id);return e>=0?t.splice(e,1):t.push(o.id),Fe.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return Fe.value={type:"edge",ids:[o.id]},this._updateEdgeEditorForSelection([o.id]),!0}}const n=Ke.value.filter(t=>t.floor_id===o.id);for(const e of n){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return Fe.value={type:"device",ids:[e.id]},!0}for(const e of o.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){Fe.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null},!0}return Fe.value={type:"none",ids:[]},!1}_updateEdgeEditorForSelection(t){const e=Oe.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const o=fe(e.nodes);if(1===t.length){const i=e.edges.find(e=>e.id===t[0]);if(i){const t=o.get(i.start_node),e=o.get(i.end_node);if(t&&e){const o=this._calculateWallLength(t,e);this._edgeEditor={edge:i,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:o},this._editingLength=Math.round(o).toString(),this._editingLengthLocked=i.length_locked,this._editingDirection=i.direction}}return void(this._multiEdgeEditor=null)}const i=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t),n=[];for(const t of i){const e=o.get(t.start_node),i=o.get(t.end_node);e&&n.push({x:e.x,y:e.y}),i&&n.push({x:i.x,y:i.y})}const s=function(t,e=2){if(t.length<2)return!0;if(2===t.length)return!0;let o=0,i=t[0],n=t[1];for(let e=0;e<t.length;e++)for(let s=e+1;s<t.length;s++){const r=zt(t[e],t[s]);r>o&&(o=r,i=t[e],n=t[s])}if(o<1e-9)return!0;const s=n.x-i.x,r=n.y-i.y,a=Math.sqrt(s*s+r*r);for(const o of t)if(Math.abs((o.x-i.x)*r-(o.y-i.y)*s)/a>e)return!1;return!0}(n);let r;if(s){r=0;for(const t of i){const e=o.get(t.start_node),i=o.get(t.end_node);e&&i&&(r+=this._calculateWallLength(e,i))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:i,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(t,e,o){const i=o.x-e.x,n=o.y-e.y,s=i*i+n*n;if(0===s)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const r=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/s)),a=e.x+r*i,l=e.y+r*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let o="free";if(e){o=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,o);const i=Oe.value,n=i?.nodes.some(e=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1);this._wallChainStart&&Math.abs(t.x-this._wallChainStart.x)<1&&Math.abs(t.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Ue.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=t}else this._wallStartPoint=t,this._wallChainStart=t}async _completeWall(t,e,o="free"){if(!this.hass)return;const i=Oe.value,n=Re.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l={id:""};try{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:o});l.id=i.edge.id,await Ze(),await this._syncRoomsWithEdges(),Se({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await Ze(),await this._syncRoomsWithEdges()},redo:async()=>{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:o});l.id=i.edge.id,await Ze(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.inverse();return{x:o.a*t.x+o.c*t.y+o.e,y:o.b*t.x+o.d*t.y+o.f}}const o=this._svg.getBoundingClientRect(),i=this._viewBox.width/o.width,n=this._viewBox.height/o.height;return{x:this._viewBox.x+(t.x-o.left)*i,y:this._viewBox.y+(t.y-o.top)*n}}_pointInPolygon(t,e){if(e.length<3)return!1;let o=!1;const i=e.length;for(let n=0,s=i-1;n<i;s=n++){const i=e[n],r=e[s];i.y>t.y!=r.y>t.y&&t.x<(r.x-i.x)*(t.y-i.y)/(r.y-i.y)+i.x&&(o=!o)}return o}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=function(t,e){if(0===e.length)return[];const o=new Map;for(const e of t)o.set(e.id,e);const i=new Map,n=(t,e)=>{const n=o.get(t),s=o.get(e);if(!n||!s)return;if(t===e)return;const r=Math.atan2(s.y-n.y,s.x-n.x);i.has(t)||i.set(t,[]),i.get(t).push({targetId:e,angle:r})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of i)t.sort((t,e)=>t.angle-e.angle);const s=new Set,r=[],a=(t,e)=>`${t}->${e}`;for(const[t,e]of i)for(const n of e){const e=a(t,n.targetId);if(s.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=a(d,c);if(s.has(e)){h=!1;break}s.add(e),l.push(d);const r=o.get(d),u=o.get(c),p=Math.atan2(r.y-u.y,r.x-u.x),g=i.get(c);if(!g||0===g.length){h=!1;break}let f=null;for(const t of g)if(t.angle>p){f=t;break}if(f||(f=g[0]),d=c,c=f.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&r.push(l.map(t=>{const e=o.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of r){const e=me(t),o=Math.abs(e);if(o<100)continue;if(e>0)continue;const i=be(t);l.push({vertices:t,area:o,centroid:i})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}(t.nodes,t.edges),i=[...t.rooms],n=new Set;let s=this._getNextRoomNumber(i)-1;for(const r of o){let o=null,a=0;for(const t of i){if(n.has(t.id))continue;const e=t.polygon.vertices,i=r.vertices,s=this._getPolygonCenter(e);if(!s)continue;const l=r.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;e.length===i.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>a&&(a=c,o=t)}if(o){n.add(o.id);if(this._verticesChanged(o.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,polygon:{vertices:r.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${s}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of i)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await Ze()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let o=0;o<t.length;o++)if(Math.abs(t[o].x-e[o].x)>1||Math.abs(t[o].y-e[o].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const o of t){const t=o.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const{room:o,editName:i,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,name:i,color:n,ha_area_id:s}),await Ze()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,Fe.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Fe.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=Re.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await Ze()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,Fe.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Room Properties</span>
          <button class="wall-editor-close" @click=${this._handleRoomEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">HA Area</span>
          <select
            class="wall-editor-select"
            .value=${this._roomEditor.editAreaId??""}
            @change=${t=>{if(this._roomEditor){const e=t.target.value,o=this._haAreas.find(t=>t.area_id===e);this._roomEditor={...this._roomEditor,editAreaId:e||null,editName:o?o.name:this._roomEditor.editName}}}}
          >
            <option value="">None</option>
            ${this._haAreas.map(t=>j`
              <option value=${t.area_id} ?selected=${this._roomEditor?.editAreaId===t.area_id}>${t.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Name</span>
          <input
            type="text"
            .value=${this._roomEditor.editName}
            ?disabled=${!!this._roomEditor.editAreaId}
            @input=${t=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editName:t.target.value})}}
            @keydown=${t=>{"Enter"===t.key?this._handleRoomEditorSave():"Escape"===t.key&&this._handleRoomEditorCancel()}}
          />
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Color</span>
          <div class="wall-editor-colors">
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(t=>j`
              <button
                class="color-swatch ${this._roomEditor?.editColor===t?"active":""}"
                style="background:${t};"
                @click=${()=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editColor:t})}}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleRoomEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleRoomDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}_renderEdgeChains(t,e){const o=ye(t);let i=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:t.startPos,endPos:t.endPos,thickness:t.thickness,type:t.type}));if(this._draggingNode){const{positions:e,blocked:n,blockedBy:s}=ue(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);n?s&&this._blinkEdges(s):i=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:e.get(t.start_node)??t.startPos,endPos:e.get(t.end_node)??t.endPos,thickness:t.thickness,type:t.type}))}const n=function(t){const e=t.filter(t=>"wall"===t.type);if(0===e.length)return[];const o=new Set,i=[];for(const t of e){if(o.has(t.id))continue;const n=[t];o.add(t.id);let s=t.end_node,r=!0;for(;r;){r=!1;for(const t of e)if(!o.has(t.id)){if(t.start_node===s){n.push(t),o.add(t.id),s=t.end_node,r=!0;break}if(t.end_node===s){n.push({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),o.add(t.id),s=t.start_node,r=!0;break}}}let a=t.start_node;for(r=!0;r;){r=!1;for(const t of e)if(!o.has(t.id)){if(t.end_node===a){n.unshift(t),o.add(t.id),a=t.start_node,r=!0;break}if(t.start_node===a){n.unshift({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),o.add(t.id),a=t.end_node,r=!0;break}}}i.push(n)}return i}(i),s="edge"===e.type?i.filter(t=>e.ids.includes(t.id)):[],r=Ye.value.get(t.id),a=r?new Set(r.map(t=>t.edgeId)):new Set;return V`
      <!-- Base edges rendered as chains for proper corners -->
      ${n.map((t,e)=>V`
        <path class="wall"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,o=[t[0].start];for(const e of t)o.push(e.end);const i=o.length>2&&Math.abs(o[0].x-o[o.length-1].x)<1&&Math.abs(o[0].y-o[o.length-1].y)<1,n=[],s=[];for(let t=0;t<o.length;t++){const r=o[t];let a,l=null,d=null;if(t>0||i){const e=o[t>0?t-1:o.length-2],i=r.x-e.x,n=r.y-e.y,s=Math.sqrt(i*i+n*n);s>0&&(l={x:i/s,y:n/s})}if(t<o.length-1||i){const e=o[t<o.length-1?t+1:1],i=e.x-r.x,n=e.y-r.y,s=Math.sqrt(i*i+n*n);s>0&&(d={x:i/s,y:n/s})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},o=t.x+e.x,i=t.y+e.y,n=Math.sqrt(o*o+i*i);if(n<.01)a=t;else{a={x:o/n,y:i/n};const e=t.x*a.x+t.y*a.y;if(Math.abs(e)>.1){const t=1/e,o=Math.min(Math.abs(t),3)*Math.sign(t);a={x:a.x*o,y:a.y*o}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:r.x+a.x*e,y:r.y+a.y*e}),s.push({x:r.x-a.x*e,y:r.y-a.y*e})}const r=Math.min(.8*e,4);let a=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)if(t<n.length-1&&n.length>2){const e=n[t-1],o=n[t],i=n[t+1],s=o.x-e.x,l=o.y-e.y,d=Math.sqrt(s*s+l*l),c=i.x-o.x,h=i.y-o.y,u=Math.sqrt(c*c+h*h),p=Math.min(r,d/2),g=Math.min(r,u/2);if(d>0&&u>0){const t=o.x-s/d*p,e=o.y-l/d*p,i=o.x+c/u*g,n=o.y+h/u*g;a+=` L${t},${e} Q${o.x},${o.y} ${i},${n}`}else a+=` L${o.x},${o.y}`}else a+=` L${n[t].x},${n[t].y}`;const l=[...s].reverse();if(i){a+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let t=s.length-2;t>=0;t--){const e=s.length-1-t;if(e>0&&e<s.length-1){const e=s[t+1],o=s[t],i=s[t-1],n=o.x-e.x,l=o.y-e.y,d=Math.sqrt(n*n+l*l),c=i.x-o.x,h=i.y-o.y,u=Math.sqrt(c*c+h*h),p=Math.min(r,d/2),g=Math.min(r,u/2);if(d>0&&u>0){const t=o.x-n/d*p,e=o.y-l/d*p,i=o.x+c/u*g,s=o.y+h/u*g;a+=` L${t},${e} Q${o.x},${o.y} ${i},${s}`}else a+=` L${o.x},${o.y}`}else a+=` L${s[t].x},${s[t].y}`}}else for(let t=0;t<l.length;t++)if(t>0&&t<l.length-1&&l.length>2){const e=l[t-1],o=l[t],i=l[t+1],n=o.x-e.x,s=o.y-e.y,d=Math.sqrt(n*n+s*s),c=i.x-o.x,h=i.y-o.y,u=Math.sqrt(c*c+h*h),p=Math.min(r,d/2),g=Math.min(r,u/2);if(d>0&&u>0){const t=o.x-n/d*p,e=o.y-s/d*p,i=o.x+c/u*g,r=o.y+h/u*g;a+=` L${t},${e} Q${o.x},${o.y} ${i},${r}`}else a+=` L${o.x},${o.y}`}else a+=` L${l[t].x},${l[t].y}`;return a+=" Z",a}(t.map(t=>({start:t.startPos,end:t.endPos,thickness:t.thickness})))}"
              data-chain-idx="${e}"/>
      `)}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${a.size>0?i.filter(t=>a.has(t.id)).map(t=>V`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
        `):null}

      <!-- Selected edge highlights -->
      ${s.map(t=>V`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(t=>{const e=i.find(e=>e.id===t);return e?V`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
        `:null}):null}
    `}_singleEdgePath(t){const{start:e,end:o,thickness:i}=t,n=o.x-e.x,s=o.y-e.y,r=Math.sqrt(n*n+s*s);if(0===r)return"";const a=-s/r*(i/2),l=n/r*(i/2);return`M${e.x+a},${e.y+l}\n            L${o.x+a},${o.y+l}\n            L${o.x-a},${o.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_blinkEdges(t){this._blinkTimer&&clearTimeout(this._blinkTimer);const e=Array.isArray(t)?t:[t];this._blinkingEdgeIds=e;const o=Oe.value;if(o){const t=e.map(t=>{const e=o.edges.find(e=>e.id===t);if(!e)return t.slice(0,8)+"…";const i=o.nodes.find(t=>t.id===e.start_node),n=o.nodes.find(t=>t.id===e.end_node),s=i&&n?Math.sqrt((n.x-i.x)**2+(n.y-i.y)**2).toFixed(1):"?",r=[];return"free"!==e.direction&&r.push(e.direction),e.length_locked&&r.push("len-locked"),e.angle_group&&r.push(`ang:${e.angle_group.slice(0,4)}`),`${t.slice(0,8)}… (${s}cm${r.length?" "+r.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${e.length} blocked edge(s):\n  ${t.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_renderFloor(){const t=Oe.value;if(!t)return null;const e=Fe.value,o=qe.value;return V`
      <!-- Background layer -->
      ${o.find(t=>"background"===t.id)?.visible&&t.background_image?V`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${o.find(t=>"background"===t.id)?.opacity??1}"/>
      `:null}

      <!-- Structure layer -->
      ${o.find(t=>"structure"===t.id)?.visible?V`
        <g class="structure-layer" opacity="${o.find(t=>"structure"===t.id)?.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>V`
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
      ${o.find(t=>"labels"===t.id)?.visible?V`
        <g class="labels-layer" opacity="${o.find(t=>"labels"===t.id)?.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);if(!e)return null;const o=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name,i=!!t.ha_area_id;return V`
              <g class="room-label-group" transform="translate(${e.x}, ${e.y})">
                <text class="room-label" x="0" y="0">
                  ${o}
                </text>
                ${i?V`
                  <g class="room-link-icon" transform="translate(${3.8*o.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${o.find(t=>"devices"===t.id)?.visible?V`
        <g class="devices-layer" opacity="${o.find(t=>"devices"===t.id)?.opacity??1}">
          ${Ke.value.filter(e=>e.floor_id===t.id).map(t=>this._renderDevice(t))}
        </g>
      `:null}
    `}_renderDevice(t){const e=this.hass?.states[t.entity_id],o="on"===e?.state,i=Fe.value;return V`
      <g class="device-marker ${o?"on":"off"} ${"device"===i.type&&i.ids.includes(t.id)?"selected":""}"
         transform="translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})">
        <circle r="12" fill="${o?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${t.show_label?V`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${t.label||e?.attributes.friendly_name||t.entity_id}
          </text>
        `:null}
      </g>
    `}_renderNodeEndpoints(){const t=Oe.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const o of t.edges)e.add(o.start_node),e.add(o.end_node);const o=[];for(const i of t.nodes)i.pinned&&e.has(i.id)&&o.push({node:i,coords:{x:i.x,y:i.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&e.has(this._draggingNode.node.id)){const e=o.findIndex(t=>t.node.id===this._draggingNode.node.id);e>=0&&o.splice(e,1);const{positions:i,blocked:n}=ue(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:i.get(this._draggingNode.node.id)??this._cursorPos;o.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&e.has(this._hoveredNode.id)&&(o.some(t=>t.node.id===this._hoveredNode.id)||o.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===o.length)return null;return V`
      <g class="wall-endpoints-layer">
        ${o.map(t=>t.isPinned?V`
          <g class="wall-endpoint pinned"
             transform="translate(${t.coords.x}, ${t.coords.y})"
             @pointerdown=${e=>this._handleNodePointerDown(e,t.node)}>
            <rect x="-5" y="-5" width="10" height="10" rx="2" />
            <g transform="translate(-6, -18) scale(0.5)">
              <path d="${"M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"}" fill="var(--primary-color, #2196f3)" />
            </g>
          </g>
        `:V`
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
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,{positions:o,blocked:i}=ue(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y);if(i)return null;const n=ye(t),s=[];for(const t of n){const e=o.get(t.start_node),i=o.get(t.end_node);if(!e&&!i)continue;const n=e??t.startPos,r=i??t.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:t.startPos,origEnd:t.endPos,length:a,angle:l,thickness:t.thickness})}const r=[];for(let t=0;t<s.length;t++)for(let o=t+1;o<s.length;o++){const i=Math.abs(s[t].angle-s[o].angle)%Math.PI;Math.abs(i-Math.PI/2)<.02&&r.push({point:e,angle:Math.min(s[t].angle,s[o].angle)})}return V`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:t,origEnd:e,thickness:o})=>{const i=e.x-t.x,n=e.y-t.y,s=Math.sqrt(i*i+n*n);if(0===s)return null;const r=-n/s*(o/2),a=i/s*(o/2);return V`
          <path
            class="wall-original-ghost"
            d="M${t.x+r},${t.y+a}
               L${e.x+r},${e.y+a}
               L${e.x-r},${e.y-a}
               L${t.x-r},${t.y-a}
               Z"
          />
        `})}

      <!-- Edge length labels -->
      ${s.map(({start:t,end:e,length:o})=>{const i=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return V`
          <g transform="translate(${i}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${r.map(({point:t,angle:e})=>V`
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
    `}_handleNodePointerDown(t,e){if(2===t.button)return;t.stopPropagation(),t.preventDefault();const o=this._hoveredNode||e;if("wall"===Ue.value){const e={x:o.x,y:o.y};return void this._handleWallClick(e,t.shiftKey)}if(o.pinned)return this._wallStartPoint={x:o.x,y:o.y},Ue.value="wall",void(this._hoveredNode=null);this._draggingNode={node:o,originalCoords:{x:o.x,y:o.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_renderDrawingPreview(){if("wall"===Ue.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,o=this._calculateWallLength(t,e),i=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return V`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${t.x}" y1="${t.y}"
                x2="${e.x}" y2="${e.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${i}, ${n}) rotate(${r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_getPolygonCenter(t){if(0===t.length)return null;if(t.length<3){let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;return{x:e/t.length,y:o/t.length}}let e=0,o=0,i=0;const n=t.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=t[s].x*t[r].y-t[r].x*t[s].y;e+=a,o+=(t[s].x+t[r].x)*a,i+=(t[s].y+t[r].y)*a}if(e/=2,Math.abs(e)<1e-6){let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;return{x:e/n,y:o/n}}const s=1/(6*e);return{x:o*s,y:i*s}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.a*t.x+e.c*t.y+e.e,i=e.b*t.x+e.d*t.y+e.f,n=this._svg.getBoundingClientRect();return{x:o-n.left,y:i-n.top}}const o=this._svg.getBoundingClientRect(),i=o.width/this._viewBox.width,n=o.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*i,y:(t.y-this._viewBox.y)*n}}_renderEdgeEditor(){return this._edgeEditor?j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Wall Properties</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${this._edgeEditor.edge.link_group?(()=>{const t=Oe.value,e=this._edgeEditor.edge.link_group,o=t?t.edges.filter(t=>t.link_group===e).length:0;return j`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Le(e)};">
                <ha-icon icon="mdi:link-variant" style="--mdc-icon-size:14px;"></ha-icon>
                Linked (${o} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._unlinkEdges()}
                title="Unlink this wall"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        ${this._edgeEditor.edge.collinear_group?(()=>{const t=Oe.value,e=this._edgeEditor.edge.collinear_group,o=t?t.edges.filter(t=>t.collinear_group===e).length:0;return j`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Le(e)};">
                <ha-icon icon="mdi:vector-line" style="--mdc-icon-size:14px;"></ha-icon>
                Collinear (${o} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._collinearUnlinkEdges()}
                title="Remove collinear constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Length</span>
          <div class="wall-editor-row">
            <input
              type="number"
              .value=${this._editingLength}
              @input=${t=>this._editingLength=t.target.value}
              @keydown=${this._handleEditorKeyDown}
              autofocus
            />
            <span class="wall-editor-unit">cm</span>
            <button
              class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
              @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
              title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
            ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
          </div>
        </div>

        ${this._edgeEditor.edge.angle_group?(()=>{const t=Oe.value,e=this._edgeEditor.edge.angle_group,o=t?t.edges.filter(t=>t.angle_group===e).length:0;return j`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Le(e)};">
                <ha-icon icon="mdi:angle-acute" style="--mdc-icon-size:14px;"></ha-icon>
                Angle Group (${o} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._angleUnlinkEdges()}
                title="Remove angle constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Constraints</span>
          <div class="wall-editor-row">
            <span class="wall-editor-label">Direction</span>
            <div class="wall-editor-constraints">
              <button
                class="constraint-btn ${"free"===this._editingDirection?"active":""}"
                @click=${()=>{this._editingDirection="free"}}
                title="Free direction"
              >Free</button>
              <button
                class="constraint-btn ${"horizontal"===this._editingDirection?"active":""}"
                @click=${()=>{this._editingDirection="horizontal"}}
                title="Lock horizontal"
              ><ha-icon icon="mdi:arrow-left-right"></ha-icon> Horizontal</button>
              <button
                class="constraint-btn ${"vertical"===this._editingDirection?"active":""}"
                @click=${()=>{this._editingDirection="vertical"}}
                title="Lock vertical"
              ><ha-icon icon="mdi:arrow-up-down"></ha-icon> Vertical</button>
            </div>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          <button class="delete-btn" @click=${this._handleEdgeDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `:null}async _applyDirection(t,e){if(!this.hass)return!1;const o=Oe.value,i=Re.value;if(!o||!i)return!1;const n=o.edges.map(e=>e.id===t.id?{...e,direction:"free",length_locked:!1,angle_group:void 0}:e),s=pe(Gt(o.nodes,n),t.id,e);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Ze(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const t=this._nodeEditor.node,e=Oe.value,o=e?ve(t.id,e.edges).length:0;return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Point Properties</span>
          <button class="wall-editor-close" @click=${()=>{this._nodeEditor=null}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Position</span>
          <div class="wall-editor-row">
            <span class="wall-editor-label">X</span>
            <input
              type="number"
              .value=${this._nodeEditor.editX}
              @input=${t=>{this._nodeEditor&&(this._nodeEditor={...this._nodeEditor,editX:t.target.value})}}
              @keydown=${t=>{"Enter"===t.key&&this._handleNodeEditorSave()}}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
          <div class="wall-editor-row">
            <span class="wall-editor-label">Y</span>
            <input
              type="number"
              .value=${this._nodeEditor.editY}
              @input=${t=>{this._nodeEditor&&(this._nodeEditor={...this._nodeEditor,editY:t.target.value})}}
              @keydown=${t=>{"Enter"===t.key&&this._handleNodeEditorSave()}}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Pin</span>
          <div class="wall-editor-row">
            <button
              class="constraint-btn ${t.pinned?"active":""}"
              @click=${()=>this._toggleNodePin()}
              title="${t.pinned?"Unpin node":"Pin node in place"}"
            ><ha-icon icon="${t.pinned?"mdi:pin":"mdi:pin-off"}"></ha-icon> ${t.pinned?"Pinned":"Unpinned"}</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${()=>this._handleNodeEditorSave()}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          ${2===o?j`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._nodeEditor.node,i=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(i)&&!isNaN(n))try{const s=de(Gt(t.nodes,t.edges),o.id,i,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Ze(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(o.id)}catch(t){console.error("Error updating node position:",t),alert(`Failed to update node: ${t}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._nodeEditor.node,i=!o.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:[{node_id:o.id,x:o.x,y:o.y,pinned:i}]}),await Ze(),this._refreshNodeEditor(o.id)}catch(t){console.error("Error toggling node pin:",t),alert(`Failed to toggle pin: ${t}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(t&&e)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:e.id,floor_id:t.id,node_id:this._nodeEditor.node.id}),await Ze(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(t){console.error("Failed to dissolve node:",t),alert(`Failed to dissolve node: ${t}`)}}_refreshNodeEditor(t){const e=Oe.value;if(e){const o=e.nodes.find(e=>e.id===t);o&&(this._nodeEditor={node:o,editX:Math.round(o.x).toString(),editY:Math.round(o.y).toString()})}}_getFilteredEntities(){if(!this.hass)return[];const t=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));if(this._entitySearch){const t=this._entitySearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[e]||"mdi:devices"}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=Oe.value,o=Re.value;if(!e||!o)return;const i=this.hass,n=o.id,s=e.id,r={...this._pendingDevice.position},a=t.startsWith("binary_sensor.")||t.startsWith("sensor."),l={id:""};try{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:t,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await Ze(),Se({type:"device_place",description:"Place device",undo:async()=>{await i.callWS({type:"inhabit/devices/remove",floor_plan_id:n,device_id:l.id}),await Ze()},redo:async()=>{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:t,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await Ze()}})}catch(t){console.error("Error placing device:",t),alert(`Failed to place device: ${t}`)}this._pendingDevice=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return j`
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
    `}render(){const t=this._canvasMode,e=[this._isPanning?"panning":"","select"===Ue.value?"select-tool":"","viewing"===t?"view-mode":""].filter(Boolean).join(" ");return j`
      <svg
        class="${e}"
        viewBox="${o=this._viewBox,`${o.x} ${o.y} ${o.width} ${o.height}`}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @dblclick=${this._handleDblClick}
        @contextmenu=${this._handleContextMenu}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderFloor()}
        ${"walls"===t?this._renderEdgeAnnotations():null}
        ${"walls"===t?this._renderAngleConstraints():null}
        ${"walls"===t?this._renderNodeEndpoints():null}
        ${"viewing"!==t?this._renderDrawingPreview():null}
        ${"placement"===t?this._renderDevicePreview():null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"placement"===t?this._renderEntityPicker():null}
    `;var o}_renderEdgeAnnotations(){const t=Oe.value;if(!t||0===t.edges.length)return null;const e=ye(t);return V`
      <g class="wall-annotations-layer">
        ${e.map(t=>{const e=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,i=this._calculateWallLength(t.startPos,t.endPos),n=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),s=n>90||n<-90?n+180:n,r=[];t.length_locked&&r.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===t.direction&&r.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===t.direction&&r.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const a=this._formatLength(i),l=.35*24+3,d=3.2*a.length+4,c=-(3.2*a.length+8),h=-(t.thickness/2+6);return V`
            <g transform="translate(${e}, ${o}) rotate(${s})">
              ${t.link_group?V`
                <circle cx="${c}" cy="${h-1}" r="3.5"
                  fill="${Le(t.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${t.collinear_group?V`
                <g transform="translate(${c-(t.link_group?10:0)}, ${h-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${Le(t.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              `:null}
              <text class="wall-annotation-text" x="0" y="${h}">${a}</text>
              ${r.map((t,e)=>V`
                <g transform="translate(${d+e*l}, ${h}) rotate(${-s}) scale(${.35})">
                  <path d="${t}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `})}
      </g>
    `}_renderAngleConstraints(){const t=Oe.value;if(!t||0===t.edges.length)return null;const e=fe(t.nodes),o=new Map;for(const e of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e));const i=[];for(const[,t]of o){if(2!==t.length)continue;const o=new Set([t[0].start_node,t[0].end_node]),n=new Set([t[1].start_node,t[1].end_node]);let s=null;for(const t of o)if(n.has(t)){s=t;break}if(!s)continue;const r=s,a=e.get(r);if(!a)continue;const l=[];for(const o of t){const t=o.start_node===r?o.end_node:o.start_node,i=e.get(t);i&&l.push(Math.atan2(i.y-a.y,i.x-a.x))}if(l.length<2)continue;l.sort((t,e)=>t-e);const d=l.length;for(let t=0;t<d;t++){const e=l[t],o=l[(t+1)%d],n=(o-e+2*Math.PI)%(2*Math.PI);if(Math.PI-n<.01)continue;const s=e+Math.PI,r=o+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?i.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):i.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===i.length)return null;const n=12;return V`
      <g class="angle-constraints-layer">
        ${i.map(t=>{const e=t.angle1,o=t.angle2,i=o-e,s=180*i/Math.PI;if(s>85&&s<95){const s=.7*n,r=t.x+s*Math.cos(e),a=t.y+s*Math.sin(e),l=t.x+s*Math.cos(o),d=t.y+s*Math.sin(o),c=(e+o)/2,h=s/Math.cos(i/2),u=t.x+h*Math.cos(c),p=t.y+h*Math.sin(c);return V`
              <path d="M${r},${a} L${u},${p} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=t.x+n*Math.cos(e),a=t.y+n*Math.sin(e),l=t.x+n*Math.cos(o),d=t.y+n*Math.sin(o),c=i>Math.PI?1:0;return V`
            <path d="M${r},${a} A${n},${n} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const t=this._multiEdgeEditor.edges,e=this._multiEdgeEditor.collinear??!1;return j`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Fe.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e?j`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Total Length</span>
            <div class="wall-editor-row">
              <input
                type="number"
                .value=${this._editingTotalLength}
                @input=${t=>this._editingTotalLength=t.target.value}
                @keydown=${t=>{"Enter"===t.key&&this._applyTotalLength()}}
              />
              <span class="wall-editor-unit">cm</span>
              <button
                class="constraint-btn"
                @click=${()=>this._applyTotalLength()}
                title="Apply total length"
              ><ha-icon icon="mdi:check"></ha-icon></button>
            </div>
          </div>
        `:null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Angle Link</span>
          <div class="wall-editor-row">
            ${(()=>{const e=t.map(t=>t.angle_group).filter(Boolean);if(e.length===t.length&&1===new Set(e).size)return j`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===t.length&&(()=>{const e=new Set([t[0].start_node,t[0].end_node]);return e.has(t[1].start_node)||e.has(t[1].end_node)})()?j`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:j`<button
                class="constraint-btn"
                disabled
                title="${2!==t.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const e=t.map(t=>t.link_group).filter(Boolean);return e.length===t.length&&1===new Set(e).size?j`<button
                  class="constraint-btn active"
                  @click=${()=>this._unlinkEdges()}
                  title="Unlink these walls"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon> Unlink</button>`:j`<button
                class="constraint-btn"
                @click=${()=>this._linkEdges()}
                title="Link these walls so property changes propagate"
              ><ha-icon icon="mdi:link-variant"></ha-icon> Link</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Collinear Link</span>
          <div class="wall-editor-row">
            ${(()=>{const o=t.map(t=>t.collinear_group).filter(Boolean);return o.length===t.length&&1===new Set(o).size?j`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:e?j`<button
                  class="constraint-btn"
                  @click=${()=>this._collinearLinkEdges()}
                  title="Constrain walls to stay on the same line"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Link Collinear</button>`:j`<button
                class="constraint-btn"
                disabled
                title="Walls are not collinear"
              ><ha-icon icon="mdi:vector-line"></ha-icon> Not Collinear</button>`})()}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="delete-btn" @click=${()=>this._handleMultiEdgeDelete()}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete All</button>
        </div>
      </div>
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error angle linking edges:",t)}}async _angleUnlinkEdges(){if(!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error angle unlinking edges:",t)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}}catch(t){console.error("Error linking edges:",t)}}async _unlinkEdges(){if(!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error unlinking edges:",t)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=parseFloat(this._editingTotalLength);if(isNaN(o)||o<=0)return;const i=this._multiEdgeEditor.edges.map(t=>t.id),n=function(t,e,o){const i=new Set,n=[];for(const o of e){const e=t.edges.get(o);if(e){if(e.length_locked)return{updates:[],blocked:!0,blockedBy:[e.id]};n.push(e),i.add(e.start_node),i.add(e.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const e of i){const o=t.nodes.get(e);o&&s.push({x:o.x,y:o.y})}const{anchor:r,dir:a}=Ot(s),l=new Map;for(const e of i){const o=t.nodes.get(e);if(!o)continue;const i=o.x-r.x,n=o.y-r.y,s=i*a.x+n*a.y;l.set(e,s)}let d=1/0,c=-1/0,h="";for(const[t,e]of l)e<d&&(d=e,h=t),e>c&&(c=e);const u=c-d;if(u<1e-9)return{updates:[],blocked:!1};const p=Qt(t),g=new Set;for(const[t,e]of l){if(g.add(t),t===h)continue;const i=d+o/u*(e-d);p.set(t,{x:r.x+i*a.x,y:r.y+i*a.y})}const f=new Set(g);for(const[e,o]of t.nodes)o.pinned&&f.add(e);const _=ie(t,f,p);for(const e of g){const o=p.get(e),i=t.nodes.get(e);o&&(Math.abs(o.x-i.x)>Ut||Math.abs(o.y-i.y)>Ut)&&(_.updates.some(t=>t.nodeId===e)||_.updates.push({nodeId:e,x:o.x,y:o.y}))}return _.blocked=!1,delete _.blockedBy,_}(Gt(t.nodes,t.edges),i,o);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Ze();Oe.value&&this._updateEdgeEditorForSelection(i)}catch(t){console.error("Error applying total length:",t)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error collinear linking edges:",t)}}async _collinearUnlinkEdges(){if(!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Ze();const i=Oe.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error collinear unlinking edges:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=Oe.value,e=Re.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges;try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id});await Ze(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,Fe.value={type:"none",ids:[]}}_renderDevicePreview(){return"device"!==Ue.value||this._pendingDevice?null:V`
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
    `}};t([pt({attribute:!1})],Ne.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,o,i)=>((t,e,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,o),o))(e,o,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Ne.prototype,"_svg",void 0),t([gt()],Ne.prototype,"_viewBox",void 0),t([gt()],Ne.prototype,"_isPanning",void 0),t([gt()],Ne.prototype,"_panStart",void 0),t([gt()],Ne.prototype,"_cursorPos",void 0),t([gt()],Ne.prototype,"_wallStartPoint",void 0),t([gt()],Ne.prototype,"_roomEditor",void 0),t([gt()],Ne.prototype,"_haAreas",void 0),t([gt()],Ne.prototype,"_hoveredNode",void 0),t([gt()],Ne.prototype,"_draggingNode",void 0),t([gt()],Ne.prototype,"_nodeEditor",void 0),t([gt()],Ne.prototype,"_edgeEditor",void 0),t([gt()],Ne.prototype,"_multiEdgeEditor",void 0),t([gt()],Ne.prototype,"_editingTotalLength",void 0),t([gt()],Ne.prototype,"_editingLength",void 0),t([gt()],Ne.prototype,"_editingLengthLocked",void 0),t([gt()],Ne.prototype,"_editingDirection",void 0),t([gt()],Ne.prototype,"_blinkingEdgeIds",void 0),t([gt()],Ne.prototype,"_pendingDevice",void 0),t([gt()],Ne.prototype,"_entitySearch",void 0),t([gt()],Ne.prototype,"_canvasMode",void 0),Ne=t([ct("fpb-canvas")],Ne);const De=[{id:"wall",icon:"mdi:wall",label:"Wall"}],We=[{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"},{id:"device",icon:"mdi:devices",label:"Device"}];let ze=class extends lt{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._canvasMode="walls",this._cleanupEffects=[],this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
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
      gap: 6px;
      padding: 6px 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }

    .floor-trigger:hover {
      background: rgba(255, 255, 255, 0.12);
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
      top: calc(100% + 6px);
      left: 0;
      background: var(--card-background-color);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
      min-width: 180px;
      z-index: 100;
      overflow: hidden;
      padding: 6px;
    }

    .floor-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
      transition: background 0.12s;
    }

    .floor-option:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .floor-option.selected {
      color: var(--primary-color);
      font-weight: 600;
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
      background: var(--divider-color, #e8e8e8);
      margin: 4px 6px;
    }

    .floor-option .delete-btn {
      display: none;
      margin-left: auto;
      padding: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
      transition: color 0.12s, background 0.12s;
    }

    .floor-option .delete-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .delete-btn {
      display: flex;
    }

    .floor-option .delete-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.08);
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
      border-radius: 8px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .tool-button:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .tool-button.active {
      background: rgba(255, 255, 255, 0.22);
    }

    .tool-button:disabled {
      opacity: 0.35;
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
      gap: 2px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 2px;
    }

    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 32px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .mode-button:first-child {
      border-radius: 8px;
    }

    .mode-button:last-child {
      border-radius: 8px;
    }

    .mode-button:not(:first-child) {
    }

    .mode-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mode-button.active {
      background: rgba(255, 255, 255, 0.22);
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
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .add-button:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button.menu-open {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .add-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: var(--card-background-color);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
      padding: 6px;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
      transition: background 0.12s;
    }

    .add-menu-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .add-menu-item.active {
      color: var(--primary-color);
      font-weight: 600;
    }

    .add-menu-item ha-icon {
      --mdc-icon-size: 18px;
    }
  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){Ue.value=t,this._addMenuOpen=!1}_handleUndo(){Pe()}_handleRedo(){Ae()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,o){t.stopPropagation(),confirm(`Delete "${o}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick),this._cleanupEffects.push(Wt(()=>{this._canvasMode=Be.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}render(){const t=Re.value,e=Oe.value,o=Ue.value,i=this._canvasMode,n=t?.floors||[],s="walls"===i?De:"placement"===i?We:[];return j`
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
          @click=${()=>Te("viewing")}
          title="View mode"
        >
          <ha-icon icon="mdi:eye-outline"></ha-icon>
        </button>
        <button
          class="mode-button ${"walls"===i?"active":""}"
          @click=${()=>Te("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===i?"active":""}"
          @click=${()=>Te("placement")}
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
          ?disabled=${!Ee.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!Me.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Add Menu (right side, hidden in viewing mode) -->
      ${s.length>0?j`
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
                  ${s.map(t=>j`
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
    `}};t([pt({attribute:!1})],ze.prototype,"hass",void 0),t([pt({attribute:!1})],ze.prototype,"floorPlans",void 0),t([gt()],ze.prototype,"_addMenuOpen",void 0),t([gt()],ze.prototype,"_floorMenuOpen",void 0),t([gt()],ze.prototype,"_canvasMode",void 0),ze=t([ct("fpb-toolbar")],ze);const Re=Et(null),Oe=Et(null),Be=Et("walls"),Ue=Et("select"),Fe=Et({type:"none",ids:[]});function Te(t){Be.value=t,Ue.value="select",Fe.value={type:"none",ids:[]}}const He=Et({x:0,y:0,width:1e3,height:800}),je=Et(10),Ve=Et(!0);Et(!0);const qe=Et([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),Ke=Et([]),Ye=Et(new Map);let Xe=null;async function Ze(){Xe&&await Xe()}class Ge extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1}static{this.styles=r`
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
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      text-align: center;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .empty-state .init-form input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .empty-state button {
      padding: 11px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.15s, transform 0.1s;
    }

    .empty-state button:hover {
      opacity: 0.9;
    }

    .empty-state button:active {
      transform: scale(0.97);
    }
  `}connectedCallback(){super.connectedCallback(),this._loadFloorPlans(),Xe=()=>this._reloadCurrentFloor()}async _reloadCurrentFloor(){if(!this.hass)return;const t=Re.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const o=e.find(e=>e.id===t.id);if(o){Re.value=o;const t=Oe.value?.id;if(t){const e=o.floors.find(e=>e.id===t);e?Oe.value=e:o.floors.length>0&&(Oe.value=o.floors[0])}else o.floors.length>0&&(Oe.value=o.floors[0]);await this._loadDevicePlacements(o.id)}}catch(t){console.error("Error reloading floor data:",t)}}_detectFloorConflicts(t){const e=new Map;for(const o of t.floors){const t=ge(o.nodes,o.edges);t.length>0&&(e.set(o.id,t),console.warn(`[inhabit] Detected ${t.length} constraint conflict(s) on floor "${o.id}":`,t.map(t=>`${t.edgeId} (${t.type})`)))}Ye.value=e}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Re.value=t[0],t[0].floors.length>0&&(Oe.value=t[0].floors[0],je.value=t[0].grid_size),this._detectFloorConflicts(t[0]),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});Ke.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let o=0;o<t;o++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${o+1}`,level:o});e.floors.push(t)}this._floorPlans=[e],Re.value=e,Oe.value=e.floors[0],je.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t}`)}}async _addFloor(){if(!this.hass)return;const t=Re.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const o=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),i={...t,floors:[...t.floors,o]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?i:e),Re.value=i,Oe.value=o}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=Re.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const o=e.floors.filter(e=>e.id!==t),i={...e,floors:o};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?i:t),Re.value=i,Oe.value?.id===t&&(Ce(),Oe.value=o.length>0?o[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t}`)}}_handleFloorSelect(t){const e=Re.value;if(e){const o=e.floors.find(e=>e.id===t);o&&(Oe.value?.id!==o.id&&Ce(),Oe.value=o)}}render(){return this._loading?j`
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
    `}}t([pt({attribute:!1})],Ge.prototype,"hass",void 0),t([pt({type:Boolean})],Ge.prototype,"narrow",void 0),t([gt()],Ge.prototype,"_floorPlans",void 0),t([gt()],Ge.prototype,"_loading",void 0),t([gt()],Ge.prototype,"_error",void 0),t([gt()],Ge.prototype,"_floorCount",void 0),customElements.define("ha-floorplan-builder",Ge);export{Ge as HaFloorplanBuilder};
