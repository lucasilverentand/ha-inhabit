function t(t,e,i,o){var n,r=arguments.length,s=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,i,s):n(e,i))||s);return r>3&&s&&Object.defineProperty(e,i,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const s=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new r(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,g=f.trustedTypes,v=g?g.emptyScript:"",y=f.reactiveElementPolyfillSupport,_=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),m={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const r=o?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??m}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=o;const r=n.fromAttribute(e,t.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const r=this.constructor;if(!1===o&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??x)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[_("elementProperties")]=new Map,b[_("finalized")]=new Map,y?.({ReactiveElement:b}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,E=t=>t,k=$.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+A,C=`<${M}>`,D=document,W=()=>D.createComment(""),I=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,O="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,B=/>/g,R=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,F=/"/g,T=/^(?:script|style|textarea|title)$/i,N=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),j=N(1),q=N(2),Y=Symbol.for("lit-noChange"),X=Symbol.for("lit-nothing"),V=new WeakMap,Z=D.createTreeWalker(D,129);function K(t,e){if(!L(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}class J{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,r=0;const s=t.length-1,a=this.parts,[l,d]=((t,e)=>{const i=t.length-1,o=[];let n,r=2===e?"<svg>":3===e?"<math>":"",s=U;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(s.lastIndex=c,l=s.exec(i),null!==l);)c=s.lastIndex,s===U?"!--"===l[1]?s=z:void 0!==l[1]?s=B:void 0!==l[2]?(T.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=R):void 0!==l[3]&&(s=R):s===R?">"===l[0]?(s=n??U,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?R:'"'===l[3]?F:H):s===F||s===H?s=R:s===z||s===B?s=U:(s=R,n=void 0);const h=s===R&&t[e+1].startsWith("/>")?" ":"";r+=s===U?i+C:d>=0?(o.push(a),i.slice(0,d)+P+i.slice(d)+A+h):i+A+(-2===d?e:h)}return[K(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=Z.nextNode())&&a.length<s;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(P)){const e=d[r++],i=o.getAttribute(t).split(A),s=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?it:"?"===s[1]?ot:"@"===s[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(A)&&(a.push({type:6,index:n}),o.removeAttribute(t));if(T.test(o.tagName)){const t=o.textContent.split(A),e=t.length-1;if(e>0){o.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],W()),Z.nextNode(),a.push({type:2,index:++n});o.append(t[e],W())}}}else if(8===o.nodeType)if(o.data===M)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(A,t+1));)a.push({type:7,index:n}),t+=A.length-1}n++}}static createElement(t,e){const i=D.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,o){if(e===Y)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const r=I(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=G(t,n._$AS(t,e.values),n,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??D).importNode(e,!0);Z.currentNode=o;let n=Z.nextNode(),r=0,s=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=i[++s]}r!==a?.index&&(n=Z.nextNode(),r++)}return Z.currentNode=D,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=X,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),I(t)?t===X||null==t||""===t?(this._$AH!==X&&this._$AR(),this._$AH=X):t!==this._$AH&&t!==Y&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>L(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==X&&I(this._$AH)?this._$AA.nextSibling.data=t:this.T(D.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new J(t)),e}k(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(W()),this.O(W()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=E(t).nextSibling;E(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=X,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=X}_$AI(t,e=this,i,o){const n=this.strings;let r=!1;if(void 0===n)t=G(this,t,e,0),r=!I(t)||t!==this._$AH&&t!==Y,r&&(this._$AH=t);else{const o=t;let s,a;for(t=n[0],s=0;s<n.length-1;s++)a=G(this,o[i+s],e,s),a===Y&&(a=this._$AH[s]),r||=!I(a)||a!==this._$AH[s],a===X?t=X:t!==X&&(t+=(a??"")+n[s+1]),this._$AH[s]=a}r&&!o&&this.j(t)}j(t){t===X?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===X?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==X)}}class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??X)===Y)return;const i=this._$AH,o=t===X&&i!==X||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==X&&(i===X||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=$.litHtmlPolyfillSupport;st?.(J,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(W(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:x},pt=(t=ht,e,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,n,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];e.call(this,i),this.requestUpdate(o,n,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ft(t){return ut({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const gt=Symbol.for("preact-signals");function vt(){if(xt>1)return void xt--;let t,e=!1;for(;void 0!==_t;){let i=_t;for(_t=void 0,mt++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&St(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if(mt=0,xt--,e)throw t}let yt,_t;function wt(t){const e=yt;yt=void 0;try{return t()}finally{yt=e}}let xt=0,mt=0,bt=0;function $t(t){if(void 0===yt)return;let e=t.n;return void 0===e||e.t!==yt?(e={i:0,S:t,p:yt.s,n:void 0,t:yt,e:void 0,x:void 0,r:e},void 0!==yt.s&&(yt.s.n=e),yt.s=e,t.n=e,32&yt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=yt.s,e.n=void 0,yt.s.n=e,yt.s=e),e):void 0}function Et(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function kt(t,e){return new Et(t,e)}function St(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Pt(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function At(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function Mt(t,e){Et.call(this,void 0),this.x=t,this.s=void 0,this.g=bt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Ct(t,e){return new Mt(t,e)}function Dt(t){const e=t.u;if(t.u=void 0,"function"==typeof e){xt++;const i=yt;yt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Wt(t),e}finally{yt=i,vt()}}}function Wt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Dt(t)}function It(t){if(yt!==this)throw new Error("Out-of-order effect");At(this),yt=t,this.f&=-2,8&this.f&&Wt(this),vt()}function Lt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Ot(t,e){const i=new Lt(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}function Ut(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function zt(t){const e=new Map,i=new Map;for(const o of t){i.set(o.id,o);const t=Bt(o.start),n=Bt(o.end);e.has(t)||e.set(t,[]),e.get(t).push({wallId:o.id,endpoint:"start"}),e.has(n)||e.set(n,[]),e.get(n).push({wallId:o.id,endpoint:"end"})}return{endpoints:e,walls:i}}function Bt(t){return`${Math.round(t.x)},${Math.round(t.y)}`}function Rt(t){return function(t,e){const i=e.x-t.x,o=e.y-t.y;return Math.sqrt(i*i+o*o)}(t.start,t.end)}function Ht(t,e,i){const o=t.walls.get(e);if(!o)return{updates:[],blocked:!1};if("fixed"===o.constraint)return{updates:[],blocked:!0,blockedBy:o.id};if("length"===o.constraint)return{updates:[],blocked:!0,blockedBy:o.id};if(0===Rt(o))return{updates:[],blocked:!1};const n=(o.start.x+o.end.x)/2,r=(o.start.y+o.end.y)/2,s=function(t){return Math.atan2(t.end.y-t.start.y,t.end.x-t.start.x)}(o),a=i/2,l={x:n-Math.cos(s)*a,y:r-Math.sin(s)*a},d={x:n+Math.cos(s)*a,y:r+Math.sin(s)*a},c=[];c.push({wallId:o.id,newStart:l,newEnd:d});const h=Bt(o.start),p=t.endpoints.get(h)||[];for(const i of p){if(i.wallId===e)continue;const o=t.walls.get(i.wallId);if(!o)continue;if("fixed"===o.constraint)return{updates:[],blocked:!0,blockedBy:o.id};const n=l,r=Ft(o,i.endpoint,n);c.push({wallId:o.id,newStart:"start"===i.endpoint?n:r,newEnd:"end"===i.endpoint?n:r})}const u=Bt(o.end),f=t.endpoints.get(u)||[];for(const i of f){if(i.wallId===e)continue;const o=t.walls.get(i.wallId);if(!o)continue;if(c.some(t=>t.wallId===o.id))continue;if("fixed"===o.constraint)return{updates:[],blocked:!0,blockedBy:o.id};const n=d,r=Ft(o,i.endpoint,n);c.push({wallId:o.id,newStart:"start"===i.endpoint?n:r,newEnd:"end"===i.endpoint?n:r})}return{updates:c,blocked:!1}}function Ft(t,e,i){const o="start"===e?t.end:t.start;if("none"===t.constraint)return o;if("length"===t.constraint){const n=Rt(t),r="start"===e?t.start:t.end,s=o.x-r.x,a=o.y-r.y,l=Math.sqrt(s*s+a*a);return 0===l?o:{x:i.x+s/l*n,y:i.y+a/l*n}}if("angle"===t.constraint){const n="start"===e?t.start:t.end,r=o.x-n.x,s=o.y-n.y;return{x:i.x+r,y:i.y+s}}return"horizontal"===t.constraint?{x:o.x,y:i.y}:"vertical"===t.constraint?{x:i.x,y:o.y}:o}Et.prototype.brand=gt,Et.prototype.h=function(){return!0},Et.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:wt(()=>{var t;null==(t=this.W)||t.call(this)}))},Et.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&wt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},Et.prototype.subscribe=function(t){return Ot(()=>{const e=this.value,i=yt;yt=void 0;try{t(e)}finally{yt=i}},{name:"sub"})},Et.prototype.valueOf=function(){return this.value},Et.prototype.toString=function(){return this.value+""},Et.prototype.toJSON=function(){return this.value},Et.prototype.peek=function(){const t=yt;yt=void 0;try{return this.value}finally{yt=t}},Object.defineProperty(Et.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(mt>100)throw new Error("Cycle detected");this.v=t,this.i++,bt++,xt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{vt()}}}}),Mt.prototype=new Et,Mt.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===bt)return!0;if(this.g=bt,this.f|=1,this.i>0&&!St(this))return this.f&=-2,!0;const t=yt;try{Pt(this),yt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return yt=t,At(this),this.f&=-2,!0},Mt.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}Et.prototype.S.call(this,t)},Mt.prototype.U=function(t){if(void 0!==this.t&&(Et.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},Mt.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(Mt.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Lt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Lt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Dt(this),Pt(this),xt++;const t=yt;return yt=this,It.bind(this,t)},Lt.prototype.N=function(){2&this.f||(this.f|=2,this.o=_t,_t=this)},Lt.prototype.d=function(){this.f|=8,1&this.f||Wt(this)},Lt.prototype.dispose=function(){this.d()};let Tt=class extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._drawingPoints=[],this._wallStartPoint=null,this._haAreas=[],this._hoveredEndpoint=null,this._draggingEndpoint=null,this._wallEditor=null,this._editingLength="",this._pendingDevice=null,this._entitySearch="",this._cleanupEffects=[]}static{this.styles=s`
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

    .wall-constraint-indicator {
      font-size: 10px;
      fill: var(--primary-color, #2196f3);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .wall-constraint-bg {
      fill: var(--card-background-color, white);
      stroke: var(--primary-color, #2196f3);
      stroke-width: 1;
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

    .device-preview {
      pointer-events: none;
    }
  `}connectedCallback(){super.connectedCallback(),this._cleanupEffects.push(Ot(()=>{this._viewBox=Qt.value})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,n=this._viewBox.height*e;if(o<100||o>1e4)return;const r={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:n};Qt.value=r,this._viewBox=r}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=this._getSnappedPoint(e);if(this._pendingDevice&&"device"!==Jt.value&&(this._pendingDevice=null),1===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);const o=Jt.value;if(0===t.button)if("select"===o){const i=!!this._wallEditor;this._wallEditor=null;this._handleSelectClick(e)||(i&&(Gt.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}else"wall"===o?(this._wallEditor=null,this._handleWallClick(i)):"room"===o||"polygon"===o?(this._wallEditor=null,this._handlePolygonClick(i)):"device"===o?(this._wallEditor=null,this._handleDeviceClick(i)):(this._wallEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Jt.value;if(this._cursorPos=this._getSnappedPoint(e,"device"===i),this._draggingEndpoint){const i=t.clientX-this._draggingEndpoint.startX,o=t.clientY-this._draggingEndpoint.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingEndpoint.hasMoved=!0),this._cursorPos=this._getSnappedPointForEndpoint(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};return this._panStart={x:t.clientX,y:t.clientY},Qt.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||this._checkEndpointHover(e)}_checkEndpointHover(t){const e=this._getWallEndpoints();for(const i of e.values()){if(Math.sqrt(Math.pow(t.x-i.coords.x,2)+Math.pow(t.y-i.coords.y,2))<15)return void(this._hoveredEndpoint=i)}this._hoveredEndpoint=null}_handlePointerUp(t){if(this._draggingEndpoint)return this._draggingEndpoint.hasMoved?this._finishEndpointDrag():this._startWallFromEndpoint(),void this._svg?.releasePointerCapture(t.pointerId);this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}_startWallFromEndpoint(){this._draggingEndpoint&&(this._wallStartPoint=this._draggingEndpoint.originalCoords,Jt.value="wall",this._draggingEndpoint=null,this._hoveredEndpoint=null)}async _finishEndpointDrag(){if(!this._draggingEndpoint||!this.hass)return void(this._draggingEndpoint=null);const t=Kt.value,e=Zt.value;if(!t||!e)return void(this._draggingEndpoint=null);const i=this._cursorPos,o=this._draggingEndpoint.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingEndpoint=null);const n=zt(t.walls),r=(this._draggingEndpoint.wallIds.map(t=>t.split(":")[0]),function(t,e,i,o,n){const r=[],s=new Set,a=Bt(o),l=t.endpoints.get(a)||[];for(const e of l){const i=t.walls.get(e.wallId);if(i&&"fixed"===i.constraint)return{updates:[],blocked:!0,blockedBy:i.id}}for(const e of l){if(s.has(e.wallId))continue;s.add(e.wallId);const i=t.walls.get(e.wallId);if(!i)continue;const o=n,a=Ft(i,e.endpoint,o),l="start"===e.endpoint?o:a,d="end"===e.endpoint?o:a;r.push({wallId:i.id,newStart:l,newEnd:d})}return{updates:r,blocked:!1}}(n,0,0,o,i));if(r.blocked)return alert(`Cannot move endpoint: wall "${r.blockedBy}" is locked.`),void(this._draggingEndpoint=null);if(0!==r.updates.length){try{if(r.updates.length>1)await this.hass.callWS({type:"inhabit/walls/batch_update",floor_plan_id:e.id,floor_id:t.id,updates:r.updates.map(t=>({wall_id:t.wallId,start:t.newStart,end:t.newEnd}))});else{const i=r.updates[0];await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:e.id,floor_id:t.id,wall_id:i.wallId,start:i.newStart,end:i.newEnd})}await re()}catch(t){console.error("Error updating wall endpoint:",t),alert(`Failed to update wall: ${t}`)}this._draggingEndpoint=null}else this._draggingEndpoint=null}_handleKeyDown(t){"Escape"===t.key&&(this._wallStartPoint=null,this._drawingPoints=[],this._hoveredEndpoint=null,this._draggingEndpoint=null,this._pendingDevice=null,this._wallEditor=null,Gt.value={type:"none",ids:[]},Jt.value="select")}_handleEditorSave(){if(!this._wallEditor)return;const t=parseFloat(this._editingLength);isNaN(t)||t<=0||(this._updateWallLength(this._wallEditor.wall,t),this._wallEditor=null)}_handleEditorCancel(){this._wallEditor=null,Gt.value={type:"none",ids:[]}}async _handleWallDelete(){if(!this._wallEditor||!this.hass)return;const t=Kt.value,e=Zt.value;if(t&&e){try{await this.hass.callWS({type:"inhabit/walls/delete",floor_plan_id:e.id,floor_id:t.id,wall_id:this._wallEditor.wall.id}),await re()}catch(t){console.error("Error deleting wall:",t)}this._wallEditor=null,Gt.value={type:"none",ids:[]}}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _updateWallLength(t,e){if(!this.hass)return;const i=Kt.value,o=Zt.value;if(!i||!o)return;const n=Ht(zt(i.walls),t.id,e);if(n.blocked)alert(`Cannot change length: wall "${n.blockedBy}" has a constraint that blocks this change.`);else if(0!==n.updates.length){try{if(n.updates.length>1)await this.hass.callWS({type:"inhabit/walls/batch_update",floor_plan_id:o.id,floor_id:i.id,updates:n.updates.map(t=>({wall_id:t.wallId,start:t.newStart,end:t.newEnd}))});else{const t=n.updates[0];await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:o.id,floor_id:i.id,wall_id:t.wallId,start:t.newStart,end:t.newEnd})}await re()}catch(t){console.error("Error updating wall:",t),alert(`Failed to update wall: ${t}`)}Gt.value={type:"none",ids:[]}}}_getSnappedPointForEndpoint(t){const e=Kt.value;if(e){const i=15;for(const o of e.walls)for(const e of[o.start,o.end]){if(Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))<i)return e}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const i=Kt.value;if(!i)return ee.value?Ut(t,te.value):t;for(const e of i.walls)for(const i of[e.start,e.end]){if(Math.sqrt(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2))<15)return i}if(e){let e=null,o=15;for(const n of i.walls){const i=this._getClosestPointOnSegment(t,n.start,n.end),r=Math.sqrt(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2));r<o&&(o=r,e=i)}if(e)return e}return ee.value?Ut(t,te.value):t}_getClosestPointOnSegment(t,e,i){const o=i.x-e.x,n=i.y-e.y,r=o*o+n*n;if(0===r)return e;const s=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/r));return{x:e.x+s*o,y:e.y+s*n}}_handleSelectClick(t){const e=Kt.value;if(!e)return!1;for(const i of e.walls){if(this._pointToSegmentDistance(t,i.start,i.end)<i.thickness/2+5){Gt.value={type:"wall",ids:[i.id]};const t=this._calculateWallLength(i.start,i.end),e={x:(i.start.x+i.end.x)/2,y:(i.start.y+i.end.y)/2};return this._wallEditor={wall:i,position:e,length:t},this._editingLength=Math.round(t).toString(),this._centerWallInView(i),!0}}const i=oe.value.filter(t=>t.floor_id===e.id);for(const e of i){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return Gt.value={type:"device",ids:[e.id]},!0}for(const i of e.rooms)if(this._pointInPolygon(t,i.polygon.vertices))return Gt.value={type:"room",ids:[i.id]},!0;return Gt.value={type:"none",ids:[]},!1}_pointToSegmentDistance(t,e,i){const o=i.x-e.x,n=i.y-e.y,r=o*o+n*n;if(0===r)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const s=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/r)),a=e.x+s*o,l=e.y+s*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t){this._wallStartPoint?(this._completeWall(this._wallStartPoint,t),this._checkForClosedShape(t),this._wallStartPoint=t):this._wallStartPoint=t}_handlePolygonClick(t){if(this._drawingPoints.length>=3){const e=this._drawingPoints[0];if(Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))<15)return void this._completePolygon()}this._drawingPoints=[...this._drawingPoints,t]}async _completeWall(t,e){if(!this.hass)return;const i=Kt.value,o=Zt.value;if(i&&o)try{await this.hass.callWS({type:"inhabit/walls/add",floor_plan_id:o.id,floor_id:i.id,start:t,end:e,thickness:8}),await re()}catch(t){console.error("Error creating wall:",t)}}_checkForClosedShape(t){const e=Kt.value;if(!e||e.walls.length<2)return;const i=this._findClosedPolygon(e.walls,t);i&&i.length>=3&&this._promptCreateRoom(i)}_findClosedPolygon(t,e){const i=new Set,o=[e],n=(e,r,s)=>{if(s>20)return!1;const a=`${e.x},${e.y}`;if(i.has(a))return!1;if(i.add(a),o.length>=3){if(Math.sqrt(Math.pow(e.x-r.x,2)+Math.pow(e.y-r.y,2))<5)return!0}for(const i of t){let t=null;if(Math.abs(i.start.x-e.x)<5&&Math.abs(i.start.y-e.y)<5?t=i.end:Math.abs(i.end.x-e.x)<5&&Math.abs(i.end.y-e.y)<5&&(t=i.start),t){if(o.push(t),n(t,r,s+1))return!0;o.pop()}}return!1};for(const e of t)if(i.clear(),o.length=0,o.push(e.start),n(e.start,e.start,0))return[...o];return null}async _promptCreateRoom(t){if(!this.hass)return;const e=Kt.value,i=Zt.value;if(!e||!i)return;const o=prompt("Closed shape detected! Enter room name (or cancel to skip):");if(!o)return;let n=null;if(this._haAreas.length>0){const t=this._haAreas.map(t=>t.name).join(", "),e=prompt(`Link to Home Assistant area? (${t}) or leave empty:`);if(e){const t=this._haAreas.find(t=>t.name.toLowerCase()===e.toLowerCase());t&&(n=t.area_id)}}try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:i.id,floor_id:e.id,name:o,polygon:{vertices:t},color:this._getRandomRoomColor(),ha_area_id:n}),await re()}catch(t){console.error("Error creating room:",t),alert(`Failed to create room: ${t}`)}}async _completePolygon(){if(!this.hass||this._drawingPoints.length<3)return;const t=Kt.value,e=Zt.value;if(!t||!e)return;const i=prompt("Enter room name:");if(!i)return void(this._drawingPoints=[]);let o=null;if(this._haAreas.length>0){const t=this._haAreas.map(t=>t.name).join(", "),e=prompt(`Link to Home Assistant area? (${t}) or leave empty:`);if(e){const t=this._haAreas.find(t=>t.name.toLowerCase()===e.toLowerCase());t&&(o=t.area_id)}}try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:i,polygon:{vertices:this._drawingPoints},color:this._getRandomRoomColor(),ha_area_id:o}),this._drawingPoints=[],await re()}catch(t){console.error("Error creating room:",t),alert(`Failed to create room: ${t}`)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getBoundingClientRect(),i=this._viewBox.width/e.width,o=this._viewBox.height/e.height;return{x:this._viewBox.x+(t.x-e.left)*i,y:this._viewBox.y+(t.y-e.top)*o}}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let n=0,r=o-1;n<o;r=n++){const o=e[n],s=e[r];o.y>t.y!=s.y>t.y&&t.x<(s.x-o.x)*(t.y-o.y)/(s.y-o.y)+o.x&&(i=!i)}return i}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}_renderWallChains(t,e){let i=t;if(this._draggingEndpoint){const e=this._cursorPos;i=t.map(t=>{const i=t.id+":start",o=t.id+":end";return this._draggingEndpoint.wallIds.includes(i)?{...t,start:e}:this._draggingEndpoint.wallIds.includes(o)?{...t,end:e}:t})}const o=function(t){if(0===t.length)return[];const e=new Set,i=[],o=(t,e)=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1;for(const n of t){if(e.has(n.id))continue;const r=[n];e.add(n.id);let s=n.end,a=!0;for(;a;){a=!1;for(const i of t)if(!e.has(i.id)){if(o(i.start,s)){r.push(i),e.add(i.id),s=i.end,a=!0;break}if(o(i.end,s)){r.push({...i,start:i.end,end:i.start}),e.add(i.id),s=i.start,a=!0;break}}}let l=n.start;for(a=!0;a;){a=!1;for(const i of t)if(!e.has(i.id)){if(o(i.end,l)){r.unshift(i),e.add(i.id),l=i.start,a=!0;break}if(o(i.start,l)){r.unshift({...i,start:i.end,end:i.start}),e.add(i.id),l=i.end,a=!0;break}}}i.push(r)}return i}(i),n="wall"===e.type&&e.ids.length>0?i.find(t=>t.id===e.ids[0]):null;return q`
      <!-- Base walls rendered as chains for proper corners -->
      ${o.map((t,e)=>q`
        <path class="wall"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,i=[t[0].start];for(const e of t)i.push(e.end);const o=i.length>2&&Math.abs(i[0].x-i[i.length-1].x)<1&&Math.abs(i[0].y-i[i.length-1].y)<1,n=[],r=[];for(let t=0;t<i.length;t++){const s=i[t];let a,l=null,d=null;if(t>0||o){const e=i[t>0?t-1:i.length-2],o=s.x-e.x,n=s.y-e.y,r=Math.sqrt(o*o+n*n);r>0&&(l={x:o/r,y:n/r})}if(t<i.length-1||o){const e=i[t<i.length-1?t+1:1],o=e.x-s.x,n=e.y-s.y,r=Math.sqrt(o*o+n*n);r>0&&(d={x:o/r,y:n/r})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},i=t.x+e.x,o=t.y+e.y,n=Math.sqrt(i*i+o*o);if(n<.01)a=t;else{a={x:i/n,y:o/n};const e=t.x*a.x+t.y*a.y;if(Math.abs(e)>.1){const t=1/e,i=Math.min(Math.abs(t),3)*Math.sign(t);a={x:a.x*i,y:a.y*i}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:s.x+a.x*e,y:s.y+a.y*e}),r.push({x:s.x-a.x*e,y:s.y-a.y*e})}let s=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)s+=` L${n[t].x},${n[t].y}`;if(o){s+=` L${r[r.length-1].x},${r[r.length-1].y}`;for(let t=r.length-2;t>=0;t--)s+=` L${r[t].x},${r[t].y}`}else for(let t=r.length-1;t>=0;t--)s+=` L${r[t].x},${r[t].y}`;return s+=" Z",s}(t)}"
              data-chain-idx="${e}"/>
      `)}

      <!-- Individual selected wall highlight -->
      ${n?q`
        <path class="wall-selected-highlight"
              d="${this._singleWallPath(n)}"/>
      `:null}

      <!-- Constraint indicators -->
      ${this._renderWallConstraintIndicators(i)}
    `}_renderWallConstraintIndicators(t){const e=t.filter(t=>t.constraint&&"none"!==t.constraint);return 0===e.length?null:q`
      <g class="constraint-indicators">
        ${e.map(t=>{const e=(t.start.x+t.end.x)/2,i=(t.start.y+t.end.y)/2,o=t.end.x-t.start.x,n=t.end.y-t.start.y,r=Math.sqrt(o*o+n*n);if(0===r)return null;const s=e+-n/r*15,a=i+o/r*15;let l="";return"horizontal"===t.constraint?l="―":"vertical"===t.constraint?l="|":"length"===t.constraint?l="↔":"angle"===t.constraint?l="∠":"fixed"===t.constraint&&(l="🔒"),q`
            <g transform="translate(${s}, ${a})">
              <circle class="wall-constraint-bg" r="8" cx="0" cy="0"/>
              <text class="wall-constraint-indicator" x="0" y="1">${l}</text>
            </g>
          `})}
      </g>
    `}_singleWallPath(t){const{start:e,end:i,thickness:o}=t,n=i.x-e.x,r=i.y-e.y,s=Math.sqrt(n*n+r*r);if(0===s)return"";const a=-r/s*(o/2),l=n/s*(o/2);return`M${e.x+a},${e.y+l}\n            L${i.x+a},${i.y+l}\n            L${i.x-a},${i.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_renderFloor(){const t=Kt.value;if(!t)return null;const e=Gt.value,i=ie.value;return q`
      <!-- Background layer -->
      ${i.find(t=>"background"===t.id)?.visible&&t.background_image?q`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${i.find(t=>"background"===t.id)?.opacity??1}"/>
      `:null}

      <!-- Structure layer -->
      ${i.find(t=>"structure"===t.id)?.visible?q`
        <g class="structure-layer" opacity="${i.find(t=>"structure"===t.id)?.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>q`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""}"
                  d="${function(t){const e=t.vertices;if(0===e.length)return"";const i=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return i.join(" ")+" Z"}(t.polygon)}"
                  fill="${t.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}

          <!-- Walls (rendered as chains for proper corners) -->
          ${this._renderWallChains(t.walls,e)}

          <!-- Doors -->
          ${t.doors.map(e=>{const i=t.walls.find(t=>t.id===e.wall_id);if(!i)return null;const o=e.position,n=i.start.x+(i.end.x-i.start.x)*o,r=i.start.y+(i.end.y-i.start.y)*o;return q`
              <rect class="door" x="${n-e.width/2}" y="${r-5}"
                    width="${e.width}" height="10"/>
            `})}

          <!-- Windows -->
          ${t.windows.map(e=>{const i=t.walls.find(t=>t.id===e.wall_id);if(!i)return null;const o=e.position,n=i.start.x+(i.end.x-i.start.x)*o,r=i.start.y+(i.end.y-i.start.y)*o;return q`
              <rect class="window" x="${n-e.width/2}" y="${r-3}"
                    width="${e.width}" height="6"/>
            `})}
        </g>
      `:null}

      <!-- Labels layer -->
      ${i.find(t=>"labels"===t.id)?.visible?q`
        <g class="labels-layer" opacity="${i.find(t=>"labels"===t.id)?.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);return e?q`
              <text class="room-label" x="${e.x}" y="${e.y}">
                ${t.name}${t.ha_area_id?" 🏠":""}
              </text>
            `:null})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${i.find(t=>"devices"===t.id)?.visible?q`
        <g class="devices-layer" opacity="${i.find(t=>"devices"===t.id)?.opacity??1}">
          ${oe.value.filter(e=>e.floor_id===t.id).map(t=>this._renderDevice(t))}
        </g>
      `:null}
    `}_renderDevice(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=Gt.value;return q`
      <g class="device-marker ${i?"on":"off"} ${"device"===o.type&&o.ids.includes(t.id)?"selected":""}"
         transform="translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})">
        <circle r="12" fill="${i?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${t.show_label?q`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${t.label||e?.attributes.friendly_name||t.entity_id}
          </text>
        `:null}
      </g>
    `}_getWallEndpoints(){const t=Kt.value;if(!t)return new Map;const e=new Map;for(const i of t.walls){const t=`${Math.round(i.start.x)},${Math.round(i.start.y)}`,o=`${Math.round(i.end.x)},${Math.round(i.end.y)}`;e.has(t)||e.set(t,{coords:i.start,wallIds:[]}),e.get(t).wallIds.push(i.id+":start"),e.has(o)||e.set(o,{coords:i.end,wallIds:[]}),e.get(o).wallIds.push(i.id+":end")}return e}_renderWallEndpoints(){const t=Kt.value;if(!t||0===t.walls.length)return null;const e=[];return this._draggingEndpoint?e.push({coords:this._cursorPos,wallIds:this._draggingEndpoint.wallIds,isDragging:!0}):this._hoveredEndpoint&&e.push({coords:this._hoveredEndpoint.coords,wallIds:this._hoveredEndpoint.wallIds,isDragging:!1}),0===e.length?null:q`
      <g class="wall-endpoints-layer">
        ${e.map(t=>q`
          <circle
            class="wall-endpoint ${t.isDragging?"dragging":""}"
            cx="${t.coords.x}"
            cy="${t.coords.y}"
            r="6"
            @pointerdown=${e=>this._handleEndpointPointerDown(e,t)}
          />
        `)}
        ${this._draggingEndpoint?this._renderDraggedWallLengths(t):null}
      </g>
    `}_renderDraggedWallLengths(t){if(!this._draggingEndpoint)return null;const e=this._cursorPos,i=this._draggingEndpoint.originalCoords,o=[];for(const n of this._draggingEndpoint.wallIds){const[r,s]=n.split(":"),a=t.walls.find(t=>t.id===r);if(!a)continue;const l="start"===s?e:a.start,d="end"===s?e:a.end,c=this._calculateWallLength(l,d),h=Math.atan2(d.y-l.y,d.x-l.x),p="start"===s?i:a.start,u="end"===s?i:a.end;o.push({start:l,end:d,origStart:p,origEnd:u,length:c,angle:h,thickness:a.thickness})}const n=[];for(let t=0;t<o.length;t++)for(let i=t+1;i<o.length;i++){const r=Math.abs(o[t].angle-o[i].angle)%Math.PI;Math.abs(r-Math.PI/2)<.02&&n.push({point:e,angle:Math.min(o[t].angle,o[i].angle)})}return q`
      <!-- Original wall positions (ghost) -->
      ${o.map(({origStart:t,origEnd:e,thickness:i})=>{const o=e.x-t.x,n=e.y-t.y,r=Math.sqrt(o*o+n*n);if(0===r)return null;const s=-n/r*(i/2),a=o/r*(i/2);return q`
          <path
            class="wall-original-ghost"
            d="M${t.x+s},${t.y+a}
               L${e.x+s},${e.y+a}
               L${e.x-s},${e.y-a}
               L${t.x-s},${t.y-a}
               Z"
          />
        `})}

      <!-- Wall length labels -->
      ${o.map(({start:t,end:e,length:i})=>{const o=(t.x+e.x)/2,n=(t.y+e.y)/2,r=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return q`
          <g transform="translate(${o}, ${n}) rotate(${r>90||r<-90?r+180:r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${n.map(({point:t,angle:e})=>q`
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
    `}_handleEndpointPointerDown(t,e){t.stopPropagation(),t.preventDefault();const i=this._hoveredEndpoint?.coords||e.coords;this._draggingEndpoint={coords:i,wallIds:e.wallIds,originalCoords:{...i},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_renderDrawingPreview(){const t=Jt.value;if("wall"===t&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,i=this._calculateWallLength(t,e),o=(t.x+e.x)/2,n=(t.y+e.y)/2,r=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),s=r>90||r<-90?r+180:r;return q`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${t.x}" y1="${t.y}"
                x2="${e.x}" y2="${e.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${o}, ${n}) rotate(${s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="4" opacity="0.5"/>
        </g>
      `}if(("room"===t||"polygon"===t)&&this._drawingPoints.length>0){const t=[...this._drawingPoints,this._cursorPos].map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`).join(" ");return q`
        <g class="drawing-preview">
          <path d="${t} Z" fill="rgba(33, 150, 243, 0.2)"
                stroke="var(--primary-color)" stroke-width="2" stroke-dasharray="5,5"/>
          ${this._drawingPoints.map(t=>q`
            <circle cx="${t.x}" cy="${t.y}" r="5" fill="var(--primary-color)" stroke="white" stroke-width="2"/>
          `)}
        </g>
      `}return null}_getPolygonCenter(t){if(0===t.length)return null;let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getBoundingClientRect(),i=e.width/this._viewBox.width,o=e.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*i,y:(t.y-this._viewBox.y)*o}}_centerWallInView(t){if(!this._svg)return;const e=this._svg.getBoundingClientRect(),i=e.width-312,o=e.height,n=(t.start.x+t.end.x)/2,r=(t.start.y+t.end.y)/2,s=this._viewBox.width/e.width,a=this._viewBox.height/e.height,l={...this._viewBox,x:n-i/2*s,y:r-o/2*a};Qt.value=l,this._viewBox=l}_renderWallEditor(){if(!this._wallEditor)return null;const t=this._wallEditor.wall.constraint||"none";return j`
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
            autofocus
          />
          <span class="wall-editor-unit">cm</span>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Lock</span>
          <div class="wall-editor-constraints">
            <button
              class="constraint-btn ${"horizontal"===t?"active":""}"
              @click=${()=>this._toggleConstraint("horizontal")}
              title="Lock horizontal"
            ><span>―</span> H</button>
            <button
              class="constraint-btn ${"vertical"===t?"active":""}"
              @click=${()=>this._toggleConstraint("vertical")}
              title="Lock vertical"
            ><span>|</span> V</button>
            <button
              class="constraint-btn ${"length"===t?"active":""}"
              @click=${()=>this._toggleConstraint("length")}
              title="Lock length"
            ><span>↔</span> Len</button>
            <button
              class="constraint-btn ${"angle"===t?"active":""}"
              @click=${()=>this._toggleConstraint("angle")}
              title="Lock angle"
            ><span>∠</span> Ang</button>
            <button
              class="constraint-btn ${"fixed"===t?"active":""}"
              @click=${()=>this._toggleConstraint("fixed")}
              title="Fully locked"
            >🔒 Fix</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}>Apply</button>
          <button class="delete-btn" @click=${this._handleWallDelete}>Delete</button>
        </div>
      </div>
    `}async _toggleConstraint(t){if(!this._wallEditor||!this.hass)return;const e=Kt.value,i=Zt.value;if(!e||!i)return;const o=this._wallEditor.wall,n=o.constraint===t?"none":t;try{await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:i.id,floor_id:e.id,wall_id:o.id,constraint:n}),await re();const t=Kt.value;if(t){const e=t.walls.find(t=>t.id===o.id);e&&(this._wallEditor={...this._wallEditor,wall:e})}}catch(t){console.error("Error updating wall constraint:",t),alert(`Failed to update wall constraint: ${t}`)}}_getFilteredEntities(){if(!this.hass)return[];const t=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));if(this._entitySearch){const t=this._entitySearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[e]||"mdi:devices"}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=Kt.value,i=Zt.value;if(e&&i){try{await this.hass.callWS({type:"inhabit/devices/add",floor_plan_id:i.id,floor_id:e.id,entity_id:t,position:this._pendingDevice.position,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:t.startsWith("binary_sensor.")||t.startsWith("sensor.")}),await re()}catch(t){console.error("Error placing device:",t),alert(`Failed to place device: ${t}`)}this._pendingDevice=null}}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return j`
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
    `}render(){return j`
      <svg
        class="${this._isPanning?"panning":""} ${"select"===Jt.value?"select-tool":""}"
        viewBox="${t=this._viewBox,`${t.x} ${t.y} ${t.width} ${t.height}`}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderFloor()}
        ${this._renderWallEndpoints()}
        ${this._renderDrawingPreview()}
        ${this._renderDevicePreview()}
      </svg>
      ${this._renderWallEditor()}
      ${this._renderEntityPicker()}
    `;var t}_renderDevicePreview(){return"device"!==Jt.value||this._pendingDevice?null:q`
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
    `}};t([ut({attribute:!1})],Tt.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Tt.prototype,"_svg",void 0),t([ft()],Tt.prototype,"_viewBox",void 0),t([ft()],Tt.prototype,"_isPanning",void 0),t([ft()],Tt.prototype,"_panStart",void 0),t([ft()],Tt.prototype,"_cursorPos",void 0),t([ft()],Tt.prototype,"_drawingPoints",void 0),t([ft()],Tt.prototype,"_wallStartPoint",void 0),t([ft()],Tt.prototype,"_haAreas",void 0),t([ft()],Tt.prototype,"_hoveredEndpoint",void 0),t([ft()],Tt.prototype,"_draggingEndpoint",void 0),t([ft()],Tt.prototype,"_wallEditor",void 0),t([ft()],Tt.prototype,"_editingLength",void 0),t([ft()],Tt.prototype,"_pendingDevice",void 0),t([ft()],Tt.prototype,"_entitySearch",void 0),Tt=t([ct("fpb-canvas")],Tt);const Nt=kt([]),jt=kt([]),qt=Ct(()=>Nt.value.length>0),Yt=Ct(()=>jt.value.length>0);const Xt=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"room",icon:"mdi:floor-plan",label:"Room"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"},{id:"device",icon:"mdi:devices",label:"Device"}];let Vt=class extends lt{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeAddMenu()}}static{this.styles=s`
    :host {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      background: var(--card-background-color);
    }

    .floor-select {
      padding: 4px 6px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 13px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 4px center;
      padding-right: 18px;
    }

    .floor-select:hover {
      color: var(--primary-text-color);
    }

    .divider {
      width: 1px;
      height: 24px;
      background: var(--divider-color);
      margin: 0 8px;
    }

    .tool-group {
      display: flex;
      gap: 4px;
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
      color: var(--primary-text-color);
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .tool-button:hover {
      background: var(--secondary-background-color);
    }

    .tool-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .tool-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .spacer {
      flex: 1;
    }

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
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 20px;
      font-weight: 500;
    }

    .add-button:hover {
      opacity: 0.9;
    }

    .add-button.menu-open {
      border-radius: 4px 4px 0 0;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px 0 4px 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      min-width: 140px;
      z-index: 100;
      overflow: hidden;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
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
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .add-menu-item ha-icon {
      --mdc-icon-size: 18px;
    }

    .add-floor-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      padding: 0;
    }

    .add-floor-btn:hover {
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
    }

    .add-floor-btn ha-icon {
      --mdc-icon-size: 16px;
    }
  `}_handleFloorChange(t){const e=t.target;this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:e.value},bubbles:!0,composed:!0}))}_handleToolSelect(t){Jt.value=t,this._addMenuOpen=!1}_handleUndo(){!function(){const t=Nt.value;if(0===t.length)return;const e=t[t.length-1];e.undo(),Nt.value=t.slice(0,-1),jt.value=[...jt.value,e]}()}_handleRedo(){!function(){const t=jt.value;if(0===t.length)return;const e=t[t.length-1];e.redo(),jt.value=t.slice(0,-1),Nt.value=[...Nt.value,e]}()}_handleAddFloor(){this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen}_closeAddMenu(){this._addMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick)}render(){const t=Zt.value,e=Kt.value,i=Jt.value,o=Xt.some(t=>t.id===i),n=t?.floors||[];return j`
      <!-- Floor Selector -->
      ${n.length>0?j`
        <select
          class="floor-select"
          .value=${e?.id||""}
          @change=${this._handleFloorChange}
        >
          ${n.map(t=>j`<option value=${t.id}>${t.name}</option>`)}
        </select>
      `:null}

      <button class="add-floor-btn" @click=${this._handleAddFloor} title="Add floor">
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>

      <div class="divider"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!qt.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!Yt.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="spacer"></div>

      <!-- Add Menu (right side) -->
      <div class="add-button-container">
        <button
          class="add-button ${this._addMenuOpen?"menu-open":""} ${o?"active":""}"
          @click=${this._toggleAddMenu}
          title="Add"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${this._addMenuOpen?j`
              <div class="add-menu">
                ${Xt.map(t=>j`
                    <button
                      class="add-menu-item ${i===t.id?"active":""}"
                      @click=${()=>this._handleToolSelect(t.id)}
                    >
                      <ha-icon icon=${t.icon}></ha-icon>
                      ${t.label}
                    </button>
                  `)}
              </div>
            `:null}
      </div>
    `}};t([ut({attribute:!1})],Vt.prototype,"hass",void 0),t([ut({attribute:!1})],Vt.prototype,"floorPlans",void 0),t([ft()],Vt.prototype,"_addMenuOpen",void 0),Vt=t([ct("fpb-toolbar")],Vt);const Zt=kt(null),Kt=kt(null),Jt=kt("select"),Gt=kt({type:"none",ids:[]}),Qt=kt({x:0,y:0,width:1e3,height:800}),te=kt(10),ee=kt(!0);kt(!0);const ie=kt([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),oe=kt([]);let ne=null;async function re(){ne&&await ne()}class se extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1}static{this.styles=s`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      --toolbar-height: 48px;
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
      border-bottom: 1px solid var(--divider-color);
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
  `}connectedCallback(){super.connectedCallback(),this._loadFloorPlans(),ne=()=>this._reloadCurrentFloor()}async _reloadCurrentFloor(){if(!this.hass)return;const t=Zt.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const i=e.find(e=>e.id===t.id);if(i){Zt.value=i;const t=Kt.value?.id;if(t){const e=i.floors.find(e=>e.id===t);e?Kt.value=e:i.floors.length>0&&(Kt.value=i.floors[0])}else i.floors.length>0&&(Kt.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(t){console.error("Error reloading floor data:",t)}}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Zt.value=t[0],t[0].floors.length>0&&(Kt.value=t[0].floors[0],te.value=t[0].grid_size),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});oe.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let i=0;i<t;i++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${i+1}`,level:i});e.floors.push(t)}this._floorPlans=[e],Zt.value=e,Kt.value=e.floors[0],te.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t}`)}}async _addFloor(){if(!this.hass)return;const t=Zt.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),o={...t,floors:[...t.floors,i]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?o:e),Zt.value=o,Kt.value=i}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t}`)}}_handleFloorSelect(t){const e=Zt.value;if(e){const i=e.floors.find(e=>e.id===t);i&&(Kt.value=i)}}render(){return this._loading?j`
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
          ></fpb-toolbar>

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>
      </div>
    `}}t([ut({attribute:!1})],se.prototype,"hass",void 0),t([ut({type:Boolean})],se.prototype,"narrow",void 0),t([ft()],se.prototype,"_floorPlans",void 0),t([ft()],se.prototype,"_loading",void 0),t([ft()],se.prototype,"_error",void 0),t([ft()],se.prototype,"_floorCount",void 0),customElements.define("ha-floorplan-builder",se);export{se as HaFloorplanBuilder};
