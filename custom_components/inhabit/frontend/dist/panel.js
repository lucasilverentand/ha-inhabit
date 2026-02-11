function t(t,e,o,i){var n,s=arguments.length,r=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(s<3?n(r):s>3?n(e,o,r):n(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,o=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let s=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(o&&void 0===t){const o=void 0!==e&&1===e.length;o&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&n.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new s(o,t,i)},a=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,f=u.trustedTypes,_=f?f.emptyScript:"",y=u.reactiveElementPolyfillSupport,v=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},m=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(t,o,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const s=i?.call(this);n?.call(this,e),this.requestUpdate(t,s,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const o of e)this.createProperty(o,t[o])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,o]of e)this.elementProperties.set(t,o)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const o=this._$Eu(t,e);void 0!==o&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(o)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const o of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=o.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){const o=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:x).toAttribute(e,o.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const o=this.constructor,i=o._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=o.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=i;const s=n.fromAttribute(e,t.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(t,e,o,i=!1,n){if(void 0!==t){const s=this.constructor;if(!1===i&&(n=this[t]),o??=s.getPropertyOptions(t),!((o.hasChanged??m)(n,e)||o.useDefault&&o.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,o))))return;this.C(t,e,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:i,wrapped:n},s){o&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,o]of t){const{wrapped:t}=o,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,o,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=t=>t,E=$.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+S,C=`<${A}>`,I=document,L=()=>I.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,O="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,F=/>/g,W=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,T=/"/g,U=/^(?:script|style|textarea|title)$/i,j=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),H=j(1),q=j(2),V=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),Y=new WeakMap,Z=I.createTreeWalker(I,129);function X(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}class G{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,s=0;const r=t.length-1,a=this.parts,[l,d]=((t,e)=>{const o=t.length-1,i=[];let n,s=2===e?"<svg>":3===e?"<math>":"",r=R;for(let e=0;e<o;e++){const o=t[e];let a,l,d=-1,c=0;for(;c<o.length&&(r.lastIndex=c,l=r.exec(o),null!==l);)c=r.lastIndex,r===R?"!--"===l[1]?r=z:void 0!==l[1]?r=F:void 0!==l[2]?(U.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=W):void 0!==l[3]&&(r=W):r===W?">"===l[0]?(r=n??R,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?W:'"'===l[3]?T:B):r===T||r===B?r=W:r===z||r===F?r=R:(r=W,n=void 0);const h=r===W&&t[e+1].startsWith("/>")?" ":"";s+=r===R?o+C:d>=0?(i.push(a),o.slice(0,d)+M+o.slice(d)+S+h):o+S+(-2===d?e:h)}return[X(t,s+(t[o]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]})(t,e);if(this.el=G.createElement(l,o),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Z.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(M)){const e=d[s++],o=i.getAttribute(t).split(S),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:o,ctor:"."===r[1]?ot:"?"===r[1]?it:"@"===r[1]?nt:et}),i.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(U.test(i.tagName)){const t=i.textContent.split(S),e=t.length-1;if(e>0){i.textContent=E?E.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],L()),Z.nextNode(),a.push({type:2,index:++n});i.append(t[e],L())}}}else if(8===i.nodeType)if(i.data===A)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(S,t+1));)a.push({type:7,index:n}),t+=S.length-1}n++}}static createElement(t,e){const o=I.createElement("template");return o.innerHTML=t,o}}function J(t,e,o=t,i){if(e===V)return e;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const s=D(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(e=J(t,n._$AS(t,e.values),n,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:o}=this._$AD,i=(t?.creationScope??I).importNode(e,!0);Z.currentNode=i;let n=Z.nextNode(),s=0,r=0,a=o[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=o[++r]}s!==a?.index&&(n=Z.nextNode(),s++)}return Z.currentNode=I,i}p(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),D(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(I.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:o}=t,i="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=G.createElement(X(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),o=t.u(this.options);t.p(e),this.T(o),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new G(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new tt(this.O(L()),this.O(L()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,i,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=K}_$AI(t,e=this,o,i){const n=this.strings;let s=!1;if(void 0===n)t=J(this,t,e,0),s=!D(t)||t!==this._$AH&&t!==V,s&&(this._$AH=t);else{const i=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=J(this,i[o+r],e,r),a===V&&(a=this._$AH[r]),s||=!D(a)||a!==this._$AH[r],a===K?t=K:t!==K&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!i&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends et{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??K)===V)return;const o=this._$AH,i=t===K&&o!==K||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==K&&(o===K||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const rt=$.litHtmlPolyfillSupport;rt?.(G,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{const i=o?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=o?.renderBefore??null;i._$litPart$=n=new tt(e.insertBefore(L(),t),t,void 0,o??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:m},ht=(t=ct,e,o)=>{const{kind:i,metadata:n}=o;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),s.set(o.name,t),"accessor"===i){const{name:i}=o;return{set(o){const n=e.get.call(this);e.set.call(this,o),this.requestUpdate(i,n,t,!0,o)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];e.call(this,o),this.requestUpdate(i,n,t,!0,o)}}throw Error("Unsupported decorator location: "+i)};function pt(t){return(e,o)=>"object"==typeof o?ht(t,e,o):((t,e,o)=>{const i=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),i?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t){return pt({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ut=Symbol.for("preact-signals");function ft(){if(xt>1)return void xt--;let t,e=!1;for(;void 0!==yt;){let o=yt;for(yt=void 0,mt++;void 0!==o;){const i=o.o;if(o.o=void 0,o.f&=-3,!(8&o.f)&&Et(o))try{o.c()}catch(o){e||(t=o,e=!0)}o=i}}if(mt=0,xt--,e)throw t}let _t,yt;function vt(t){const e=_t;_t=void 0;try{return t()}finally{_t=e}}let xt=0,mt=0,bt=0;function wt(t){if(void 0===_t)return;let e=t.n;return void 0===e||e.t!==_t?(e={i:0,S:t,p:_t.s,n:void 0,t:_t,e:void 0,x:void 0,r:e},void 0!==_t.s&&(_t.s.n=e),_t.s=e,t.n=e,32&_t.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=_t.s,e.n=void 0,_t.s.n=e,_t.s=e),e):void 0}function $t(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function kt(t,e){return new $t(t,e)}function Et(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Pt(t){for(let e=t.s;void 0!==e;e=e.n){const o=e.S.n;if(void 0!==o&&(e.r=o),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Mt(t){let e,o=t.s;for(;void 0!==o;){const t=o.p;-1===o.i?(o.S.U(o),void 0!==t&&(t.n=o.n),void 0!==o.n&&(o.n.p=t)):e=o,o.S.n=o.r,void 0!==o.r&&(o.r=void 0),o=t}t.s=e}function St(t,e){$t.call(this,void 0),this.x=t,this.s=void 0,this.g=bt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function At(t,e){return new St(t,e)}function Ct(t){const e=t.u;if(t.u=void 0,"function"==typeof e){xt++;const o=_t;_t=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,It(t),e}finally{_t=o,ft()}}}function It(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Ct(t)}function Lt(t){if(_t!==this)throw new Error("Out-of-order effect");Mt(this),_t=t,this.f&=-2,8&this.f&&It(this),ft()}function Dt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Nt(t,e){const o=new Dt(t,e);try{o.c()}catch(t){throw o.d(),t}const i=o.d.bind(o);return i[Symbol.dispose]=i,i}$t.prototype.brand=ut,$t.prototype.h=function(){return!0},$t.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:vt(()=>{var t;null==(t=this.W)||t.call(this)}))},$t.prototype.U=function(t){if(void 0!==this.t){const e=t.e,o=t.x;void 0!==e&&(e.x=o,t.e=void 0),void 0!==o&&(o.e=e,t.x=void 0),t===this.t&&(this.t=o,void 0===o&&vt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},$t.prototype.subscribe=function(t){return Nt(()=>{const e=this.value,o=_t;_t=void 0;try{t(e)}finally{_t=o}},{name:"sub"})},$t.prototype.valueOf=function(){return this.value},$t.prototype.toString=function(){return this.value+""},$t.prototype.toJSON=function(){return this.value},$t.prototype.peek=function(){const t=_t;_t=void 0;try{return this.value}finally{_t=t}},Object.defineProperty($t.prototype,"value",{get(){const t=wt(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(mt>100)throw new Error("Cycle detected");this.v=t,this.i++,bt++,xt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{ft()}}}}),St.prototype=new $t,St.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===bt)return!0;if(this.g=bt,this.f|=1,this.i>0&&!Et(this))return this.f&=-2,!0;const t=_t;try{Pt(this),_t=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return _t=t,Mt(this),this.f&=-2,!0},St.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}$t.prototype.S.call(this,t)},St.prototype.U=function(t){if(void 0!==this.t&&($t.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},St.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(St.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=wt(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Dt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Dt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Ct(this),Pt(this),xt++;const t=_t;return _t=this,Lt.bind(this,t)},Dt.prototype.N=function(){2&this.f||(this.f|=2,this.o=yt,yt=this)},Dt.prototype.d=function(){this.f|=8,1&this.f||It(this)},Dt.prototype.dispose=function(){this.d()},window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:kt(null),currentFloor:kt(null),canvasMode:kt("walls"),activeTool:kt("select"),selection:kt({type:"none",ids:[]}),viewBox:kt({x:0,y:0,width:1e3,height:800}),gridSize:kt(10),snapToGrid:kt(!0),showGrid:kt(!0),layers:kt([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),devicePlacements:kt([]),constraintConflicts:kt(new Map),focusedRoomId:kt(null),_reloadFloorData:null});const Ot=window.__inhabit_signals,Rt=Ot.currentFloorPlan,zt=Ot.currentFloor,Ft=Ot.canvasMode,Wt=Ot.activeTool,Bt=Ot.selection,Tt=Ot.viewBox,Ut=Ot.gridSize,jt=Ot.snapToGrid,Ht=Ot.showGrid,qt=Ot.layers,Vt=Ot.devicePlacements,Kt=Ot.constraintConflicts,Yt=Ot.focusedRoomId;function Zt(t){Ft.value=t,Wt.value="select",Bt.value={type:"none",ids:[]}}async function Xt(){Ot._reloadFloorData&&await Ot._reloadFloorData()}function Gt(t,e){const o=e.x-t.x,i=e.y-t.y;return Math.sqrt(o*o+i*i)}function Jt(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function Qt(t){if(t.length<2)return{anchor:t[0]||{x:0,y:0},dir:{x:1,y:0}};let e=0,o=t[0],i=t[1];for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const r=Gt(t[n],t[s]);r>e&&(e=r,o=t[n],i=t[s])}if(e<1e-9)return{anchor:o,dir:{x:1,y:0}};return{anchor:o,dir:{x:(i.x-o.x)/e,y:(i.y-o.y)/e}}}function te(t,e,o){const i=t.x-e.x,n=t.y-e.y,s=i*o.x+n*o.y;return{x:e.x+s*o.x,y:e.y+s*o.y}}const ee=.05,oe=.2,ie="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),ne="%c[constraint]",se="color:#8b5cf6;font-weight:bold",re="color:#888",ae="color:#ef4444;font-weight:bold",le="color:#22c55e;font-weight:bold";function de(t){return`(${t.x.toFixed(1)},${t.y.toFixed(1)})`}function ce(t,e){const o=e.get(t.start_node),i=e.get(t.end_node),n=[];"free"!==t.direction&&n.push(t.direction),t.length_locked&&n.push("len🔒"),t.angle_group&&n.push(`ang:${t.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=o&&i?Gt(o,i).toFixed(1):"?";return`${t.id.slice(0,8)}… (${r}cm${s})`}function he(t){return t.slice(0,8)+"…"}function pe(t,e){const o=new Map,i=new Map,n=new Map;for(const e of t)o.set(e.id,e);for(const t of e)i.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:o,edges:i,nodeToEdges:n}}function ge(t){return"free"!==t.direction||t.length_locked}function ue(t){const e=new Map;for(const[o,i]of t.nodes)e.set(o,{x:i.x,y:i.y});return e}function fe(t,e,o,i,n){let s={x:i.x,y:i.y};if("horizontal"===t.direction?s={x:s.x,y:o.y}:"vertical"===t.direction&&(s={x:o.x,y:s.y}),t.length_locked){const e=Gt(n.nodes.get(t.start_node),n.nodes.get(t.end_node)),i=s.x-o.x,r=s.y-o.y,a=Math.sqrt(i*i+r*r);if(a>0&&e>0){const t=e/a;s={x:o.x+i*t,y:o.y+r*t}}}return s}function _e(t,e,o,i,n){const s=i.has(t.start_node),r=i.has(t.end_node);if(s&&r)return{idealStart:e,idealEnd:o};if(s){return{idealStart:e,idealEnd:fe(t,t.start_node,e,o,n)}}if(r){return{idealStart:fe(t,t.end_node,o,e,n),idealEnd:o}}return function(t,e,o,i){const n=Gt(i.nodes.get(t.start_node),i.nodes.get(t.end_node));let s={x:e.x,y:e.y},r={x:o.x,y:o.y};if("horizontal"===t.direction){const t=(s.y+r.y)/2;s={x:s.x,y:t},r={x:r.x,y:t}}else if("vertical"===t.direction){const t=(s.x+r.x)/2;s={x:t,y:s.y},r={x:t,y:r.y}}if(t.length_locked){const t=(s.x+r.x)/2,e=(s.y+r.y)/2,o=r.x-s.x,i=r.y-s.y,a=Math.sqrt(o*o+i*i);if(a>0&&n>0){const l=n/2/(a/2);s={x:t-o/2*l,y:e-i/2*l},r={x:t+o/2*l,y:e+i/2*l}}}return{idealStart:s,idealEnd:r}}(t,e,o,n)}function ye(t,e){let o=0;const i=[],n=new Map;for(const[s,r]of t.edges){if(!ge(r))continue;const a=e.get(r.start_node),l=e.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const e=Gt(t.nodes.get(r.start_node),t.nodes.get(r.end_node)),o=Gt(a,l);d=Math.max(d,Math.abs(o-e))}n.set(s,d),d>oe&&i.push(s),d>o&&(o=d)}const s=xe(t,e);for(const[,r]of s){let s=0;for(const t of r.nodeIds){const o=e.get(t);if(!o)continue;const i=Gt(o,te(o,r.anchor,r.dir));s=Math.max(s,i)}for(const[e,o]of t.edges)if(o.collinear_group&&r.nodeIds.has(o.start_node)){const t=n.get(e)??0;n.set(e,Math.max(t,s)),s>oe&&(i.includes(e)||i.push(e));break}o=Math.max(o,s)}const r=me(t);for(const[,s]of r){const r=e.get(s.sharedNodeId);if(!r)continue;let a=0;for(let o=0;o<s.edgeIds.length;o++){const i=t.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=e.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=Gt(r,l);for(let i=o+1;i<s.edgeIds.length;i++){const o=t.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=e.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let p=d-h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;const g=(c+Gt(r,l))/2;a=Math.max(a,Math.abs(p)*g)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>oe&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}const a=we(t);for(const[,s]of a){const r=[];for(const o of s.edgeIds){const i=t.edges.get(o),n=e.get(i.start_node),s=e.get(i.end_node);n&&s?r.push(Gt(n,s)):r.push(0)}let a=0;for(const t of r)a=Math.max(a,Math.abs(t-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>oe&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}return{maxViolation:o,violatingEdgeIds:i,magnitudes:n}}function ve(t,e,o,i){const n=function(t,e){const o=[],i=new Set,n=new Set,s=[];for(const t of e)s.push(t),n.add(t);for(;s.length>0;){const e=s.shift(),r=t.nodeToEdges.get(e)||[];for(const{edgeId:a}of r){if(i.has(a))continue;i.add(a);const r=t.edges.get(a);if(!r)continue;o.push(r);const l=r.start_node===e?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return o}(t,e),s=n.filter(ge),r=xe(t,o),a=me(t),l=we(t);let d=0,c=0;ie&&(console.groupCollapsed(ne+" solveIterative: %c%d constrained edges, %d pinned nodes",se,re,s.length,e.size),console.log("  Pinned nodes:",[...e].map(he).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(e=>ce(e,t.nodes)).join(" | ")||"(none)"),i&&i.size>0&&console.log("  Pre-existing violations:",[...i.entries()].map(([e,o])=>{const i=t.edges.get(e);return(i?ce(i,t.nodes):e.slice(0,8)+"…")+` (${o.toFixed(2)})`}).join(" | ")));for(let i=0;i<100;i++){d=0,c=i+1;const s=0===i?new Set(e):e;for(const r of n){if(!ge(r))continue;const n=o.get(r.start_node),a=o.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=_e(r,n,a,s,t);if(!e.has(r.start_node)){const t=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,t),o.set(r.start_node,l)}if(!e.has(r.end_node)){const t=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,t),o.set(r.end_node,c)}0===i&&(s.add(r.start_node),s.add(r.end_node))}for(const[,t]of r)for(const i of t.nodeIds){if(e.has(i))continue;const n=o.get(i);if(!n)continue;const s=te(n,t.anchor,t.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>ee&&(d=Math.max(d,r),o.set(i,s))}const h=be(t,a,e,o);d=Math.max(d,h);const p=$e(t,l,e,o);if(d=Math.max(d,p),d<ee)break}const h=[];for(const[e,i]of o){const o=t.nodes.get(e);(Math.abs(i.x-o.x)>ee||Math.abs(i.y-o.y)>ee)&&h.push({nodeId:e,x:i.x,y:i.y})}if(d<ee)ie&&console.log(ne+" %cConverged%c in %d iteration(s), %d node(s) moved",se,le,"",c,h.length);else{const{violatingEdgeIds:e,maxViolation:n,magnitudes:s}=ye(t,o),r=[];for(const t of e)if(i){const e=i.get(t);if(void 0===e)r.push(t);else{(s.get(t)??0)>e+ee&&r.push(t)}}else r.push(t);if(r.length>0)return ie&&(console.log(`${ne} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,se,ae,""),console.log("  All violating edges:",e.map(e=>{const o=t.edges.get(e);return o?ce(o,t.nodes):e.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",r.map(e=>{const i=t.edges.get(e);if(!i)return e.slice(0,8)+"…";const n=o.get(i.start_node),s=o.get(i.end_node),r=n&&s?` now ${de(n)}→${de(s)}`:"";return ce(i,t.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};ie&&console.log(`${ne} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,se,"color:#f59e0b;font-weight:bold","")}return ie&&console.groupEnd(),{updates:h,blocked:!1}}function xe(t,e){const o=new Map,i=new Map;for(const[,e]of t.edges){if(!e.collinear_group)continue;i.has(e.collinear_group)||i.set(e.collinear_group,new Set);const t=i.get(e.collinear_group);t.add(e.start_node),t.add(e.end_node)}for(const[t,n]of i){const i=[];for(const t of n){const o=e.get(t);o&&i.push(o)}if(i.length<2)continue;const{anchor:s,dir:r}=Qt(i);o.set(t,{nodeIds:n,anchor:s,dir:r})}return o}function me(t){const e=new Map,o=new Map;for(const[,e]of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e.id));for(const[i,n]of o){if(n.length<2)continue;const o=n.map(e=>t.edges.get(e)),s=new Map;for(const t of o)s.set(t.start_node,(s.get(t.start_node)??0)+1),s.set(t.end_node,(s.get(t.end_node)??0)+1);let r=null;for(const[t,e]of s)if(e===n.length){r=t;break}if(!r)continue;const a=t.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const e of o){const o=e.start_node===r?e.end_node:e.start_node,i=t.nodes.get(o);if(!i){d=!1;break}l.push(Math.atan2(i.y-a.y,i.x-a.x))}d&&e.set(i,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return e}function be(t,e,o,i){let n=0;for(const[,s]of e){const e=i.get(s.sharedNodeId);if(!e)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let o=0;o<r;o++){const n=t.edges.get(s.edgeIds[o]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=i.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-e.y,h.x-e.x))}if(!c)continue;const h=[];for(let t=0;t<r;t++){let e=d[t]-s.originalAngles[t];for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;h.push(e)}const p=a.map(t=>o.has(t)),g=p.filter(Boolean).length;if(g===r)continue;let u=0,f=0;if(g>0)for(let t=0;t<r;t++)p[t]&&(u+=Math.sin(h[t]),f+=Math.cos(h[t]));else for(let t=0;t<r;t++)u+=Math.sin(h[t]),f+=Math.cos(h[t]);const _=Math.atan2(u,f);for(let t=0;t<r;t++){if(p[t])continue;const o=s.originalAngles[t]+_,r=Gt(e,l[t]),d={x:e.x+Math.cos(o)*r,y:e.y+Math.sin(o)*r},c=Math.max(Math.abs(d.x-l[t].x),Math.abs(d.y-l[t].y));n=Math.max(n,c),i.set(a[t],d)}}return n}function we(t){const e=new Map,o=new Map;for(const[,e]of t.edges)e.link_group&&(o.has(e.link_group)||o.set(e.link_group,[]),o.get(e.link_group).push(e.id));for(const[i,n]of o){if(n.length<2)continue;let o=0;for(const e of n){const i=t.edges.get(e);o+=Gt(t.nodes.get(i.start_node),t.nodes.get(i.end_node))}e.set(i,{edgeIds:n,targetLength:o/n.length})}return e}function $e(t,e,o,i){let n=0;for(const[,s]of e)for(const e of s.edgeIds){const r=t.edges.get(e),a=i.get(r.start_node),l=i.get(r.end_node);if(!a||!l)continue;const d=Gt(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=ee)continue;const c=o.has(r.start_node),h=o.has(r.end_node);if(c&&h)continue;const p=l.x-a.x,g=l.y-a.y,u=s.targetLength/d;if(c){const t={x:a.x+p*u,y:a.y+g*u},e=Math.max(Math.abs(t.x-l.x),Math.abs(t.y-l.y));n=Math.max(n,e),i.set(r.end_node,t)}else if(h){const t={x:l.x-p*u,y:l.y-g*u},e=Math.max(Math.abs(t.x-a.x),Math.abs(t.y-a.y));n=Math.max(n,e),i.set(r.start_node,t)}else{const t=(a.x+l.x)/2,e=(a.y+l.y)/2,o=s.targetLength/2/(d/2),c={x:t-p/2*o,y:e-g/2*o},h={x:t+p/2*o,y:e+g/2*o},u=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),i.set(r.start_node,c),i.set(r.end_node,h)}}return n}function ke(t,e,o,i){let n=o,s=i;const r=function(t,e){const o=t.nodeToEdges.get(e);if(!o)return null;for(const{edgeId:e}of o){const o=t.edges.get(e);if(o?.collinear_group)return o.collinear_group}return null}(t,e);if(r){const e=function(t,e){const o=new Set;for(const[,i]of t.edges)i.collinear_group===e&&(o.add(i.start_node),o.add(i.end_node));return o}(t,r),a=[];for(const o of e){const e=t.nodes.get(o);e&&a.push({x:e.x,y:e.y})}if(a.length>=2){const{anchor:t,dir:e}=Qt(a),r=te({x:o,y:i},t,e);n=r.x,s=r.y}}const a=ue(t),{magnitudes:l}=ye(t,a),d=ue(t);d.set(e,{x:n,y:s});const c=new Set([e]);for(const[o,i]of t.nodes)i.pinned&&o!==e&&c.add(o);const h=ve(t,c,d,l),p=h.updates.some(t=>t.nodeId===e);if(!p){const o=t.nodes.get(e);o.x===n&&o.y===s||h.updates.unshift({nodeId:e,x:n,y:s})}const g=h.updates.find(t=>t.nodeId===e);if(g&&(g.x=n,g.y=s),h.updates=h.updates.filter(o=>o.nodeId===e||!t.nodes.get(o.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:e,magnitudes:o}=ye(t,d),i=[];for(const t of e){const e=l.get(t);if(void 0===e)i.push(t);else{(o.get(t)??0)>e+ee&&i.push(t)}}i.length>0&&(h.blocked=!0,h.blockedBy=i)}return h}function Ee(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};if(ie&&console.log(ne+" solveEdgeLengthChange: %c%s → %scm",se,re,ce(i,t.nodes),o.toFixed(1)),i.length_locked)return ie&&console.log(ne+" %c→ BLOCKED: edge is length-locked",se,ae),{updates:[],blocked:!0,blockedBy:[i.id]};const n=t.nodes.get(i.start_node),s=t.nodes.get(i.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===Gt(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return Math.atan2(i.y-o.y,i.x-o.x)}(i,t.nodes),d=o/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},p=ue(t);p.set(i.start_node,c),p.set(i.end_node,h);const g=new Set([i.start_node,i.end_node]);for(const[e,o]of t.nodes)o.pinned&&g.add(e);const u=ve(t,g,p);return u.updates.some(t=>t.nodeId===i.start_node)||u.updates.unshift({nodeId:i.start_node,x:c.x,y:c.y}),u.updates.some(t=>t.nodeId===i.end_node)||u.updates.push({nodeId:i.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(e=>e.nodeId===i.start_node||e.nodeId===i.end_node||!t.nodes.get(e.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function Pe(t){const e=new Map;for(const o of t)e.set(o.nodeId,{x:o.x,y:o.y});return e}function Me(t,e,o,i,n){const s=ke(pe(t,e),o,i,n);return{positions:Pe(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function Se(t,e,o){const i=t.edges.get(e);if(!i)return{updates:[],blocked:!1};const n=t.nodes.get(i.start_node),s=t.nodes.get(i.end_node);ie&&(console.group(ne+" solveConstraintSnap: %csnap %s → %s",se,re,ce(i,t.nodes),o),console.log(`  Nodes: ${he(i.start_node)} ${de(n)} → ${he(i.end_node)} ${de(s)}`));const r=function(t,e,o){if("free"===e)return null;const i=o.get(t.start_node),n=o.get(t.end_node);if(!i||!n)return null;const s=(i.x+n.x)/2,r=(i.y+n.y)/2,a=Gt(i,n)/2;if("horizontal"===e){if(Math.round(i.y)===Math.round(n.y))return null;const e=i.x<=n.x;return{nodeUpdates:[{nodeId:t.start_node,x:e?s-a:s+a,y:r},{nodeId:t.end_node,x:e?s+a:s-a,y:r}]}}if("vertical"===e){if(Math.round(i.x)===Math.round(n.x))return null;const e=i.y<=n.y;return{nodeUpdates:[{nodeId:t.start_node,x:s,y:e?r-a:r+a},{nodeId:t.end_node,x:s,y:e?r+a:r-a}]}}return null}(i,o,t.nodes);if(!r)return ie&&(console.log(ne+" %cAlready satisfies %s — no-op",se,le,o),console.groupEnd()),{updates:[],blocked:!1};const a=ue(t),{magnitudes:l}=ye(t,a),d=r.nodeUpdates.find(t=>t.nodeId===i.start_node),c=r.nodeUpdates.find(t=>t.nodeId===i.end_node);ie&&console.log(`  Snap target: ${he(i.start_node)} ${de(d)} → ${he(i.end_node)} ${de(c)}`);const h=ue(t);h.set(i.start_node,{x:d.x,y:d.y}),h.set(i.end_node,{x:c.x,y:c.y});const p=new Set([i.start_node,i.end_node]);for(const[e,o]of t.nodes)o.pinned&&p.add(e);const g=ve(t,p,h,l);return g.updates.some(t=>t.nodeId===i.start_node)||g.updates.unshift({nodeId:i.start_node,x:d.x,y:d.y}),g.updates.some(t=>t.nodeId===i.end_node)||g.updates.push({nodeId:i.end_node,x:c.x,y:c.y}),g.updates=g.updates.filter(e=>e.nodeId===i.start_node||e.nodeId===i.end_node||!t.nodes.get(e.nodeId)?.pinned),ie&&(g.blocked?console.log(ne+" %c→ SNAP BLOCKED by: %s",se,ae,(g.blockedBy||[]).map(e=>{const o=t.edges.get(e);return o?ce(o,t.nodes):e.slice(0,8)+"…"}).join(" | ")):console.log(ne+" %c→ Snap OK%c, %d node(s) to update",se,le,"",g.updates.length),console.groupEnd()),g}function Ae(t,e,o=.2){const i=new Map;for(const e of t)i.set(e.id,e);const n=[];for(const t of e){const e=i.get(t.start_node),s=i.get(t.end_node);if(e&&s)if("horizontal"===t.direction){const i=Math.abs(e.y-s.y);i>o&&n.push({edgeId:t.id,type:"direction",expected:0,actual:i})}else if("vertical"===t.direction){const i=Math.abs(e.x-s.x);i>o&&n.push({edgeId:t.id,type:"direction",expected:0,actual:i})}}const s=new Map,r=new Map;for(const t of e)t.collinear_group&&(s.has(t.collinear_group)||(s.set(t.collinear_group,new Set),r.set(t.collinear_group,t.id)),s.get(t.collinear_group).add(t.start_node),s.get(t.collinear_group).add(t.end_node));for(const[t,e]of s){const s=[];for(const t of e){const e=i.get(t);e&&s.push({x:e.x,y:e.y})}if(s.length<2)continue;const{anchor:a,dir:l}=Qt(s);let d=0;for(const t of s){const e=te(t,a,l);d=Math.max(d,Gt(t,e))}d>o&&n.push({edgeId:r.get(t),type:"collinear",expected:0,actual:d})}const a=new Map;for(const t of e)t.link_group&&(a.has(t.link_group)||a.set(t.link_group,[]),a.get(t.link_group).push(t.id));for(const[,t]of a){if(t.length<2)continue;const s=[];for(const o of t){const t=e.find(t=>t.id===o),n=i.get(t.start_node),r=i.get(t.end_node);n&&r?s.push(Gt(n,r)):s.push(0)}const r=s.reduce((t,e)=>t+e,0)/s.length;let a=0;for(const t of s)a=Math.max(a,Math.abs(t-r));a>o&&n.push({edgeId:t[0],type:"link_group",expected:r,actual:a})}return n}function Ce(t){const e=new Map;for(const o of t)e.set(o.id,o);return e}function Ie(t,e){const o=e.get(t.start_node),i=e.get(t.end_node);return o&&i?{...t,startPos:{x:o.x,y:o.y},endPos:{x:i.x,y:i.y}}:null}function Le(t){const e=Ce(t.nodes),o=[];for(const i of t.edges){const t=Ie(i,e);t&&o.push(t)}return o}function De(t,e){return e.filter(e=>e.start_node===t||e.end_node===t)}function Ne(t,e,o){let i=null,n=o;for(const o of e){const e=Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2);e<n&&(n=e,i=o)}return i}function Oe(t){let e=0;const o=t.length;for(let i=0;i<o;i++){const n=(i+1)%o;e+=t[i].x*t[n].y,e-=t[n].x*t[i].y}return e/2}function Re(t){const e=t.length;if(e<3){let o=0,i=0;for(const e of t)o+=e.x,i+=e.y;return{x:o/e,y:i/e}}let o=0,i=0,n=0;for(let s=0;s<e;s++){const r=(s+1)%e,a=t[s].x*t[r].y-t[r].x*t[s].y;o+=a,i+=(t[s].x+t[r].x)*a,n+=(t[s].y+t[r].y)*a}if(o/=2,Math.abs(o)<1e-6){let o=0,i=0;for(const e of t)o+=e.x,i+=e.y;return{x:o/e,y:i/e}}const s=1/(6*o);return{x:i*s,y:n*s}}const ze=kt([]),Fe=kt([]),We=kt(!1),Be=At(()=>ze.value.length>0&&!We.value),Te=At(()=>Fe.value.length>0&&!We.value);function Ue(t){ze.value=[...ze.value.slice(-99),t],Fe.value=[]}async function je(){const t=ze.value;if(0===t.length||We.value)return;const e=t[t.length-1];We.value=!0;try{await e.undo()}finally{We.value=!1}ze.value=t.slice(0,-1),Fe.value=[...Fe.value,e]}async function He(){const t=Fe.value;if(0===t.length||We.value)return;const e=t[t.length-1];We.value=!0;try{await e.redo()}finally{We.value=!1}Fe.value=t.slice(0,-1),ze.value=[...ze.value,e]}function qe(){ze.value=[],Fe.value=[]}const Ve=85*Math.PI/180;function Ke(t,e,o,i,n,s){const r=n*Math.PI/180,a=s?1:-1,l=Math.cos(r),d=a*Math.sin(r),c=o-t,h=i-e,p=t+l*c-d*h,g=e+d*c+l*h,u=p-t,f=g-e,_=a*(4/3)*Math.tan(r/4);return{ox:p,oy:g,cp1x:o-_*h,cp1y:i+_*c,cp2x:p+_*f,cp2y:g-_*u}}const Ye=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function Ze(t){let e=0;for(let o=0;o<t.length;o++)e=(e<<5)-e+t.charCodeAt(o);return Ye[Math.abs(e)%Ye.length]}class Xe extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._entitySearch="",this._openingPreview=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=r`
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
      fill: rgba(255, 253, 245, 0.9);
      stroke: #9e9e9e;
      stroke-width: 1.2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .door-swing {
      fill: none;
      stroke: #78909c;
      stroke-width: 1;
      opacity: 0.2;
      stroke-dasharray: 4,3;
      stroke-linecap: round;
    }

    .door-leaf-panel {
      fill: rgba(255, 253, 245, 0.55);
      stroke: #9e9e9e;
      stroke-width: 0.6;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .swing-wedge {
      fill: rgba(120, 144, 156, 0.08);
      stroke: none;
    }

    .window-leaf-panel {
      fill: rgba(144, 202, 249, 0.5);
      stroke: rgba(100, 181, 246, 0.8);
      stroke-width: 0.6;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .window-swing-wedge {
      fill: rgba(100, 181, 246, 0.06);
    }

    .door-jamb {
      stroke: #9e9e9e;
      stroke-width: 1.2;
      stroke-linecap: round;
      opacity: 0.6;
    }

    .window {
      fill: rgba(144, 202, 249, 0.6);
      stroke: rgba(100, 181, 246, 0.8);
      stroke-width: 1.5;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .window-pane {
      stroke: rgba(100, 181, 246, 0.4);
      stroke-width: 0.8;
      stroke-linecap: round;
    }

    .hinge-dot {
      fill: #78909c;
      stroke: var(--card-background-color, #fff);
      stroke-width: 0.8;
    }

    .hinge-glow {
      fill: #78909c;
      opacity: 0.2;
    }

    .sliding-arrow {
      fill: #78909c;
      opacity: 0.35;
    }

    .opening-stop {
      fill: var(--primary-text-color, #333);
      stroke: none;
    }

    .door-closed-segment {
      fill: var(--primary-text-color, #333);
      stroke: none;
    }

    .window-closed-segment {
      fill: rgba(100, 181, 246, 0.35);
      stroke: rgba(100, 181, 246, 0.6);
      stroke-width: 1;
    }

    .metal-hinge {
      fill: #9e9e9e;
      stroke: #757575;
      stroke-width: 0.8;
    }

.opening-ghost {
      opacity: 0.5;
      pointer-events: none;
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

    .room-side-btn {
      flex: 1;
      text-align: center;
      padding: 5px 8px;
      border-radius: 6px;
      border: 2px solid transparent;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      color: var(--primary-text-color, #333);
    }

    .room-side-btn:disabled {
      cursor: default;
    }

    .room-side-btn:not(:disabled):hover {
      border-color: var(--primary-color, #2196f3);
    }

    .room-side-btn.active {
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 1px var(--primary-color, #2196f3);
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

    .room-dimmed {
      opacity: 0.15;
      transition: opacity 0.3s ease;
    }

    .room-focused {
      transition: opacity 0.3s ease;
    }

    .edges-dimmed {
      opacity: 0.15;
      transition: opacity 0.3s ease;
    }

    .edges-focused {
      transition: opacity 0.3s ease;
    }

    .label-dimmed {
      opacity: 0.15;
      transition: opacity 0.3s ease;
    }

    .label-focused {
      transition: opacity 0.3s ease;
    }

    .device-dimmed {
      opacity: 0.15;
      transition: opacity 0.3s ease;
    }

    .device-focused {
      transition: opacity 0.3s ease;
    }
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(Nt(()=>{this._viewBox=Tt.value}),Nt(()=>{this._canvasMode=Ft.value}),Nt(()=>{const t=zt.value;t&&t.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=t.id,requestAnimationFrame(()=>this._fitToFloor(t)))}),Nt(()=>{const t=Yt.value,e=this._focusedRoomId;this._focusedRoomId=t,t?requestAnimationFrame(()=>this._animateToRoom(t)):null!==e&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault(),this._cancelViewBoxAnimation();const e=t.deltaY>0?1.1:.9,o=this._screenToSvg({x:t.clientX,y:t.clientY}),i=this._viewBox.width*e,n=this._viewBox.height*e;if(i<100||i>1e4)return;const s={x:o.x-(o.x-this._viewBox.x)*e,y:o.y-(o.y-this._viewBox.y)*e,width:i,height:n};Tt.value=s,this._viewBox=s}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Wt.value,i=this._getSnappedPoint(e,"device"===o||"wall"===o),n=this._canvasMode;if(this._pendingDevice&&"device"!==Wt.value&&(this._pendingDevice=null),1===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===n&&0===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if(0===t.button)if("select"===o){const o=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;this._handleSelectClick(e,t.shiftKey)||(o&&(Bt.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}else if("wall"===o){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:i;this._handleWallClick(e,t.shiftKey)}else"device"===o?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(i)):"door"===o||"window"===o?this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(o)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}async _placeOpening(t){if(!this.hass||!this._openingPreview)return;const e=zt.value,o=Rt.value;if(!e||!o)return;const i=this.hass,n=o.id,s=e.id,{edgeId:r,t:a,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,p="door"===t?80:100,g=t,u={...l},f={...d},_=c,y={...h};try{const e=await i.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:r,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await Xt(),await this._syncRoomsWithEdges();const o=e.edges.map(t=>t.id);Ue({type:"opening_place",description:`Place ${t}`,undo:async()=>{for(const t of o)try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:t})}catch{}await i.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:f,thickness:_}),await Xt(),await this._syncRoomsWithEdges()},redo:async()=>{const e=zt.value;if(!e)return;const o=Le(e).find(t=>{if("wall"!==t.type)return!1;const e=this._getClosestPointOnSegment(y,t.startPos,t.endPos);return Math.sqrt((e.x-y.x)**2+(e.y-y.y)**2)<5});o&&await i.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:o.id,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await Xt(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error placing opening:",t)}}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=Wt.value;let i=this._getSnappedPoint(e,"device"===o||"wall"===o);if(t.shiftKey&&"wall"===o&&this._wallStartPoint){i=Math.abs(i.x-this._wallStartPoint.x)>=Math.abs(i.y-this._wallStartPoint.y)?{x:i.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:i.y}}if(this._cursorPos=i,this._draggingNode){const o=t.clientX-this._draggingNode.startX,i=t.clientY-this._draggingNode.startY;return(Math.abs(o)>3||Math.abs(i)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),o=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),i={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-o};return this._panStart={x:t.clientX,y:t.clientY},Tt.value=i,void(this._viewBox=i)}this._wallStartPoint||"select"!==o||"walls"!==this._canvasMode||this._checkNodeHover(e),"door"!==o&&"window"!==o||this._updateOpeningPreview(e)}_checkNodeHover(t){const e=zt.value;if(!e)return void(this._hoveredNode=null);const o=Ne(t,e.nodes,15);this._hoveredNode=o}_updateOpeningPreview(t){const e=zt.value;if(!e)return void(this._openingPreview=null);const o=Le(e);let i=null,n=30,s=t,r=0;for(const e of o){if("wall"!==e.type)continue;const o=this._getClosestPointOnSegment(t,e.startPos,e.endPos),a=Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2);if(a<n){n=a,i=e,s=o;const t=e.endPos.x-e.startPos.x,l=e.endPos.y-e.startPos.y,d=t*t+l*l;r=d>0?((o.x-e.startPos.x)*t+(o.y-e.startPos.y)*l)/d:0}}this._openingPreview=i?{edgeId:i.id,position:s,startPos:i.startPos,endPos:i.endPos,thickness:i.thickness,t:r}:null,this.requestUpdate()}_handlePointerUp(t){if(this._draggingNode)return this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId);this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}async _handleDblClick(t){if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=zt.value,i=Rt.value;if(!o||!i||!this.hass)return;const n=Ne(e,o.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Le(o);for(const t of s){if(this._pointToSegmentDistance(e,t.startPos,t.endPos)<t.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:i.id,floor_id:o.id,edge_id:t.id,point:{x:e.x,y:e.y}}),await Xt(),await this._syncRoomsWithEdges()}catch(t){console.error("Failed to split edge:",t)}return}}}async _handleContextMenu(t){if("walls"!==this._canvasMode)return;t.preventDefault();const e=this._screenToSvg({x:t.clientX,y:t.clientY}),o=zt.value,i=Rt.value;if(!o||!i||!this.hass)return;const n=Ne(e,o.nodes,15);if(!n)return;if(2===De(n.id,o.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:i.id,floor_id:o.id,node_id:n.id}),await Xt(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Bt.value={type:"none",ids:[]},this._edgeEditor=null}catch(t){console.error("Failed to dissolve node:",t)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Wt.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=zt.value,e=Rt.value;if(!t||!e)return void(this._draggingNode=null);const o=this._cursorPos,i=this._draggingNode.originalCoords;if(Math.abs(o.x-i.x)<1&&Math.abs(o.y-i.y)<1)return void(this._draggingNode=null);const n=ke(pe(t.nodes,t.edges),this._draggingNode.node.id,o.x,o.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Xt()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=function(t,e,o=.5){const i=new Map;for(const e of t)i.set(e.id,e);const n=[];for(const t of e){const e=i.get(t.start_node),s=i.get(t.end_node);e&&s&&Gt(e,s)<=o&&n.push(t.id)}return n}(t.nodes,t.edges);if(0!==o.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",o.length,o.map(t=>t.slice(0,8)+"…").join(", "));try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:i});await Xt(),await this._syncRoomsWithEdges()}catch(t){console.error("Error removing degenerate edges:",t)}}}_handleKeyDown(t){"Escape"===t.key?(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,Bt.value={type:"none",ids:[]},Wt.value="select"):"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),He()):(t.preventDefault(),je()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._edgeEditor.edge,i=parseFloat(this._editingLength);if(isNaN(i)||i<=0)return;const n=Math.abs(i-this._edgeEditor.length)>=.01,s=this._editingDirection!==o.direction,r=this._editingLengthLocked!==o.length_locked,a="door"===o.type||"window"===o.type,l=a&&this._editingOpeningParts!==(o.opening_parts??"single"),d=a&&this._editingOpeningType!==(o.opening_type??"swing"),c=a&&this._editingSwingDirection!==(o.swing_direction??"left"),h=a&&(this._editingEntityId??null)!==(o.entity_id??null),p=s||r||l||d||c||h;try{if(s){if(!await this._applyDirection(o,this._editingDirection))return}if(n&&await this._updateEdgeLength(o,i),p){const i=zt.value;if(i&&r){const t={};s&&(t.direction=this._editingDirection),r&&(t.length_locked=this._editingLengthLocked);const e=function(t,e,o,i){if(ie){const t=Object.entries(i).map(([t,e])=>`${t}=${e}`).join(", ");console.group(ne+" checkConstraintsFeasible: %cedge %s → {%s}",se,re,o.slice(0,8)+"…",t)}const n=pe(t,e),s=ue(n),{magnitudes:r}=ye(n,s),a=e.map(t=>t.id!==o?t:{...t,...void 0!==i.direction&&{direction:i.direction},...void 0!==i.length_locked&&{length_locked:i.length_locked},...void 0!==i.angle_group&&{angle_group:i.angle_group??void 0}}),l=pe(t,a),d=ue(l),c=new Set;for(const[t,e]of l.nodes)e.pinned&&c.add(t);const h=ve(l,c,d,r);return h.blocked?(ie&&(console.log(ne+" %c→ NOT FEASIBLE%c — blocked by: %s",se,ae,"",(h.blockedBy||[]).map(t=>{const e=l.edges.get(t);return e?ce(e,l.nodes):t.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(ie&&(console.log(ne+" %c→ Feasible",se,le),console.groupEnd()),{feasible:!0})}(i.nodes,i.edges,o.id,t);if(!e.feasible)return void(e.blockedBy&&this._blinkEdges(e.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await Xt()}}catch(t){console.error("Error applying edge changes:",t)}this._edgeEditor=null,Bt.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Bt.value={type:"none",ids:[]}}async _setDoorOpensToSide(t,e){if(!this.hass)return;if("a"===t)return;const o=zt.value,i=Rt.value;if(!o||!i)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:i.id,floor_id:o.id,edge_id:e.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await Xt();const t=zt.value;if(t){const o=t.edges.find(t=>t.id===e.id);o&&this._updateEdgeEditorForSelection([o.id])}}catch(t){console.error("Error flipping door side:",t)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this.hass,i=e.id,n=t.id,s=this._edgeEditor.edge,r=Ce(t.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Xt(),await this._syncRoomsWithEdges(),Ue({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await o.callWS({type:"inhabit/edges/add",floor_plan_id:i,floor_id:n,...d});c.id=t.edge.id,await Xt(),await this._syncRoomsWithEdges()},redo:async()=>{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Xt(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,Bt.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,o){if(!this.hass)return;const i=zt.value,n=Rt.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l=new Map;for(const e of t){const t=i.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await o(),await this._syncRoomsWithEdges();const d=zt.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:e}),await Xt(),await this._syncRoomsWithEdges()};Ue({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const o=zt.value,i=Rt.value;if(!o||!i)return;const n=o.edges.map(e=>e.id===t.id?{...e,length_locked:!1}:e),s=Ee(pe(o.nodes,n),t.id,e);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Xt()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(t){const e=zt.value;if(e){const o=Ne(t,e.nodes,15);if(o)return{x:o.x,y:o.y}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const o=zt.value;if(!o)return jt.value?Jt(t,Ut.value):t;const i=Ne(t,o.nodes,15);if(i)return{x:i.x,y:i.y};if(e){const e=Le(o);let i=null,n=15;for(const o of e){const e=this._getClosestPointOnSegment(t,o.startPos,o.endPos),s=Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));s<n&&(n=s,i=e)}if(i)return i}return jt.value?Jt(t,Ut.value):t}_getClosestPointOnSegment(t,e,o){const i=o.x-e.x,n=o.y-e.y,s=i*i+n*n;if(0===s)return e;const r=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/s));return{x:e.x+r*i,y:e.y+r*n}}_handleSelectClick(t,e=!1){const o=zt.value;if(!o)return!1;const i=Le(o);for(const o of i){if(this._pointToSegmentDistance(t,o.startPos,o.endPos)<o.thickness/2+5){if(e&&"walls"===this._canvasMode&&"edge"===Bt.value.type){const t=[...Bt.value.ids],e=t.indexOf(o.id);return e>=0?t.splice(e,1):t.push(o.id),Bt.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return Bt.value={type:"edge",ids:[o.id]},this._updateEdgeEditorForSelection([o.id]),!0}}const n=Vt.value.filter(t=>t.floor_id===o.id);for(const e of n){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return Bt.value={type:"device",ids:[e.id]},!0}for(const e of o.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){Bt.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null},!0}return Bt.value={type:"none",ids:[]},!1}_updateEdgeEditorForSelection(t){const e=zt.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const o=Ce(e.nodes);if(1===t.length){const i=e.edges.find(e=>e.id===t[0]);if(i){const t=o.get(i.start_node),e=o.get(i.end_node);if(t&&e){const o=this._calculateWallLength(t,e);this._edgeEditor={edge:i,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:o},this._editingLength=Math.round(o).toString(),this._editingLengthLocked=i.length_locked,this._editingDirection=i.direction,this._editingOpeningParts=i.opening_parts??"single",this._editingOpeningType=i.opening_type??"swing",this._editingSwingDirection=i.swing_direction??"left",this._editingEntityId=i.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const i=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t),n=[];for(const t of i){const e=o.get(t.start_node),i=o.get(t.end_node);e&&n.push({x:e.x,y:e.y}),i&&n.push({x:i.x,y:i.y})}const s=function(t,e=2){if(t.length<2)return!0;if(2===t.length)return!0;let o=0,i=t[0],n=t[1];for(let e=0;e<t.length;e++)for(let s=e+1;s<t.length;s++){const r=Gt(t[e],t[s]);r>o&&(o=r,i=t[e],n=t[s])}if(o<1e-9)return!0;const s=n.x-i.x,r=n.y-i.y,a=Math.sqrt(s*s+r*r);for(const o of t)if(Math.abs((o.x-i.x)*r-(o.y-i.y)*s)/a>e)return!1;return!0}(n);let r;if(s){r=0;for(const t of i){const e=o.get(t.start_node),i=o.get(t.end_node);e&&i&&(r+=this._calculateWallLength(e,i))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:i,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(t,e,o){const i=o.x-e.x,n=o.y-e.y,s=i*i+n*n;if(0===s)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const r=Math.max(0,Math.min(1,((t.x-e.x)*i+(t.y-e.y)*n)/s)),a=e.x+r*i,l=e.y+r*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let o="free";if(e){o=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,o);const i=zt.value,n=i?.nodes.some(e=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1);this._wallChainStart&&Math.abs(t.x-this._wallChainStart.x)<1&&Math.abs(t.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Wt.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=t}else this._wallStartPoint=t,this._wallChainStart=t}async _completeWall(t,e,o="free"){if(!this.hass)return;const i=zt.value,n=Rt.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l={id:""};try{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:o});l.id=i.edge.id,await Xt(),await this._syncRoomsWithEdges(),Ue({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await Xt(),await this._syncRoomsWithEdges()},redo:async()=>{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:o});l.id=i.edge.id,await Xt(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.inverse();return{x:o.a*t.x+o.c*t.y+o.e,y:o.b*t.x+o.d*t.y+o.f}}const o=this._svg.getBoundingClientRect(),i=this._viewBox.width/o.width,n=this._viewBox.height/o.height;return{x:this._viewBox.x+(t.x-o.left)*i,y:this._viewBox.y+(t.y-o.top)*n}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(t){const e=zt.value;if(!e)return;const o=e.rooms.find(e=>e.id===t);if(!o||0===o.polygon.vertices.length)return;const i=o.polygon.vertices.map(t=>t.x),n=o.polygon.vertices.map(t=>t.y),s=Math.min(...i),r=Math.max(...i),a=Math.min(...n),l=Math.max(...n),d=r-s,c=l-a;let h=d+2*(.15*Math.max(d,50)),p=c+2*(.15*Math.max(c,50));const g=this._svg?.getBoundingClientRect(),u=g&&g.width>0&&g.height>0?g.width/g.height:1.25;h/p>u?p=h/u:h=p*u;const f=(s+r)/2,_=(a+l)/2;this._animateViewBox({x:f-h/2,y:_-p/2,width:h,height:p},400)}_animateToFloor(){const t=zt.value;if(!t)return;const e=[],o=[];for(const i of t.nodes)e.push(i.x),o.push(i.y);for(const i of t.rooms)for(const t of i.polygon.vertices)e.push(t.x),o.push(t.y);for(const i of Vt.value)i.floor_id===t.id&&(e.push(i.position.x),o.push(i.position.y));if(0===e.length)return;const i=Math.min(...e),n=Math.max(...e),s=Math.min(...o),r=Math.max(...o),a=n-i,l=r-s;let d=a+2*(.1*Math.max(a,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),p=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>p?c=d/p:d=c*p;const g=(i+n)/2,u=(s+r)/2;this._animateViewBox({x:g-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(t,e){this._cancelViewBoxAnimation();const o={...this._viewBox},i=performance.now(),n=s=>{const r=s-i,a=Math.min(r/e,1),l=1-Math.pow(1-a,3),d={x:o.x+(t.x-o.x)*l,y:o.y+(t.y-o.y)*l,width:o.width+(t.width-o.width)*l,height:o.height+(t.height-o.height)*l};this._viewBox=d,Tt.value=d,this._viewBoxAnimation=a<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(t){const e=[],o=[];for(const i of t.nodes)e.push(i.x),o.push(i.y);for(const i of t.rooms)for(const t of i.polygon.vertices)e.push(t.x),o.push(t.y);for(const i of Vt.value)i.floor_id===t.id&&(e.push(i.position.x),o.push(i.position.y));if(0===e.length)return;const i=Math.min(...e),n=Math.max(...e),s=Math.min(...o),r=Math.max(...o),a=n-i,l=r-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=a+2*(.1*Math.max(a,50)),p=l+2*(.1*Math.max(l,50));h/p>c?p=h/c:h=p*c;const g={x:(i+n)/2-h/2,y:(s+r)/2-p/2,width:h,height:p};Tt.value=g,this._viewBox=g}_pointInPolygon(t,e){if(e.length<3)return!1;let o=!1;const i=e.length;for(let n=0,s=i-1;n<i;s=n++){const i=e[n],r=e[s];i.y>t.y!=r.y>t.y&&t.x<(r.x-i.x)*(t.y-i.y)/(r.y-i.y)+i.x&&(o=!o)}return o}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=function(t,e){if(0===e.length)return[];const o=new Map;for(const e of t)o.set(e.id,e);const i=new Map,n=(t,e)=>{const n=o.get(t),s=o.get(e);if(!n||!s)return;if(t===e)return;const r=Math.atan2(s.y-n.y,s.x-n.x);i.has(t)||i.set(t,[]),i.get(t).push({targetId:e,angle:r})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of i)t.sort((t,e)=>t.angle-e.angle);const s=new Set,r=[],a=(t,e)=>`${t}->${e}`;for(const[t,e]of i)for(const n of e){const e=a(t,n.targetId);if(s.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=a(d,c);if(s.has(e)){h=!1;break}s.add(e),l.push(d);const r=o.get(d),p=o.get(c),g=Math.atan2(r.y-p.y,r.x-p.x),u=i.get(c);if(!u||0===u.length){h=!1;break}let f=null;for(const t of u)if(t.angle>g){f=t;break}if(f||(f=u[0]),d=c,c=f.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&r.push(l.map(t=>{const e=o.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of r){const e=Oe(t),o=Math.abs(e);if(o<100)continue;if(e>0)continue;const i=Re(t);l.push({vertices:t,area:o,centroid:i})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}(t.nodes,t.edges),i=[...t.rooms],n=new Set;let s=this._getNextRoomNumber(i)-1;for(const r of o){let o=null,a=0;for(const t of i){if(n.has(t.id))continue;const e=t.polygon.vertices,i=r.vertices,s=this._getPolygonCenter(e);if(!s)continue;const l=r.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;e.length===i.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>a&&(a=c,o=t)}if(o){n.add(o.id);if(this._verticesChanged(o.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,polygon:{vertices:r.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${s}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of i)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await Xt()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let o=0;o<t.length;o++)if(Math.abs(t[o].x-e[o].x)>1||Math.abs(t[o].y-e[o].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const o of t){const t=o.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const{room:o,editName:i,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:o.id,name:i,color:n,ha_area_id:s}),await Xt()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,Bt.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Bt.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=Rt.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await Xt()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,Bt.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;return H`
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
            ${this._haAreas.map(t=>H`
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
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(t=>H`
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
    `}_renderEdgeChains(t,e,o=null){const i=Le(t);let n=i.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:t.startPos,endPos:t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}));if(this._draggingNode){const{positions:e,blocked:o,blockedBy:s}=Me(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);o?s&&this._blinkEdges(s):n=i.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:e.get(t.start_node)??t.startPos,endPos:e.get(t.end_node)??t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}))}const s=function(t){const e=t.filter(t=>"wall"===t.type);if(0===e.length)return[];const o=new Set,i=[];for(const t of e){if(o.has(t.id))continue;const n=[t];o.add(t.id);let s=t.end_node,r=!0;for(;r;){r=!1;for(const t of e)if(!o.has(t.id)){if(t.start_node===s){n.push(t),o.add(t.id),s=t.end_node,r=!0;break}if(t.end_node===s){n.push({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),o.add(t.id),s=t.start_node,r=!0;break}}}let a=t.start_node;for(r=!0;r;){r=!1;for(const t of e)if(!o.has(t.id)){if(t.end_node===a){n.unshift(t),o.add(t.id),a=t.start_node,r=!0;break}if(t.start_node===a){n.unshift({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),o.add(t.id),a=t.end_node,r=!0;break}}}i.push(n)}return i}(n),r="edge"===e.type?n.filter(t=>e.ids.includes(t.id)):[],a=Kt.value.get(t.id),l=a?new Set(a.map(t=>t.edgeId)):new Set,d=n.filter(t=>"door"===t.type||"window"===t.type),c=[];for(const t of s)if(o){let e=[],i=!1;for(const n of t){const t=o.has(n.id);0===e.length?(e.push(n),i=t):t===i?e.push(n):(c.push({edges:e,dimClass:i?"edges-focused":"edges-dimmed"}),e=[n],i=t)}e.length>0&&c.push({edges:e,dimClass:i?"edges-focused":"edges-dimmed"})}else c.push({edges:t,dimClass:""});return q`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(t=>q`
        <path class="wall ${t.dimClass}"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,o=[t[0].start];for(const e of t)o.push(e.end);const i=o.length>2&&Math.abs(o[0].x-o[o.length-1].x)<1&&Math.abs(o[0].y-o[o.length-1].y)<1,n=[],s=[];for(let t=0;t<o.length;t++){const r=o[t];let a,l=null,d=null;if(t>0||i){const e=o[t>0?t-1:o.length-2],i=r.x-e.x,n=r.y-e.y,s=Math.sqrt(i*i+n*n);s>0&&(l={x:i/s,y:n/s})}if(t<o.length-1||i){const e=o[t<o.length-1?t+1:1],i=e.x-r.x,n=e.y-r.y,s=Math.sqrt(i*i+n*n);s>0&&(d={x:i/s,y:n/s})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},o=t.x+e.x,i=t.y+e.y,n=Math.sqrt(o*o+i*i);if(n<.01)a=t;else{a={x:o/n,y:i/n};const e=t.x*a.x+t.y*a.y;if(Math.abs(e)>.1){const t=1/e,o=Math.min(Math.abs(t),3)*Math.sign(t);a={x:a.x*o,y:a.y*o}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:r.x+a.x*e,y:r.y+a.y*e}),s.push({x:r.x-a.x*e,y:r.y-a.y*e})}const r=Math.min(.8*e,4);let a=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)if(t<n.length-1&&n.length>2){const e=n[t-1],o=n[t],i=n[t+1],s=o.x-e.x,l=o.y-e.y,d=Math.sqrt(s*s+l*l),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=o.x-s/d*g,e=o.y-l/d*g,i=o.x+c/p*u,n=o.y+h/p*u;a+=` L${t},${e} Q${o.x},${o.y} ${i},${n}`}else a+=` L${o.x},${o.y}`}else a+=` L${n[t].x},${n[t].y}`;const l=[...s].reverse();if(i){a+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let t=s.length-2;t>=0;t--){const e=s.length-1-t;if(e>0&&e<s.length-1){const e=s[t+1],o=s[t],i=s[t-1],n=o.x-e.x,l=o.y-e.y,d=Math.sqrt(n*n+l*l),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=o.x-n/d*g,e=o.y-l/d*g,i=o.x+c/p*u,s=o.y+h/p*u;a+=` L${t},${e} Q${o.x},${o.y} ${i},${s}`}else a+=` L${o.x},${o.y}`}else a+=` L${s[t].x},${s[t].y}`}}else for(let t=0;t<l.length;t++)if(t>0&&t<l.length-1&&l.length>2){const e=l[t-1],o=l[t],i=l[t+1],n=o.x-e.x,s=o.y-e.y,d=Math.sqrt(n*n+s*s),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=o.x-n/d*g,e=o.y-s/d*g,i=o.x+c/p*u,r=o.y+h/p*u;a+=` L${t},${e} Q${o.x},${o.y} ${i},${r}`}else a+=` L${o.x},${o.y}`}else a+=` L${l[t].x},${l[t].y}`;return a+=" Z",a}(t.edges.map(t=>({start:t.startPos,end:t.endPos,thickness:t.thickness})))}"/>
      `)}

      <!-- Door and window openings -->
      ${d.map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness}),i=!!o&&o.has(t.id),n=o?i?"edges-focused":"edges-dimmed":"";let s=0;if(t.entity_id&&this.hass?.states[t.entity_id]){const e=this.hass.states[t.entity_id],o=e.state;if("on"===o||"open"===o){const o="door"===t.type?Ve:Math.PI/2,i=e.attributes.current_position;s=void 0!==i&&i>=0&&i<=100?i/100*o:o}}const r=this._swingAngles.get(t.id)??0;let a=r;const l=s-r;Math.abs(l)>.001?(a=r+.15*l,this._swingAngles.set(t.id,a),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):a!==s&&(a=s,this._swingAngles.set(t.id,s));const d=t.endPos.x-t.startPos.x,c=t.endPos.y-t.startPos.y,h=Math.sqrt(d*d+c*c);if(0===h)return null;const p=d/h,g=c/h,u=-g,f=p,_=t.opening_parts??"single",y=t.opening_type??"swing",v="window"===t.type?"window":"door";if("swing"===y){const e=.5*t.thickness,o=.7*t.thickness,i=1.5,s=(t,i)=>{const n=t.x,s=t.y,r=n+p*i*e,a=s+g*i*e;return`M${n-u*o},${s-f*o}\n                    L${n+u*o},${s+f*o}\n                    L${r+u*o},${a+f*o}\n                    L${r-u*o},${a-f*o} Z`},r=e+i,l={x:t.startPos.x+p*r,y:t.startPos.y+g*r},d={x:t.endPos.x-p*r,y:t.endPos.y-g*r},c=t.swing_direction??"left",y="right"===c?t.endPos:t.startPos,x="right"===c?-1:1,m=y.x+p*x*e+u*(t.thickness/2),b=y.y+g*x*e+f*(t.thickness/2);if("door"===v){const e=t.thickness/2,o=y.x+u*e,i=y.y+f*e,r="right"===c?t.startPos:t.endPos,p=r.x+u*e,g=r.y+f*e,_=Ke(o,i,p,g,85,"left"===c),v=`M${o},${i} L${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy} Z`,x=Math.cos(a),w=Math.sin(a),$="left"===c?1:-1,k=t=>{const e=t.x-m,o=t.y-b;return{x:m+x*e-$*w*o,y:b+$*w*e+x*o}},E=k(l),P=k(d),M=this._singleEdgePath({start:E,end:P,thickness:t.thickness});return q`
              <g class="${n}">
                ${this._fadedWedge(t.id,v,o,i,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="door-closed-segment" d="${M}"/>
                <circle class="metal-hinge" cx="${m}" cy="${b}" r="2.5"/>
              </g>
            `}const w=t.thickness/2,$=y.x+u*w,k=y.y+f*w,E="right"===c?t.startPos:t.endPos,P=E.x+u*w,M=E.y+f*w,S=$+u*h,A=k+f*h,C=.5522847498,I=P+C*(S-$),L=M+C*(A-k),D=S+C*(P-$),N=A+C*(M-k),O=`M${P},${M} C${I},${L} ${D},${N} ${S},${A}`,R=`M${$},${k} L${P},${M} C${I},${L} ${D},${N} ${S},${A} Z`;if("double"===_){const o=(l.x+d.x)/2,r=(l.y+d.y)/2,c=.5*i,_=(t.startPos.x+t.endPos.x)/2,y=(t.startPos.y+t.endPos.y)/2,v=h/2,x=t.startPos.x+u*w,m=t.startPos.y+f*w,b=t.endPos.x+u*w,$=t.endPos.y+f*w,k=_+u*w,E=y+f*w,P=x+u*v,M=m+f*v,S=b+u*v,A=$+f*v,I=k+C*(P-x),L=E+C*(M-m),D=P+C*(k-x),N=M+C*(E-m),O=k+C*(S-b),R=E+C*(A-$),z=S+C*(k-b),F=A+C*(E-$),W=`M${x},${m} L${k},${E} C${I},${L} ${D},${N} ${P},${M} Z`,B=`M${b},${$} L${k},${E} C${O},${R} ${z},${F} ${S},${A} Z`,T=Math.cos(a),U=Math.sin(a),j=(t,e,o,i)=>{const n=t.x-e,s=t.y-o;return{x:e+T*n-i*U*s,y:o+i*U*n+T*s}},H=t.startPos.x+p*e+u*(t.thickness/2),V=t.startPos.y+g*e+f*(t.thickness/2),K=t.endPos.x-p*e+u*(t.thickness/2),Y=t.endPos.y-g*e+f*(t.thickness/2),Z={x:o-p*c,y:r-g*c},X={x:o+p*c,y:r+g*c},G=this._singleEdgePath({start:j(l,H,V,1),end:j(Z,H,V,1),thickness:t.thickness}),J=this._singleEdgePath({start:j(X,K,Y,-1),end:j(d,K,Y,-1),thickness:t.thickness});return q`
              <g class="${n}">
                ${this._fadedWedge(`${t.id}-l`,W,x,m,v,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${t.id}-r`,B,b,$,v,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${k},${E} C${I},${L} ${D},${N} ${P},${M}"/>
                <path class="door-swing"
                      d="M${k},${E} C${O},${R} ${z},${F} ${S},${A}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="window-closed-segment" d="${G}"/>
                <path class="window-closed-segment" d="${J}"/>
              </g>
            `}const z=Math.cos(a),F=Math.sin(a),W="left"===c?1:-1,B=t=>{const e=t.x-m,o=t.y-b;return{x:m+z*e-W*F*o,y:b+W*F*e+z*o}},T=this._singleEdgePath({start:B(l),end:B(d),thickness:t.thickness});return q`
            <g class="${n}">
              ${this._fadedWedge(t.id,R,$,k,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${O}"/>
              <path class="opening-stop" d="${s(t.startPos,1)}"/>
              <path class="opening-stop" d="${s(t.endPos,-1)}"/>
              <path class="window-closed-segment" d="${T}"/>
            </g>
          `}if("sliding"===y){const o=.3*t.thickness,i=3,s=t.endPos.x+u*o,r=t.endPos.y+f*o,a=t.startPos.x-u*o,l=t.startPos.y-f*o;return q`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
              <line class="door-swing"
                    x1="${t.startPos.x+u*o}" y1="${t.startPos.y+f*o}"
                    x2="${s}" y2="${r}"/>
              <polygon class="sliding-arrow"
                       points="${s},${r} ${s-p*i+u*i*.5},${r-g*i+f*i*.5} ${s-p*i-u*i*.5},${r-g*i-f*i*.5}"/>
              <line class="door-swing"
                    x1="${t.endPos.x-u*o}" y1="${t.endPos.y-f*o}"
                    x2="${a}" y2="${l}"/>
              <polygon class="sliding-arrow"
                       points="${a},${l} ${a+p*i+u*i*.5},${l+g*i+f*i*.5} ${a+p*i-u*i*.5},${l+g*i-f*i*.5}"/>
              ${"window"===v?q`
                <line class="window-pane"
                      x1="${t.startPos.x}" y1="${t.startPos.y}"
                      x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-f*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+f*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-f*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+f*t.thickness/2}"/>
            </g>
          `}if("tilt"===y){const o=(t.startPos.x+t.endPos.x)/2,i=(t.startPos.y+t.endPos.y)/2,s=.25*h;return q`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
              <line class="window-pane"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              <line class="door-swing"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${o+u*s}" y2="${i+f*s}"/>
              <line class="door-swing"
                    x1="${t.endPos.x}" y1="${t.endPos.y}"
                    x2="${o+u*s}" y2="${i+f*s}"/>
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-f*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+f*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-f*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+f*t.thickness/2}"/>
            </g>
          `}return null})}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${l.size>0?n.filter(t=>l.has(t.id)).map(t=>q`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
        `):null}

      <!-- Selected edge highlights -->
      ${r.map(t=>q`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(t=>{const e=n.find(e=>e.id===t);return e?q`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
        `:null}):null}
    `}_fadedWedge(t,e,o,i,n,s){return q`
      <defs>
        <radialGradient id="wg-${t}" cx="${o}" cy="${i}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path d="${e}" fill="url(#wg-${t})" stroke="none"/>
    `}_singleEdgePath(t){const{start:e,end:o,thickness:i}=t,n=o.x-e.x,s=o.y-e.y,r=Math.sqrt(n*n+s*s);if(0===r)return"";const a=-s/r*(i/2),l=n/r*(i/2);return`M${e.x+a},${e.y+l}\n            L${o.x+a},${o.y+l}\n            L${o.x-a},${o.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_blinkEdges(t){this._blinkTimer&&clearTimeout(this._blinkTimer);const e=Array.isArray(t)?t:[t];this._blinkingEdgeIds=e;const o=zt.value;if(o){const t=e.map(t=>{const e=o.edges.find(e=>e.id===t);if(!e)return t.slice(0,8)+"…";const i=o.nodes.find(t=>t.id===e.start_node),n=o.nodes.find(t=>t.id===e.end_node),s=i&&n?Math.sqrt((n.x-i.x)**2+(n.y-i.y)**2).toFixed(1):"?",r=[];return"free"!==e.direction&&r.push(e.direction),e.length_locked&&r.push("len-locked"),e.angle_group&&r.push(`ang:${e.angle_group.slice(0,4)}`),`${t.slice(0,8)}… (${s}cm${r.length?" "+r.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${e.length} blocked edge(s):\n  ${t.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_getRoomEdgeIds(t,e){const o=e.rooms.find(e=>e.id===t);if(!o)return new Set;const i=o.polygon.vertices;if(i.length<2)return new Set;const n=[];for(const t of i){const o=Ne(t,e.nodes,5);o&&n.push(o.id)}if(n.length<2)return new Set;const s=new Map;for(const t of e.edges)s.set(`${t.start_node}|${t.end_node}`,t.id),s.set(`${t.end_node}|${t.start_node}`,t.id);const r=new Set;for(let t=0;t<n.length;t++){const e=n[t],o=n[(t+1)%n.length],i=s.get(`${e}|${o}`);i&&r.add(i)}return r}_renderFloor(){const t=zt.value;if(!t)return null;const e=Bt.value,o=qt.value,i=this._focusedRoomId,n=i?this._getRoomEdgeIds(i,t):null;return q`
      <!-- Background layer -->
      ${o.find(t=>"background"===t.id)?.visible&&t.background_image?q`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${o.find(t=>"background"===t.id)?.opacity??1}"
               class="${i?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer -->
      ${o.find(t=>"structure"===t.id)?.visible?q`
        <g class="structure-layer" opacity="${o.find(t=>"structure"===t.id)?.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>q`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""} ${i?t.id===i?"room-focused":"room-dimmed":""}"
                  d="${function(t){const e=t.vertices;if(0===e.length)return"";const o=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return o.join(" ")+" Z"}(t.polygon)}"
                  fill="${t.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}

          <!-- Edges (rendered as chains for proper corners) -->
          ${this._renderEdgeChains(t,e,n)}
        </g>
      `:null}

      <!-- Labels layer -->
      ${o.find(t=>"labels"===t.id)?.visible?q`
        <g class="labels-layer" opacity="${o.find(t=>"labels"===t.id)?.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);if(!e)return null;const o=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name,n=!!t.ha_area_id;return q`
              <g class="room-label-group ${i?t.id===i?"label-focused":"label-dimmed":""}" transform="translate(${e.x}, ${e.y})">
                <text class="room-label" x="0" y="0">
                  ${o}
                </text>
                ${n?q`
                  <g class="room-link-icon" transform="translate(${3.8*o.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${o.find(t=>"devices"===t.id)?.visible?q`
        <g class="devices-layer" opacity="${o.find(t=>"devices"===t.id)?.opacity??1}">
          ${Vt.value.filter(e=>e.floor_id===t.id).map(t=>q`
              <g class="${i?t.room_id===i?"device-focused":"device-dimmed":""}">
                ${this._renderDevice(t)}
              </g>
            `)}
        </g>
      `:null}
    `}_renderDevice(t){const e=this.hass?.states[t.entity_id],o="on"===e?.state,i=Bt.value;return q`
      <g class="device-marker ${o?"on":"off"} ${"device"===i.type&&i.ids.includes(t.id)?"selected":""}"
         transform="translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})">
        <circle r="12" fill="${o?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${t.show_label?q`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${t.label||e?.attributes.friendly_name||t.entity_id}
          </text>
        `:null}
      </g>
    `}_renderNodeEndpoints(){const t=zt.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const o of t.edges)e.add(o.start_node),e.add(o.end_node);const o=[];for(const i of t.nodes)i.pinned&&e.has(i.id)&&o.push({node:i,coords:{x:i.x,y:i.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&e.has(this._draggingNode.node.id)){const e=o.findIndex(t=>t.node.id===this._draggingNode.node.id);e>=0&&o.splice(e,1);const{positions:i,blocked:n}=Me(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:i.get(this._draggingNode.node.id)??this._cursorPos;o.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&e.has(this._hoveredNode.id)&&(o.some(t=>t.node.id===this._hoveredNode.id)||o.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===o.length)return null;return q`
      <g class="wall-endpoints-layer">
        ${o.map(t=>t.isPinned?q`
          <g class="wall-endpoint pinned"
             transform="translate(${t.coords.x}, ${t.coords.y})"
             @pointerdown=${e=>this._handleNodePointerDown(e,t.node)}>
            <rect x="-5" y="-5" width="10" height="10" rx="2" />
            <g transform="translate(-6, -18) scale(0.5)">
              <path d="${"M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"}" fill="var(--primary-color, #2196f3)" />
            </g>
          </g>
        `:q`
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
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,{positions:o,blocked:i}=Me(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y);if(i)return null;const n=Le(t),s=[];for(const t of n){const e=o.get(t.start_node),i=o.get(t.end_node);if(!e&&!i)continue;const n=e??t.startPos,r=i??t.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:t.startPos,origEnd:t.endPos,length:a,angle:l,thickness:t.thickness})}const r=[];for(let t=0;t<s.length;t++)for(let o=t+1;o<s.length;o++){const i=Math.abs(s[t].angle-s[o].angle)%Math.PI;Math.abs(i-Math.PI/2)<.02&&r.push({point:e,angle:Math.min(s[t].angle,s[o].angle)})}return q`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:t,origEnd:e,thickness:o})=>{const i=e.x-t.x,n=e.y-t.y,s=Math.sqrt(i*i+n*n);if(0===s)return null;const r=-n/s*(o/2),a=i/s*(o/2);return q`
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
      ${s.map(({start:t,end:e,length:o})=>{const i=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return q`
          <g transform="translate(${i}, ${n}) rotate(${s>90||s<-90?s+180:s})">
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
    `}_handleNodePointerDown(t,e){if(2===t.button)return;t.stopPropagation(),t.preventDefault();const o=this._hoveredNode||e;if("wall"===Wt.value){const e={x:o.x,y:o.y};return void this._handleWallClick(e,t.shiftKey)}if(o.pinned)return this._wallStartPoint={x:o.x,y:o.y},Wt.value="wall",void(this._hoveredNode=null);this._draggingNode={node:o,originalCoords:{x:o.x,y:o.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_renderDrawingPreview(){if("wall"===Wt.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,o=this._calculateWallLength(t,e),i=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return q`
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
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const t=Wt.value;if("door"!==t&&"window"!==t)return null;const{position:e,startPos:o,endPos:i,thickness:n}=this._openingPreview,s="door"===t?80:100,r=i.x-o.x,a=i.y-o.y,l=Math.sqrt(r*r+a*a);if(0===l)return null;const d=r/l,c=a/l,h=-c,p=d,g=s/2,u=n/2,f=e.x,_=e.y,y=`M${f-d*g+h*u},${_-c*g+p*u}\n                      L${f+d*g+h*u},${_+c*g+p*u}\n                      L${f+d*g-h*u},${_+c*g-p*u}\n                      L${f-d*g-h*u},${_-c*g-p*u}\n                      Z`;if("window"===t)return q`
        <g class="opening-ghost">
          <path class="window" d="${y}"/>
          <line class="window-pane"
                x1="${f}" y1="${_}"
                x2="${f+h*n}" y2="${_+p*n}"/>
        </g>
      `;const v=f-d*g,x=_-c*g,m=f+d*g,b=_+c*g,w=Ke(v,x,m,b,85,!0),$=w.ox-v,k=w.oy-x,E=Math.sqrt($*$+k*k),P=E>0?-k/E*1.25:0,M=E>0?$/E*1.25:0,S=`M${v+P},${x+M} L${w.ox+P},${w.oy+M} L${w.ox-P},${w.oy-M} L${v-P},${x-M} Z`,A=`M${v},${x} L${m},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy} Z`,C=f-d*g,I=_-c*g,L=f+d*g,D=_+c*g;return q`
      <g class="opening-ghost">
        <path class="door" d="${y}"/>
        <path class="swing-wedge" d="${A}"/>
        <path class="door-leaf-panel" d="${S}"/>
        <path class="door-swing"
              d="M${m},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy}"/>
        <line class="door-jamb" x1="${C-h*u}" y1="${I-p*u}" x2="${C+h*u}" y2="${I+p*u}"/>
        <line class="door-jamb" x1="${L-h*u}" y1="${D-p*u}" x2="${L+h*u}" y2="${D+p*u}"/>
        <circle class="hinge-glow" cx="${v}" cy="${x}" r="5"/>
        <circle class="hinge-dot" cx="${v}" cy="${x}" r="3"/>
      </g>
    `}_getPolygonCenter(t){if(0===t.length)return null;if(t.length<3){let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;return{x:e/t.length,y:o/t.length}}let e=0,o=0,i=0;const n=t.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=t[s].x*t[r].y-t[r].x*t[s].y;e+=a,o+=(t[s].x+t[r].x)*a,i+=(t[s].y+t[r].y)*a}if(e/=2,Math.abs(e)<1e-6){let e=0,o=0;for(const i of t)e+=i.x,o+=i.y;return{x:e/n,y:o/n}}const s=1/(6*e);return{x:o*s,y:i*s}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const o=e.a*t.x+e.c*t.y+e.e,i=e.b*t.x+e.d*t.y+e.f,n=this._svg.getBoundingClientRect();return{x:o-n.left,y:i-n.top}}const o=this._svg.getBoundingClientRect(),i=o.width/this._viewBox.width,n=o.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*i,y:(t.y-this._viewBox.y)*n}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const t=this._edgeEditor.edge,e="door"===t.type,o="window"===t.type,i=e||o;return H`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e?"Door Properties":o?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t.link_group?(()=>{const e=zt.value,o=t.link_group,i=e?e.edges.filter(t=>t.link_group===o).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ze(o)};">
                <ha-icon icon="mdi:link-variant" style="--mdc-icon-size:14px;"></ha-icon>
                Linked (${i} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._unlinkEdges()}
                title="Unlink this wall"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        ${t.collinear_group?(()=>{const e=zt.value,o=t.collinear_group,i=e?e.edges.filter(t=>t.collinear_group===o).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ze(o)};">
                <ha-icon icon="mdi:vector-line" style="--mdc-icon-size:14px;"></ha-icon>
                Collinear (${i} edges)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._collinearUnlinkEdges()}
                title="Remove collinear constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        ${i?(()=>{const e=zt.value;if(!e)return null;const o=Ce(e.nodes),i=o.get(t.start_node),n=o.get(t.end_node);if(!i||!n)return null;const s=(i.x+n.x)/2,r=(i.y+n.y)/2,a=n.x-i.x,l=n.y-i.y,d=Math.sqrt(a*a+l*l);if(0===d)return null;const c=-l/d,h=a/d,p=t.thickness/2+5,g={x:s+c*p,y:r+h*p},u={x:s-c*p,y:r-h*p},f=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(g,t.polygon.vertices)),_=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(u,t.polygon.vertices)),y=f?.name||(t.is_exterior?"Outside":null),v=_?.name||(t.is_exterior?"Outside":null);return y||v?H`
            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Opens into</span>
              <div class="wall-editor-row" style="gap:6px; font-size:12px; align-items:center;">
                <button
                  class="room-side-btn active"
                  style="background:${f?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("a",t)}
                >${y??"—"}</button>
                <ha-icon icon="mdi:door-open" style="--mdc-icon-size:14px; color:var(--secondary-text-color, #888);"></ha-icon>
                <button
                  class="room-side-btn"
                  style="background:${_?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("b",t)}
                >${v??"—"}</button>
              </div>
            </div>
          `:null})():null}

        ${i?(()=>{const t=e?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],o="swing"===this._editingOpeningType,i="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return H`
            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Parts</span>
              <div class="wall-editor-constraints">
                <button
                  class="constraint-btn ${"single"===this._editingOpeningParts?"active":""}"
                  @click=${()=>{this._editingOpeningParts="single"}}
                >Single</button>
                <button
                  class="constraint-btn ${"double"===this._editingOpeningParts?"active":""}"
                  @click=${()=>{this._editingOpeningParts="double"}}
                >Double</button>
              </div>
            </div>

            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Type</span>
              <div class="wall-editor-constraints">
                ${t.map(t=>H`
                  <button
                    class="constraint-btn ${this._editingOpeningType===t.value?"active":""}"
                    @click=${()=>{this._editingOpeningType=t.value}}
                  >${t.label}</button>
                `)}
              </div>
            </div>

            ${o?H`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===i.length?H`
                    <button class="constraint-btn active">${i[0].label}</button>
                  `:i.map(t=>H`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===t.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=t.value}}
                    >${t.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${i?H`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const t=this.hass?.states[this._editingEntityId],e=t?.attributes.friendly_name||this._editingEntityId,o=t?.attributes.icon||"mdi:radiobox-marked";return H`
                <div class="wall-editor-row" style="gap:6px; align-items:center;">
                  <ha-icon icon=${o} style="--mdc-icon-size:18px; color:${"on"===t?.state?"var(--state-light-active-color, #ffd600)":"var(--secondary-text-color, #999)"};"></ha-icon>
                  <span style="flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${e}</span>
                  <span style="font-size:11px; color:var(--secondary-text-color, #999); font-weight:500;">${t?.state??"?"}</span>
                  <button
                    class="constraint-btn"
                    @click=${()=>{this._editingEntityId=null,this._openingSensorPickerOpen=!1,this._openingSensorSearch=""}}
                    title="Remove sensor"
                    style="padding:2px 6px; font-size:11px;"
                  ><ha-icon icon="mdi:close" style="--mdc-icon-size:14px;"></ha-icon></button>
                </div>
              `})():this._openingSensorPickerOpen?H`
              <div style="display:flex; flex-direction:column; gap:6px;">
                <input
                  class="opening-sensor-search"
                  type="text"
                  placeholder="Search sensors..."
                  .value=${this._openingSensorSearch}
                  @input=${t=>{this._openingSensorSearch=t.target.value}}
                  @keydown=${t=>{"Escape"===t.key&&(this._openingSensorPickerOpen=!1)}}
                  style="width:100%; padding:6px 8px; border:1px solid var(--divider-color, #e0e0e0); border-radius:8px; font-size:12px; background:var(--primary-background-color, #fafafa); color:var(--primary-text-color, #333); box-sizing:border-box;"
                />
                <div style="max-height:160px; overflow-y:auto;">
                  ${this._getOpeningSensorEntities().map(t=>H`
                    <div
                      class="entity-item ${"on"===t.state?"on":""}"
                      @click=${()=>{this._editingEntityId=t.entity_id,this._openingSensorPickerOpen=!1,this._openingSensorSearch=""}}
                    >
                      <ha-icon icon=${t.attributes.icon||"mdi:radiobox-marked"}></ha-icon>
                      <span class="name">${t.attributes.friendly_name||t.entity_id}</span>
                      <span class="state">${t.state}</span>
                    </div>
                  `)}
                </div>
              </div>
            `:H`
              <button
                class="constraint-btn"
                @click=${()=>{this._openingSensorPickerOpen=!0,this._openingSensorSearch="",this.updateComplete.then(()=>{this.shadowRoot?.querySelector(".opening-sensor-search")?.focus()})}}
                style="width:100%;"
              ><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px;"></ha-icon> Link sensor</button>
            `}
          </div>
        `:null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Width</span>
          <div class="wall-editor-row">
            <input
              type="number"
              .value=${this._editingLength}
              @input=${t=>this._editingLength=t.target.value}
              @keydown=${this._handleEditorKeyDown}
              autofocus
            />
            <span class="wall-editor-unit">cm</span>
            ${i?null:H`
              <button
                class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
                @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
                title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
              ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
            `}
          </div>
        </div>

        ${t.angle_group?(()=>{const e=zt.value,o=t.angle_group,i=e?e.edges.filter(t=>t.angle_group===o).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ze(o)};">
                <ha-icon icon="mdi:angle-acute" style="--mdc-icon-size:14px;"></ha-icon>
                Angle Group (${i} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._angleUnlinkEdges()}
                title="Remove angle constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        ${i?null:H`
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
        `}

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          <button class="delete-btn" @click=${this._handleEdgeDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}async _applyDirection(t,e){if(!this.hass)return!1;const o=zt.value,i=Rt.value;if(!o||!i)return!1;const n=o.edges.map(e=>e.id===t.id?{...e,direction:"free",length_locked:!1,angle_group:void 0}:e),s=Se(pe(o.nodes,n),t.id,e);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Xt(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const t=this._nodeEditor.node,e=zt.value,o=e?De(t.id,e.edges).length:0;return H`
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
          ${2===o?H`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._nodeEditor.node,i=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(i)&&!isNaN(n))try{const s=ke(pe(t.nodes,t.edges),o.id,i,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Xt(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(o.id)}catch(t){console.error("Error updating node position:",t),alert(`Failed to update node: ${t}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._nodeEditor.node,i=!o.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:[{node_id:o.id,x:o.x,y:o.y,pinned:i}]}),await Xt(),this._refreshNodeEditor(o.id)}catch(t){console.error("Error toggling node pin:",t),alert(`Failed to toggle pin: ${t}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(t&&e)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:e.id,floor_id:t.id,node_id:this._nodeEditor.node.id}),await Xt(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(t){console.error("Failed to dissolve node:",t),alert(`Failed to dissolve node: ${t}`)}}_refreshNodeEditor(t){const e=zt.value;if(e){const o=e.nodes.find(e=>e.id===t);o&&(this._nodeEditor={node:o,editX:Math.round(o.x).toString(),editY:Math.round(o.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const t=["binary_sensor","cover"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));const o=zt.value,i=this._edgeEditor?.edge.id;if(o){const t=new Set(o.edges.filter(t=>t.entity_id&&t.id!==i).map(t=>t.entity_id));e=e.filter(e=>!t.has(e.entity_id))}if(this._openingSensorSearch){const t=this._openingSensorSearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getFilteredEntities(){if(!this.hass)return[];const t=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));if(this._entitySearch){const t=this._entitySearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[e]||"mdi:devices"}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=zt.value,o=Rt.value;if(!e||!o)return;const i=this.hass,n=o.id,s=e.id,r={...this._pendingDevice.position},a=t.startsWith("binary_sensor.")||t.startsWith("sensor."),l={id:""};try{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:t,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await Xt(),Ue({type:"device_place",description:"Place device",undo:async()=>{await i.callWS({type:"inhabit/devices/remove",floor_plan_id:n,device_id:l.id}),await Xt()},redo:async()=>{const e=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:t,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await Xt()}})}catch(t){console.error("Error placing device:",t),alert(`Failed to place device: ${t}`)}this._pendingDevice=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return H`
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
          ${e.map(t=>H`
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
    `}render(){const t=this._canvasMode,e=[this._isPanning?"panning":"","select"===Wt.value?"select-tool":"","viewing"===t?"view-mode":""].filter(Boolean).join(" ");return H`
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
        ${"walls"===t?this._renderOpeningPreview():null}
        ${"placement"===t?this._renderDevicePreview():null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"placement"===t?this._renderEntityPicker():null}
    `;var o}_getVisibleAnnotationEdgeIds(){const t=Bt.value;if("edge"!==t.type||0===t.ids.length)return null;const e=zt.value;if(!e)return null;const o=new Set(t.ids),i=e.edges.filter(e=>t.ids.includes(e.id)),n=new Set,s=new Set,r=new Set;for(const t of i)t.link_group&&n.add(t.link_group),t.collinear_group&&s.add(t.collinear_group),t.angle_group&&r.add(t.angle_group);for(const t of e.edges)o.has(t.id)||(t.link_group&&n.has(t.link_group)&&o.add(t.id),t.collinear_group&&s.has(t.collinear_group)&&o.add(t.id),t.angle_group&&r.has(t.angle_group)&&o.add(t.id));return o}_renderEdgeAnnotations(){const t=zt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const o=Le(t);return q`
      <g class="wall-annotations-layer">
        ${o.map(t=>{if(!e.has(t.id))return null;const o=(t.startPos.x+t.endPos.x)/2,i=(t.startPos.y+t.endPos.y)/2,n=this._calculateWallLength(t.startPos,t.endPos),s=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),r=s>90||s<-90?s+180:s,a=[];t.length_locked&&a.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===t.direction&&a.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===t.direction&&a.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),p=-(t.thickness/2+6);return q`
            <g transform="translate(${o}, ${i}) rotate(${r})">
              ${t.link_group?q`
                <circle cx="${h}" cy="${p-1}" r="3.5"
                  fill="${Ze(t.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${t.collinear_group?q`
                <g transform="translate(${h-(t.link_group?10:0)}, ${p-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${Ze(t.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              `:null}
              <text class="wall-annotation-text" x="0" y="${p}">${l}</text>
              ${a.map((t,e)=>q`
                <g transform="translate(${c+e*d}, ${p}) rotate(${-r}) scale(${.35})">
                  <path d="${t}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `})}
      </g>
    `}_renderAngleConstraints(){const t=zt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const o=Ce(t.nodes),i=new Map;for(const e of t.edges)e.angle_group&&(i.has(e.angle_group)||i.set(e.angle_group,[]),i.get(e.angle_group).push(e));for(const[t,o]of i)o.some(t=>e.has(t.id))||i.delete(t);const n=[];for(const[,t]of i){if(2!==t.length)continue;const e=new Set([t[0].start_node,t[0].end_node]),i=new Set([t[1].start_node,t[1].end_node]);let s=null;for(const t of e)if(i.has(t)){s=t;break}if(!s)continue;const r=s,a=o.get(r);if(!a)continue;const l=[];for(const e of t){const t=e.start_node===r?e.end_node:e.start_node,i=o.get(t);i&&l.push(Math.atan2(i.y-a.y,i.x-a.x))}if(l.length<2)continue;l.sort((t,e)=>t-e);const d=l.length;for(let t=0;t<d;t++){const e=l[t],o=l[(t+1)%d],i=(o-e+2*Math.PI)%(2*Math.PI);if(Math.PI-i<.01)continue;const s=e+Math.PI,r=o+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):n.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return q`
      <g class="angle-constraints-layer">
        ${n.map(t=>{const e=t.angle1,o=t.angle2,i=o-e,n=180*i/Math.PI;if(n>85&&n<95){const n=.7*s,r=t.x+n*Math.cos(e),a=t.y+n*Math.sin(e),l=t.x+n*Math.cos(o),d=t.y+n*Math.sin(o),c=(e+o)/2,h=n/Math.cos(i/2),p=t.x+h*Math.cos(c),g=t.y+h*Math.sin(c);return q`
              <path d="M${r},${a} L${p},${g} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=t.x+s*Math.cos(e),a=t.y+s*Math.sin(e),l=t.x+s*Math.cos(o),d=t.y+s*Math.sin(o),c=i>Math.PI?1:0;return q`
            <path d="M${r},${a} A${s},${s} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const t=this._multiEdgeEditor.edges,e=this._multiEdgeEditor.collinear??!1;return H`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Bt.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e?H`
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
            ${(()=>{const e=t.map(t=>t.angle_group).filter(Boolean);if(e.length===t.length&&1===new Set(e).size)return H`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===t.length&&(()=>{const e=new Set([t[0].start_node,t[0].end_node]);return e.has(t[1].start_node)||e.has(t[1].end_node)})()?H`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:H`<button
                class="constraint-btn"
                disabled
                title="${2!==t.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const e=t.map(t=>t.link_group).filter(Boolean);return e.length===t.length&&1===new Set(e).size?H`<button
                  class="constraint-btn active"
                  @click=${()=>this._unlinkEdges()}
                  title="Unlink these walls"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon> Unlink</button>`:H`<button
                class="constraint-btn"
                @click=${()=>this._linkEdges()}
                title="Link these walls so property changes propagate"
              ><ha-icon icon="mdi:link-variant"></ha-icon> Link</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Collinear Link</span>
          <div class="wall-editor-row">
            ${(()=>{const o=t.map(t=>t.collinear_group).filter(Boolean);return o.length===t.length&&1===new Set(o).size?H`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:e?H`<button
                  class="constraint-btn"
                  @click=${()=>this._collinearLinkEdges()}
                  title="Constrain walls to stay on the same line"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Link Collinear</button>`:H`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error angle linking edges:",t)}}async _angleUnlinkEdges(){if(!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error angle unlinking edges:",t)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}}catch(t){console.error("Error linking edges:",t)}}async _unlinkEdges(){if(!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error unlinking edges:",t)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=parseFloat(this._editingTotalLength);if(isNaN(o)||o<=0)return;const i=this._multiEdgeEditor.edges.map(t=>t.id),n=function(t,e,o){const i=new Set,n=[];for(const o of e){const e=t.edges.get(o);if(e){if(e.length_locked)return{updates:[],blocked:!0,blockedBy:[e.id]};n.push(e),i.add(e.start_node),i.add(e.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const e of i){const o=t.nodes.get(e);o&&s.push({x:o.x,y:o.y})}const{anchor:r,dir:a}=Qt(s),l=new Map;for(const e of i){const o=t.nodes.get(e);if(!o)continue;const i=o.x-r.x,n=o.y-r.y,s=i*a.x+n*a.y;l.set(e,s)}let d=1/0,c=-1/0,h="";for(const[t,e]of l)e<d&&(d=e,h=t),e>c&&(c=e);const p=c-d;if(p<1e-9)return{updates:[],blocked:!1};const g=ue(t),u=new Set;for(const[t,e]of l){if(u.add(t),t===h)continue;const i=d+o/p*(e-d);g.set(t,{x:r.x+i*a.x,y:r.y+i*a.y})}const f=new Set(u);for(const[e,o]of t.nodes)o.pinned&&f.add(e);const _=ve(t,f,g);for(const e of u){const o=g.get(e),i=t.nodes.get(e);o&&(Math.abs(o.x-i.x)>ee||Math.abs(o.y-i.y)>ee)&&(_.updates.some(t=>t.nodeId===e)||_.updates.push({nodeId:e,x:o.x,y:o.y}))}return _.blocked=!1,delete _.blockedBy,_}(pe(t.nodes,t.edges),i,o);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await Xt();zt.value&&this._updateEdgeEditorForSelection(i)}catch(t){console.error("Error applying total length:",t)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error collinear linking edges:",t)}}async _collinearUnlinkEdges(){if(!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:o}),await Xt();const i=zt.value;if(i)if(this._multiEdgeEditor){const t=o.map(t=>i.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=i.edges.find(t=>t.id===o[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error collinear unlinking edges:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=zt.value,e=Rt.value;if(!t||!e)return;const o=this._multiEdgeEditor.edges;try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id});await Xt(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,Bt.value={type:"none",ids:[]}}_renderDevicePreview(){return"device"!==Wt.value||this._pendingDevice?null:q`
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
    `}}t([pt({attribute:!1})],Xe.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,o,i)=>((t,e,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,o),o))(e,o,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Xe.prototype,"_svg",void 0),t([gt()],Xe.prototype,"_viewBox",void 0),t([gt()],Xe.prototype,"_isPanning",void 0),t([gt()],Xe.prototype,"_panStart",void 0),t([gt()],Xe.prototype,"_cursorPos",void 0),t([gt()],Xe.prototype,"_wallStartPoint",void 0),t([gt()],Xe.prototype,"_roomEditor",void 0),t([gt()],Xe.prototype,"_haAreas",void 0),t([gt()],Xe.prototype,"_hoveredNode",void 0),t([gt()],Xe.prototype,"_draggingNode",void 0),t([gt()],Xe.prototype,"_nodeEditor",void 0),t([gt()],Xe.prototype,"_edgeEditor",void 0),t([gt()],Xe.prototype,"_multiEdgeEditor",void 0),t([gt()],Xe.prototype,"_editingTotalLength",void 0),t([gt()],Xe.prototype,"_editingLength",void 0),t([gt()],Xe.prototype,"_editingLengthLocked",void 0),t([gt()],Xe.prototype,"_editingDirection",void 0),t([gt()],Xe.prototype,"_editingOpeningParts",void 0),t([gt()],Xe.prototype,"_editingOpeningType",void 0),t([gt()],Xe.prototype,"_editingSwingDirection",void 0),t([gt()],Xe.prototype,"_editingEntityId",void 0),t([gt()],Xe.prototype,"_openingSensorSearch",void 0),t([gt()],Xe.prototype,"_openingSensorPickerOpen",void 0),t([gt()],Xe.prototype,"_blinkingEdgeIds",void 0),t([gt()],Xe.prototype,"_focusedRoomId",void 0),t([gt()],Xe.prototype,"_pendingDevice",void 0),t([gt()],Xe.prototype,"_entitySearch",void 0),t([gt()],Xe.prototype,"_openingPreview",void 0),t([gt()],Xe.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",Xe);const Ge=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"}],Je=[{id:"device",icon:"mdi:devices",label:"Device"}];class Qe extends lt{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._canvasMode="walls",this._renamingFloorId=null,this._renameValue="",this._cleanupEffects=[],this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
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

    .floor-option .rename-btn {
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

    .floor-option .rename-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .rename-btn {
      display: flex;
    }

    .floor-option .rename-btn:hover {
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
    }

    .floor-option .rename-input {
      flex: 1;
      min-width: 0;
      padding: 4px 8px;
      border: 1px solid var(--primary-color);
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      outline: none;
    }

    .floor-option.add-floor,
    .floor-option.action-item {
      color: var(--secondary-text-color);
    }

    .floor-option.add-floor:hover,
    .floor-option.action-item:hover {
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
  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){Wt.value=t,this._addMenuOpen=!1}_handleUndo(){je()}_handleRedo(){He()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,o){t.stopPropagation(),confirm(`Delete "${o}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_startRename(t,e,o){t.stopPropagation(),this._renamingFloorId=e,this._renameValue=o,this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".rename-input");t&&(t.focus(),t.select())})}_commitRename(){const t=this._renamingFloorId,e=this._renameValue.trim();this._renamingFloorId=null,t&&e&&this.dispatchEvent(new CustomEvent("rename-floor",{detail:{id:t,name:e},bubbles:!0,composed:!0}))}_cancelRename(){this._renamingFloorId=null}_handleRenameKeyDown(t){"Enter"===t.key?this._commitRename():"Escape"===t.key&&this._cancelRename()}_openImportExport(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("open-import-export",{bubbles:!0,composed:!0}))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick),this._cleanupEffects.push(Nt(()=>{this._canvasMode=Ft.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}render(){const t=Rt.value,e=zt.value,o=Wt.value,i=this._canvasMode,n=t?.floors||[],s="walls"===i?Ge:"placement"===i?Je:[];return H`
      <!-- Floor Selector -->
      ${n.length>0?H`
        <div class="floor-selector">
          <button
            class="floor-trigger ${this._floorMenuOpen?"open":""}"
            @click=${this._toggleFloorMenu}
          >
            ${e?.name||"Select floor"}
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          ${this._floorMenuOpen?H`
            <div class="floor-dropdown">
              ${n.map(t=>this._renamingFloorId===t.id?H`
                    <div class="floor-option">
                      <ha-icon icon="mdi:layers"></ha-icon>
                      <input
                        class="rename-input"
                        .value=${this._renameValue}
                        @input=${t=>{this._renameValue=t.target.value}}
                        @keydown=${this._handleRenameKeyDown}
                        @blur=${this._commitRename}
                        @click=${t=>t.stopPropagation()}
                      />
                    </div>
                  `:H`
                    <button
                      class="floor-option ${t.id===e?.id?"selected":""}"
                      @click=${()=>this._selectFloor(t.id)}
                    >
                      <ha-icon icon="mdi:layers"></ha-icon>
                      ${t.name}
                      <span class="rename-btn"
                            @click=${e=>this._startRename(e,t.id,t.name)}
                            title="Rename floor">
                        <ha-icon icon="mdi:pencil-outline"></ha-icon>
                      </span>
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
              <button class="floor-option action-item" @click=${this._openImportExport}>
                <ha-icon icon="mdi:swap-horizontal"></ha-icon>
                Import / Export
              </button>
            </div>
          `:null}
        </div>
      `:H`
        <button class="floor-trigger" @click=${this._handleAddFloor}>
          <ha-icon icon="mdi:plus" style="--mdc-icon-size: 16px;"></ha-icon>
          Add floor
        </button>
      `}

      <div class="spacer"></div>

      <!-- Mode Switcher -->
      <div class="mode-group">
        <button
          class="mode-button ${"walls"===i?"active":""}"
          @click=${()=>Zt("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===i?"active":""}"
          @click=${()=>Zt("placement")}
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
          ?disabled=${!Be.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!Te.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Add Menu -->
      ${s.length>0?H`
        <div class="add-button-container">
          <button
            class="add-button ${this._addMenuOpen?"menu-open":""}"
            @click=${this._toggleAddMenu}
            title="Add element"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
          ${this._addMenuOpen?H`
                <div class="add-menu">
                  ${s.map(t=>H`
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
    `}}t([pt({attribute:!1})],Qe.prototype,"hass",void 0),t([pt({attribute:!1})],Qe.prototype,"floorPlans",void 0),t([gt()],Qe.prototype,"_addMenuOpen",void 0),t([gt()],Qe.prototype,"_floorMenuOpen",void 0),t([gt()],Qe.prototype,"_canvasMode",void 0),t([gt()],Qe.prototype,"_renamingFloorId",void 0),t([gt()],Qe.prototype,"_renameValue",void 0),customElements.get("fpb-toolbar")||customElements.define("fpb-toolbar",Qe);class to extends lt{constructor(){super(...arguments),this.open=!1,this._mode="export",this._exportSelection=new Set,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1,this._error=null}static{this.styles=r`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 420px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color, #999);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }

    .close-btn:hover {
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--primary-text-color);
    }

    .close-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      margin: 0 20px 16px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 12px;
      padding: 3px;
      gap: 2px;
    }

    .mode-toggle button {
      flex: 1;
      padding: 9px 0;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color, #888);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    }

    .mode-toggle button:first-child {
      border-right: none;
    }

    .mode-toggle button.active {
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .mode-toggle button:not(.active):hover {
      color: var(--primary-text-color);
    }

    /* Content */
    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px;
    }

    .floor-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .floor-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 10px;
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
      transition: background 0.12s;
    }

    .floor-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .floor-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
      flex-shrink: 0;
    }

    .floor-item-info {
      flex: 1;
      min-width: 0;
    }

    .floor-item-name {
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .floor-item-meta {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
      margin-top: 3px;
    }

    .select-all {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--secondary-text-color, #888);
      cursor: pointer;
      user-select: none;
      border-radius: 10px;
      transition: background 0.12s;
    }

    .select-all:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .select-all input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    /* File picker */
    .file-drop {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px 16px;
      border: 2px dashed var(--divider-color, #e0e0e0);
      border-radius: 14px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }

    .file-drop:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.04);
    }

    .file-drop ha-icon {
      --mdc-icon-size: 36px;
      color: var(--secondary-text-color, #999);
    }

    .file-drop span {
      font-size: 14px;
      color: var(--secondary-text-color, #888);
    }

    /* Error */
    .error-msg {
      padding: 10px 14px;
      margin-bottom: 8px;
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.08);
      color: var(--error-color, #f44336);
      border-radius: 10px;
      font-size: 13px;
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .dialog-footer button {
      padding: 10px 22px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }

    .dialog-footer button:active:not(:disabled) {
      transform: scale(0.97);
    }

    .dialog-footer button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: transparent;
      color: var(--primary-text-color);
    }

    .btn-cancel:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .empty-msg {
      text-align: center;
      color: var(--secondary-text-color, #999);
      padding: 32px 0;
      font-size: 14px;
    }
  `}show(t){this._mode=t||"export",this._error=null,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1;const e=Rt.value;e&&(this._exportSelection=new Set(e.floors.map(t=>t.id))),this.open=!0}close(){this.open=!1}_setMode(t){this._mode=t,this._error=null}_toggleExportFloor(t){const e=new Set(this._exportSelection);e.has(t)?e.delete(t):e.add(t),this._exportSelection=e}_toggleExportAll(){const t=Rt.value;t&&(this._exportSelection.size===t.floors.length?this._exportSelection=new Set:this._exportSelection=new Set(t.floors.map(t=>t.id)))}async _doExport(){if(!this.hass)return;const t=Rt.value;if(t&&0!==this._exportSelection.size){this._exporting=!0,this._error=null;try{const e=[];for(const o of this._exportSelection){const i=await this.hass.callWS({type:"inhabit/floors/export",floor_plan_id:t.id,floor_id:o});e.push(i)}const o=1===e.length?e[0]:{inhabit_version:"1.0",export_type:"floors",exported_at:(new Date).toISOString(),floors:e},i=JSON.stringify(o,null,2),n=new Blob([i],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s;const a=t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),l=1===e.length?(e[0].floor?.name||"floor").toLowerCase().replace(/[^a-z0-9]+/g,"-"):"floors";r.download=`inhabit-${a}-${l}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s),this.close()}catch(t){console.error("Export error:",t),this._error=`Export failed: ${t?.message||t}`}finally{this._exporting=!1}}}_pickFile(){const t=document.createElement("input");t.type="file",t.accept=".json",t.style.display="none",document.body.appendChild(t),t.addEventListener("change",async()=>{const e=t.files?.[0];if(document.body.removeChild(t),e)try{const t=await e.text(),o=JSON.parse(t);this._parseImportFile(o)}catch{this._error="Could not read file. Make sure it's a valid Inhabit JSON export."}}),t.click()}_parseImportFile(t){if(this._error=null,!t||"object"!=typeof t)return void(this._error="Invalid file format.");const e=t;if("floors"===e.export_type&&Array.isArray(e.floors)){const t=e.floors;return this._importData=t,void(this._importEntries=t.map((t,e)=>{const o=t.floor,i=t.devices;return{index:e,name:o?.name||`Floor ${e+1}`,level:o?.level??e,roomCount:Array.isArray(o?.rooms)?o.rooms.length:0,wallCount:Array.isArray(o?.edges)?o.edges.length:Array.isArray(o?.walls)?o.walls.length:0,deviceCount:Array.isArray(i)?i.length:0,selected:!0}}))}if("floor"===e.export_type){this._importData=[e];const t=e.floor,o=e.devices;return void(this._importEntries=[{index:0,name:t?.name||"Imported Floor",level:t?.level??0,roomCount:Array.isArray(t?.rooms)?t.rooms.length:0,wallCount:Array.isArray(t?.edges)?t.edges.length:Array.isArray(t?.walls)?t.walls.length:0,deviceCount:Array.isArray(o)?o.length:0,selected:!0}])}this._error="Invalid file: not an Inhabit floor export."}_toggleImportFloor(t){this._importEntries=this._importEntries.map(e=>e.index===t?{...e,selected:!e.selected}:e)}_toggleImportAll(){const t=this._importEntries.every(t=>t.selected);this._importEntries=this._importEntries.map(e=>({...e,selected:!t}))}async _doImport(){if(!this.hass)return;const t=Rt.value;if(!t)return;const e=this._importEntries.filter(t=>t.selected);if(0!==e.length){this._importing=!0,this._error=null;try{let o=null;const i=[];for(const n of e){const e=this._importData[n.index],s=await this.hass.callWS({type:"inhabit/floors/import",floor_plan_id:t.id,data:e});i.push(s),o=s}const n={...t,floors:[...t.floors,...i]};this.dispatchEvent(new CustomEvent("floors-imported",{detail:{floorPlan:n,switchTo:o},bubbles:!0,composed:!0})),this.close()}catch(t){console.error("Import error:",t),this._error=`Import failed: ${t?.message||t}`}finally{this._importing=!1}}}_onOverlayClick(t){t.target.classList.contains("overlay")&&this.close()}render(){if(!this.open)return K;const t=Rt.value,e=t?.floors||[];return H`
      <div class="overlay" @click=${this._onOverlayClick}>
        <div class="dialog">
          <div class="dialog-header">
            <h2>Import / Export</h2>
            <button class="close-btn" @click=${this.close} title="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="mode-toggle">
            <button
              class=${"export"===this._mode?"active":""}
              @click=${()=>this._setMode("export")}
            >
              Export
            </button>
            <button
              class=${"import"===this._mode?"active":""}
              @click=${()=>this._setMode("import")}
            >
              Import
            </button>
          </div>

          ${this._error?H`<div class="error-msg" style="margin: 0 16px 8px;">${this._error}</div>`:K}

          <div class="dialog-content">
            ${"export"===this._mode?this._renderExport(e):this._renderImport()}
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" @click=${this.close}>Cancel</button>
            ${"export"===this._mode?H`
                  <button
                    class="btn-primary"
                    ?disabled=${0===this._exportSelection.size||this._exporting}
                    @click=${this._doExport}
                  >
                    ${this._exporting?"Exporting…":"Export"}
                  </button>
                `:H`
                  <button
                    class="btn-primary"
                    ?disabled=${0===this._importEntries.filter(t=>t.selected).length||this._importing}
                    @click=${this._doImport}
                    style=${0===this._importEntries.length?"display:none":""}
                  >
                    ${this._importing?"Importing…":"Import"}
                  </button>
                `}
          </div>
        </div>
      </div>
    `}_renderExport(t){if(0===t.length)return H`<div class="empty-msg">No floors to export.</div>`;const e=this._exportSelection.size===t.length;return H`
      <label class="select-all" @click=${this._toggleExportAll}>
        <input
          type="checkbox"
          .checked=${e}
          @click=${t=>t.stopPropagation()}
          @change=${this._toggleExportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${t.map(t=>H`
            <label class="floor-item" @click=${()=>this._toggleExportFloor(t.id)}>
              <input
                type="checkbox"
                .checked=${this._exportSelection.has(t.id)}
                @click=${t=>t.stopPropagation()}
                @change=${()=>this._toggleExportFloor(t.id)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${t.name}</div>
                <div class="floor-item-meta">
                  ${t.rooms.length} room${1!==t.rooms.length?"s":""},
                  ${t.edges.length} edge${1!==t.edges.length?"s":""}
                </div>
              </div>
            </label>
          `)}
      </div>
    `}_renderImport(){if(0===this._importEntries.length)return H`
        <div class="file-drop" @click=${this._pickFile}>
          <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          <span>Choose an Inhabit JSON file</span>
        </div>
      `;const t=this._importEntries.every(t=>t.selected);return H`
      <label class="select-all" @click=${this._toggleImportAll}>
        <input
          type="checkbox"
          .checked=${t}
          @click=${t=>t.stopPropagation()}
          @change=${this._toggleImportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${this._importEntries.map(t=>H`
            <label class="floor-item" @click=${()=>this._toggleImportFloor(t.index)}>
              <input
                type="checkbox"
                .checked=${t.selected}
                @click=${t=>t.stopPropagation()}
                @change=${()=>this._toggleImportFloor(t.index)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${t.name}</div>
                <div class="floor-item-meta">
                  ${t.roomCount} room${1!==t.roomCount?"s":""},
                  ${t.wallCount} wall${1!==t.wallCount?"s":""}${t.deviceCount>0?`, ${t.deviceCount} device${1!==t.deviceCount?"s":""}`:""}
                </div>
              </div>
            </label>
          `)}
      </div>
    `}}t([pt({attribute:!1})],to.prototype,"hass",void 0),t([pt({type:Boolean,reflect:!0})],to.prototype,"open",void 0),t([gt()],to.prototype,"_mode",void 0),t([gt()],to.prototype,"_exportSelection",void 0),t([gt()],to.prototype,"_importEntries",void 0),t([gt()],to.prototype,"_importData",void 0),t([gt()],to.prototype,"_importing",void 0),t([gt()],to.prototype,"_exporting",void 0),t([gt()],to.prototype,"_error",void 0),customElements.get("fpb-import-export-dialog")||customElements.define("fpb-import-export-dialog",to);class eo extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1,this._haAreas=[],this._focusedRoomId=null,this._cleanupEffects=[]}static{this.styles=r`
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

    .room-chips-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .room-chips-bar::-webkit-scrollbar {
      display: none;
    }

    .room-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 18px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }

    .room-chip:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .room-chip.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color, #03a9f4);
    }
  `}connectedCallback(){var t;super.connectedCallback(),Rt.value=null,zt.value=null,Ft.value="walls",Wt.value="select",Bt.value={type:"none",ids:[]},Tt.value={x:0,y:0,width:1e3,height:800},Ut.value=10,jt.value=!0,Ht.value=!0,qt.value=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}],Vt.value=[],Kt.value=new Map,Yt.value=null,Ot._reloadFloorData=null,Ft.value="walls",qe(),t=()=>this._reloadCurrentFloor(),Ot._reloadFloorData=t,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(Nt(()=>{this._focusedRoomId=Yt.value}),Nt(()=>{zt.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}async _reloadCurrentFloor(){if(!this.hass)return;const t=Rt.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const o=e.find(e=>e.id===t.id);if(o){Rt.value=o;const t=zt.value?.id;if(t){const e=o.floors.find(e=>e.id===t);e?zt.value=e:o.floors.length>0&&(zt.value=o.floors[0])}else o.floors.length>0&&(zt.value=o.floors[0]);await this._loadDevicePlacements(o.id)}}catch(t){console.error("Error reloading floor data:",t)}}_detectFloorConflicts(t){const e=new Map;for(const o of t.floors){const t=Ae(o.nodes,o.edges);t.length>0&&(e.set(o.id,t),console.warn(`[inhabit] Detected ${t.length} constraint conflict(s) on floor "${o.id}":`,t.map(t=>`${t.edgeId} (${t.type})`)))}Kt.value=e}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Rt.value=t[0],t[0].floors.length>0&&(zt.value=t[0].floors[0],Ut.value=t[0].grid_size),this._detectFloorConflicts(t[0]),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});Vt.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let o=0;o<t;o++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${o+1}`,level:o});e.floors.push(t)}this._floorPlans=[e],Rt.value=e,zt.value=e.floors[0],Ut.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t}`)}}async _addFloor(){if(!this.hass)return;const t=Rt.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const o=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),i={...t,floors:[...t.floors,o]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?i:e),Rt.value=i,zt.value=o}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=Rt.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const o=e.floors.filter(e=>e.id!==t),i={...e,floors:o};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?i:t),Rt.value=i,zt.value?.id===t&&(qe(),zt.value=o.length>0?o[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t}`)}}async _renameFloor(t,e){if(!this.hass)return;const o=Rt.value;if(o)try{await this.hass.callWS({type:"inhabit/floors/update",floor_plan_id:o.id,floor_id:t,name:e});const i=o.floors.map(o=>o.id===t?{...o,name:e}:o),n={...o,floors:i};this._floorPlans=this._floorPlans.map(t=>t.id===o.id?n:t),Rt.value=n,zt.value?.id===t&&(zt.value={...zt.value,name:e})}catch(t){console.error("Error renaming floor:",t)}}_openImportExport(){const t=this.shadowRoot?.querySelector("fpb-import-export-dialog");t?.show()}async _handleFloorsImported(t){const{floorPlan:e,switchTo:o}=t.detail;this._floorPlans=this._floorPlans.map(t=>t.id===e.id?e:t),Rt.value=e,o&&(qe(),zt.value=o),await this._loadDevicePlacements(e.id)}_handleFloorSelect(t){const e=Rt.value;if(e){const o=e.floors.find(e=>e.id===t);o&&(zt.value?.id!==o.id&&(qe(),Yt.value=null),zt.value=o)}}_handleRoomChipClick(t){Yt.value===t?Yt.value=null:Yt.value=t}_renderRoomChips(){const t=zt.value;return t&&0!==t.rooms.length?H`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${t.rooms.map(t=>{const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id):null,o=e?.icon||"mdi:floor-plan",i=e?.name??t.name;return H`
            <button
              class="room-chip ${this._focusedRoomId===t.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(t.id)}
            >
              <ha-icon icon=${o} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${i}</span>
            </button>
          `})}
      </div>
    `:null}render(){return this._loading?H`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plans...</p>
        </div>
      `:this._error?H`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?H`
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
      `:H`
      <div class="container">
        <div class="main-area">
          <fpb-toolbar
            .hass=${this.hass}
            .floorPlans=${this._floorPlans}
            @floor-select=${t=>this._handleFloorSelect(t.detail.id)}
            @add-floor=${this._addFloor}
            @delete-floor=${t=>this._deleteFloor(t.detail.id)}
            @rename-floor=${t=>this._renameFloor(t.detail.id,t.detail.name)}
            @open-import-export=${this._openImportExport}
          ></fpb-toolbar>

          ${this._renderRoomChips()}

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>
      </div>
      <fpb-import-export-dialog
        .hass=${this.hass}
        @floors-imported=${this._handleFloorsImported}
      ></fpb-import-export-dialog>
    `}}t([pt({attribute:!1})],eo.prototype,"hass",void 0),t([pt({type:Boolean})],eo.prototype,"narrow",void 0),t([gt()],eo.prototype,"_floorPlans",void 0),t([gt()],eo.prototype,"_loading",void 0),t([gt()],eo.prototype,"_error",void 0),t([gt()],eo.prototype,"_floorCount",void 0),t([gt()],eo.prototype,"_haAreas",void 0),t([gt()],eo.prototype,"_focusedRoomId",void 0),customElements.define("ha-floorplan-builder",eo);export{eo as HaFloorplanBuilder};
