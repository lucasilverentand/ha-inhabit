function t(t,e,i,o){var n,r=arguments.length,s=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,i,s):n(e,i))||s);return r>3&&s&&Object.defineProperty(e,i,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const s=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new r(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,g=f.trustedTypes,y=g?g.emptyScript:"",_=f.reactiveElementPolyfillSupport,v=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),m={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const r=o?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??m}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=o;const r=n.fromAttribute(e,t.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const r=this.constructor;if(!1===o&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??x)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[v("elementProperties")]=new Map,b[v("finalized")]=new Map,_?.({ReactiveElement:b}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,E=t=>t,k=$.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+P,C=`<${A}>`,W=document,D=()=>W.createComment(""),I=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,R="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,L=/>/g,N=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,T=/"/g,B=/^(?:script|style|textarea|title)$/i,H=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),j=H(1),q=H(2),K=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),X=new WeakMap,Z=W.createTreeWalker(W,129);function V(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}class J{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,r=0;const s=t.length-1,a=this.parts,[l,d]=((t,e)=>{const i=t.length-1,o=[];let n,r=2===e?"<svg>":3===e?"<math>":"",s=U;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(s.lastIndex=c,l=s.exec(i),null!==l);)c=s.lastIndex,s===U?"!--"===l[1]?s=z:void 0!==l[1]?s=L:void 0!==l[2]?(B.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=N):void 0!==l[3]&&(s=N):s===N?">"===l[0]?(s=n??U,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?N:'"'===l[3]?T:F):s===T||s===F?s=N:s===z||s===L?s=U:(s=N,n=void 0);const h=s===N&&t[e+1].startsWith("/>")?" ":"";r+=s===U?i+C:d>=0?(o.push(a),i.slice(0,d)+M+i.slice(d)+P+h):i+P+(-2===d?e:h)}return[V(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=Z.nextNode())&&a.length<s;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(M)){const e=d[r++],i=o.getAttribute(t).split(P),s=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?it:"?"===s[1]?ot:"@"===s[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(P)&&(a.push({type:6,index:n}),o.removeAttribute(t));if(B.test(o.tagName)){const t=o.textContent.split(P),e=t.length-1;if(e>0){o.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],D()),Z.nextNode(),a.push({type:2,index:++n});o.append(t[e],D())}}}else if(8===o.nodeType)if(o.data===A)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(P,t+1));)a.push({type:7,index:n}),t+=P.length-1}n++}}static createElement(t,e){const i=W.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,o){if(e===K)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const r=I(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=G(t,n._$AS(t,e.values),n,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??W).importNode(e,!0);Z.currentNode=o;let n=Z.nextNode(),r=0,s=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=i[++s]}r!==a?.index&&(n=Z.nextNode(),r++)}return Z.currentNode=W,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),I(t)?t===Y||null==t||""===t?(this._$AH!==Y&&this._$AR(),this._$AH=Y):t!==this._$AH&&t!==K&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Y&&I(this._$AH)?this._$AA.nextSibling.data=t:this.T(W.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=X.get(t.strings);return void 0===e&&X.set(t.strings,e=new J(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(D()),this.O(D()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=E(t).nextSibling;E(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}_$AI(t,e=this,i,o){const n=this.strings;let r=!1;if(void 0===n)t=G(this,t,e,0),r=!I(t)||t!==this._$AH&&t!==K,r&&(this._$AH=t);else{const o=t;let s,a;for(t=n[0],s=0;s<n.length-1;s++)a=G(this,o[i+s],e,s),a===K&&(a=this._$AH[s]),r||=!I(a)||a!==this._$AH[s],a===Y?t=Y:t!==Y&&(t+=(a??"")+n[s+1]),this._$AH[s]=a}r&&!o&&this.j(t)}j(t){t===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Y?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Y)}}class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??Y)===K)return;const i=this._$AH,o=t===Y&&i!==Y||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==Y&&(i===Y||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=$.litHtmlPolyfillSupport;st?.(J,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(D(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
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
 */const gt=Symbol.for("preact-signals");function yt(){if(xt>1)return void xt--;let t,e=!1;for(;void 0!==vt;){let i=vt;for(vt=void 0,mt++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&St(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if(mt=0,xt--,e)throw t}let _t,vt;function wt(t){const e=_t;_t=void 0;try{return t()}finally{_t=e}}let xt=0,mt=0,bt=0;function $t(t){if(void 0===_t)return;let e=t.n;return void 0===e||e.t!==_t?(e={i:0,S:t,p:_t.s,n:void 0,t:_t,e:void 0,x:void 0,r:e},void 0!==_t.s&&(_t.s.n=e),_t.s=e,t.n=e,32&_t.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=_t.s,e.n=void 0,_t.s.n=e,_t.s=e),e):void 0}function Et(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function kt(t,e){return new Et(t,e)}function St(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Mt(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Pt(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function At(t,e){Et.call(this,void 0),this.x=t,this.s=void 0,this.g=bt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Ct(t,e){return new At(t,e)}function Wt(t){const e=t.u;if(t.u=void 0,"function"==typeof e){xt++;const i=_t;_t=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Dt(t),e}finally{_t=i,yt()}}}function Dt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Wt(t)}function It(t){if(_t!==this)throw new Error("Out-of-order effect");Pt(this),_t=t,this.f&=-2,8&this.f&&Dt(this),yt()}function Ot(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Rt(t,e){const i=new Ot(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}function Ut(t,e){const i=e.x-t.x,o=e.y-t.y;return Math.sqrt(i*i+o*o)}function zt(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function Lt(t){const e=new Map,i=new Map;for(const o of t){i.set(o.id,o);const t=Nt(o.start),n=Nt(o.end);e.has(t)||e.set(t,[]),e.get(t).push({wallId:o.id,endpoint:"start"}),e.has(n)||e.set(n,[]),e.get(n).push({wallId:o.id,endpoint:"end"})}return{endpoints:e,walls:i}}function Nt(t){return`${Math.round(t.x)},${Math.round(t.y)}`}function Ft(t){return Ut(t.start,t.end)}function Tt(t,e,i,o,n){const r=[],s=new Set,a=Nt(o),l=t.endpoints.get(a)||[],d=[];for(const e of l){if(s.has(e.wallId))continue;s.add(e.wallId);const i=t.walls.get(e.wallId);if(!i)continue;const o=n,a=Ht(i,e.endpoint,o),l="start"===e.endpoint?o:a,c="end"===e.endpoint?o:a;r.push({wallId:i.id,newStart:l,newEnd:c});const h="start"===e.endpoint?i.end:i.start;(Math.round(h.x)!==Math.round(a.x)||Math.round(h.y)!==Math.round(a.y))&&d.push({originalPos:h,newPos:a})}for(const e of d){const i=qt(t,e.originalPos,e.newPos,s);if(i.blocked)return i;r.push(...i.updates)}return{updates:r,blocked:!1}}function Bt(t,e,i){const o=t.walls.get(e);if(!o)return{updates:[],blocked:!1};if(o.length_locked)return{updates:[],blocked:!0,blockedBy:o.id};if(0===Ft(o))return{updates:[],blocked:!1};const n=(o.start.x+o.end.x)/2,r=(o.start.y+o.end.y)/2,s=function(t){return Math.atan2(t.end.y-t.start.y,t.end.x-t.start.x)}(o),a=i/2,l={x:n-Math.cos(s)*a,y:r-Math.sin(s)*a},d={x:n+Math.cos(s)*a,y:r+Math.sin(s)*a},c=[],h=new Set;h.add(e),c.push({wallId:o.id,newStart:l,newEnd:d});if(Math.round(o.start.x)!==Math.round(l.x)||Math.round(o.start.y)!==Math.round(l.y)){const e=qt(t,o.start,l,h);if(e.blocked)return e;c.push(...e.updates)}if(Math.round(o.end.x)!==Math.round(d.x)||Math.round(o.end.y)!==Math.round(d.y)){const e=qt(t,o.end,d,h);if(e.blocked)return e;c.push(...e.updates)}return{updates:c,blocked:!1}}function Ht(t,e,i){let o={..."start"===e?t.end:t.start};if("horizontal"===t.direction?o={x:o.x,y:i.y}:"vertical"===t.direction&&(o={x:i.x,y:o.y}),t.length_locked){const e=Ft(t),n=o.x-i.x,r=o.y-i.y,s=Math.sqrt(n*n+r*r);if(s>0&&e>0){const t=e/s;o={x:i.x+n*t,y:i.y+r*t}}}return o}function jt(t,e,i){const o=t.walls.get(e);if(!o)return{updates:[],blocked:!1};const n=function(t,e){if("free"===e)return null;const i=(t.start.x+t.end.x)/2,o=(t.start.y+t.end.y)/2,n=Ut(t.start,t.end)/2;return"horizontal"===e?Math.round(t.start.y)===Math.round(t.end.y)?null:{start:{x:i-n,y:o},end:{x:i+n,y:o}}:"vertical"===e?Math.round(t.start.x)===Math.round(t.end.x)?null:{start:{x:i,y:o-n},end:{x:i,y:o+n}}:null}(o,i);if(!n)return{updates:[],blocked:!1};const r=[],s=new Set;s.add(e),r.push({wallId:e,newStart:n.start,newEnd:n.end});if(Math.round(o.start.x)!==Math.round(n.start.x)||Math.round(o.start.y)!==Math.round(n.start.y)){const e=qt(t,o.start,n.start,s);if(e.blocked)return e;r.push(...e.updates)}if(Math.round(o.end.x)!==Math.round(n.end.x)||Math.round(o.end.y)!==Math.round(n.end.y)){const e=qt(t,o.end,n.end,s);if(e.blocked)return e;r.push(...e.updates)}return{updates:r,blocked:!1}}function qt(t,e,i,o){const n=[],r=Nt(e),s=t.endpoints.get(r)||[],a=[];for(const e of s){if(o.has(e.wallId))continue;o.add(e.wallId);const r=t.walls.get(e.wallId);if(!r)continue;const s=Ht(r,e.endpoint,i),l="start"===e.endpoint?i:s,d="end"===e.endpoint?i:s;n.push({wallId:r.id,newStart:l,newEnd:d});const c="start"===e.endpoint?r.end:r.start;(Math.round(c.x)!==Math.round(s.x)||Math.round(c.y)!==Math.round(s.y))&&a.push({originalPos:c,newPos:s})}for(const e of a){const i=qt(t,e.originalPos,e.newPos,o);if(i.blocked)return i;n.push(...i.updates)}return{updates:n,blocked:!1}}function Kt(t,e,i,o){const n=Tt(Lt(t),0,0,e,i),r=new Map;for(const t of n.updates)r.set(t.wallId,{start:t.newStart,end:t.newEnd});return r}Et.prototype.brand=gt,Et.prototype.h=function(){return!0},Et.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:wt(()=>{var t;null==(t=this.W)||t.call(this)}))},Et.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&wt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},Et.prototype.subscribe=function(t){return Rt(()=>{const e=this.value,i=_t;_t=void 0;try{t(e)}finally{_t=i}},{name:"sub"})},Et.prototype.valueOf=function(){return this.value},Et.prototype.toString=function(){return this.value+""},Et.prototype.toJSON=function(){return this.value},Et.prototype.peek=function(){const t=_t;_t=void 0;try{return this.value}finally{_t=t}},Object.defineProperty(Et.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(mt>100)throw new Error("Cycle detected");this.v=t,this.i++,bt++,xt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{yt()}}}}),At.prototype=new Et,At.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===bt)return!0;if(this.g=bt,this.f|=1,this.i>0&&!St(this))return this.f&=-2,!0;const t=_t;try{Mt(this),_t=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return _t=t,Pt(this),this.f&=-2,!0},At.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}Et.prototype.S.call(this,t)},At.prototype.U=function(t){if(void 0!==this.t&&(Et.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},At.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(At.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Ot.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Ot.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Wt(this),Mt(this),xt++;const t=_t;return _t=this,It.bind(this,t)},Ot.prototype.N=function(){2&this.f||(this.f|=2,this.o=vt,vt=this)},Ot.prototype.d=function(){this.f|=8,1&this.f||Dt(this)},Ot.prototype.dispose=function(){this.d()};function Yt(t){return`${Math.round(t.x)},${Math.round(t.y)}`}function Xt(t){const[e,i]=t.split(",").map(Number);return{x:e,y:i}}function Zt(t){let e=0;const i=t.length;for(let o=0;o<i;o++){const n=(o+1)%i;e+=t[o].x*t[n].y,e-=t[n].x*t[o].y}return e/2}function Vt(t){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;const o=t.length;return{x:e/o,y:i/o}}const Jt=kt([]),Gt=kt([]),Qt=kt(!1),te=Ct(()=>Jt.value.length>0&&!Qt.value),ee=Ct(()=>Gt.value.length>0&&!Qt.value);function ie(t){Jt.value=[...Jt.value.slice(-99),t],Gt.value=[]}async function oe(){const t=Jt.value;if(0===t.length||Qt.value)return;const e=t[t.length-1];Qt.value=!0;try{await e.undo()}finally{Qt.value=!1}Jt.value=t.slice(0,-1),Gt.value=[...Gt.value,e]}async function ne(){const t=Gt.value;if(0===t.length||Qt.value)return;const e=t[t.length-1];Qt.value=!0;try{await e.redo()}finally{Qt.value=!1}Gt.value=t.slice(0,-1),Jt.value=[...Jt.value,e]}function re(){Jt.value=[],Gt.value=[]}let se=class extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._roomEditor=null,this._haAreas=[],this._hoveredEndpoint=null,this._draggingEndpoint=null,this._wallEditor=null,this._editingLength="",this._pendingDevice=null,this._entitySearch="",this._cleanupEffects=[]}static{this.styles=s`
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
  `}connectedCallback(){super.connectedCallback(),this._cleanupEffects.push(Rt(()=>{this._viewBox=ue.value})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,n=this._viewBox.height*e;if(o<100||o>1e4)return;const r={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:n};ue.value=r,this._viewBox=r}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=this._getSnappedPoint(e);if(this._pendingDevice&&"device"!==he.value&&(this._pendingDevice=null),1===t.button)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);const o=he.value;if(0===t.button)if("select"===o){const i=!!this._wallEditor;this._wallEditor=null,this._roomEditor=null;this._handleSelectClick(e)||(i&&(pe.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}else if("wall"===o){this._wallEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:i;this._handleWallClick(e,t.shiftKey)}else"device"===o?(this._wallEditor=null,this._handleDeviceClick(i)):(this._wallEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=he.value;let o=this._getSnappedPoint(e,"device"===i);if(t.shiftKey&&"wall"===i&&this._wallStartPoint){o=Math.abs(o.x-this._wallStartPoint.x)>=Math.abs(o.y-this._wallStartPoint.y)?{x:o.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:o.y}}if(this._cursorPos=o,this._draggingEndpoint){const i=t.clientX-this._draggingEndpoint.startX,o=t.clientY-this._draggingEndpoint.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingEndpoint.hasMoved=!0),this._cursorPos=this._getSnappedPointForEndpoint(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};return this._panStart={x:t.clientX,y:t.clientY},ue.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||this._checkEndpointHover(e)}_checkEndpointHover(t){const e=this._getWallEndpoints();for(const i of e.values()){if(Math.sqrt(Math.pow(t.x-i.coords.x,2)+Math.pow(t.y-i.coords.y,2))<15)return void(this._hoveredEndpoint=i)}this._hoveredEndpoint=null}_handlePointerUp(t){if(this._draggingEndpoint)return this._draggingEndpoint.hasMoved?this._finishEndpointDrag():this._startWallFromEndpoint(),void this._svg?.releasePointerCapture(t.pointerId);this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}_startWallFromEndpoint(){this._draggingEndpoint&&(this._wallStartPoint=this._draggingEndpoint.originalCoords,he.value="wall",this._draggingEndpoint=null,this._hoveredEndpoint=null)}async _finishEndpointDrag(){if(!this._draggingEndpoint||!this.hass)return void(this._draggingEndpoint=null);const t=ce.value,e=de.value;if(!t||!e)return void(this._draggingEndpoint=null);const i=this._cursorPos,o=this._draggingEndpoint.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingEndpoint=null);const n=Lt(t.walls),r=(this._draggingEndpoint.wallIds.map(t=>t.split(":")[0]),Tt(n,0,0,o,i));if(r.blocked)return alert(`Cannot move endpoint: wall "${r.blockedBy}" is locked.`),void(this._draggingEndpoint=null);if(0===r.updates.length)return void(this._draggingEndpoint=null);const s=r.updates.map(t=>t.wallId);try{await this._withWallUndo(s,"Move wall endpoint",async()=>{if(r.updates.length>1)await this.hass.callWS({type:"inhabit/walls/batch_update",floor_plan_id:e.id,floor_id:t.id,updates:r.updates.map(t=>({wall_id:t.wallId,start:t.newStart,end:t.newEnd}))});else{const i=r.updates[0];await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:e.id,floor_id:t.id,wall_id:i.wallId,start:i.newStart,end:i.newEnd})}await we()})}catch(t){console.error("Error updating wall endpoint:",t),alert(`Failed to update wall: ${t}`)}this._draggingEndpoint=null}_handleKeyDown(t){"Escape"===t.key?(this._wallStartPoint=null,this._hoveredEndpoint=null,this._draggingEndpoint=null,this._pendingDevice=null,this._wallEditor=null,this._roomEditor=null,pe.value={type:"none",ids:[]},he.value="select"):"Backspace"!==t.key&&"Delete"!==t.key||!this._wallEditor?"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),ne()):(t.preventDefault(),oe()):(t.preventDefault(),this._handleWallDelete())}_handleEditorSave(){if(!this._wallEditor)return;const t=parseFloat(this._editingLength);isNaN(t)||t<=0||(this._updateWallLength(this._wallEditor.wall,t),this._wallEditor=null)}_handleEditorCancel(){this._wallEditor=null,pe.value={type:"none",ids:[]}}async _handleWallDelete(){if(!this._wallEditor||!this.hass)return;const t=ce.value,e=de.value;if(!t||!e)return;const i=this.hass,o=e.id,n=t.id,r=this._wallEditor.wall,s={start:{...r.start},end:{...r.end},thickness:r.thickness,is_exterior:r.is_exterior,length_locked:r.length_locked,direction:r.direction},a={id:r.id};try{await i.callWS({type:"inhabit/walls/delete",floor_plan_id:o,floor_id:n,wall_id:a.id}),await we(),await this._syncRoomsWithWalls(),ie({type:"wall_delete",description:"Delete wall",undo:async()=>{const t=await i.callWS({type:"inhabit/walls/add",floor_plan_id:o,floor_id:n,...s});a.id=t.id,await we(),await this._syncRoomsWithWalls()},redo:async()=>{await i.callWS({type:"inhabit/walls/delete",floor_plan_id:o,floor_id:n,wall_id:a.id}),await we(),await this._syncRoomsWithWalls()}})}catch(t){console.error("Error deleting wall:",t)}this._wallEditor=null,pe.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withWallUndo(t,e,i){if(!this.hass)return;const o=ce.value,n=de.value;if(!o||!n)return;const r=this.hass,s=n.id,a=o.id,l=new Map;for(const e of t){const t=o.walls.find(t=>t.id===e);t&&l.set(e,{start:{...t.start},end:{...t.end},length_locked:t.length_locked,direction:t.direction})}await i(),await this._syncRoomsWithWalls();const d=ce.value;if(!d)return;const c=new Map;for(const e of t){const t=d.walls.find(t=>t.id===e);t&&c.set(e,{start:{...t.start},end:{...t.end},length_locked:t.length_locked,direction:t.direction})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({wall_id:t,start:e.start,end:e.end,length_locked:e.length_locked,direction:e.direction}));if(e.length>1)await r.callWS({type:"inhabit/walls/batch_update",floor_plan_id:s,floor_id:a,updates:e});else if(1===e.length){const t=e[0];await r.callWS({type:"inhabit/walls/update",floor_plan_id:s,floor_id:a,...t})}await we(),await this._syncRoomsWithWalls()};ie({type:"wall_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateWallLength(t,e){if(!this.hass)return;const i=ce.value,o=de.value;if(!i||!o)return;const n=Bt(Lt(i.walls),t.id,e);if(n.blocked)return void alert(`Cannot change length: wall "${n.blockedBy}" has a constraint that blocks this change.`);if(0===n.updates.length)return;const r=n.updates.map(t=>t.wallId);try{await this._withWallUndo(r,"Change wall length",async()=>{if(n.updates.length>1)await this.hass.callWS({type:"inhabit/walls/batch_update",floor_plan_id:o.id,floor_id:i.id,updates:n.updates.map(t=>({wall_id:t.wallId,start:t.newStart,end:t.newEnd}))});else{const t=n.updates[0];await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:o.id,floor_id:i.id,wall_id:t.wallId,start:t.newStart,end:t.newEnd})}await we()})}catch(t){console.error("Error updating wall:",t),alert(`Failed to update wall: ${t}`)}pe.value={type:"none",ids:[]}}_getSnappedPointForEndpoint(t){const e=ce.value;if(e){const i=15;for(const o of e.walls)for(const e of[o.start,o.end]){if(Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))<i)return e}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const i=ce.value;if(!i)return ge.value?zt(t,fe.value):t;for(const e of i.walls)for(const i of[e.start,e.end]){if(Math.sqrt(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2))<15)return i}if(e){let e=null,o=15;for(const n of i.walls){const i=this._getClosestPointOnSegment(t,n.start,n.end),r=Math.sqrt(Math.pow(t.x-i.x,2)+Math.pow(t.y-i.y,2));r<o&&(o=r,e=i)}if(e)return e}return ge.value?zt(t,fe.value):t}_getClosestPointOnSegment(t,e,i){const o=i.x-e.x,n=i.y-e.y,r=o*o+n*n;if(0===r)return e;const s=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/r));return{x:e.x+s*o,y:e.y+s*n}}_handleSelectClick(t){const e=ce.value;if(!e)return!1;for(const i of e.walls){if(this._pointToSegmentDistance(t,i.start,i.end)<i.thickness/2+5){pe.value={type:"wall",ids:[i.id]};const t=this._calculateWallLength(i.start,i.end),e={x:(i.start.x+i.end.x)/2,y:(i.start.y+i.end.y)/2};return this._wallEditor={wall:i,position:e,length:t},this._editingLength=Math.round(t).toString(),!0}}const i=_e.value.filter(t=>t.floor_id===e.id);for(const e of i){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return pe.value={type:"device",ids:[e.id]},!0}for(const i of e.rooms)if(this._pointInPolygon(t,i.polygon.vertices)){pe.value={type:"room",ids:[i.id]};const t=i.ha_area_id?this._haAreas.find(t=>t.area_id===i.ha_area_id)?.name??i.name:i.name;return this._roomEditor={room:i,editName:t,editColor:i.color,editAreaId:i.ha_area_id??null},!0}return pe.value={type:"none",ids:[]},!1}_pointToSegmentDistance(t,e,i){const o=i.x-e.x,n=i.y-e.y,r=o*o+n*n;if(0===r)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const s=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/r)),a=e.x+s*o,l=e.y+s*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let i="free";if(e){i=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,i),this._wallStartPoint=t}else this._wallStartPoint=t}async _completeWall(t,e,i="free"){if(!this.hass)return;const o=ce.value,n=de.value;if(!o||!n)return;const r=this.hass,s=n.id,a=o.id,l={id:""};try{const o=await r.callWS({type:"inhabit/walls/add",floor_plan_id:s,floor_id:a,start:t,end:e,thickness:8,direction:i});l.id=o.id,await we(),await this._syncRoomsWithWalls(),ie({type:"wall_add",description:"Add wall",undo:async()=>{await r.callWS({type:"inhabit/walls/delete",floor_plan_id:s,floor_id:a,wall_id:l.id}),await we(),await this._syncRoomsWithWalls()},redo:async()=>{const o=await r.callWS({type:"inhabit/walls/add",floor_plan_id:s,floor_id:a,start:t,end:e,thickness:8,direction:i});l.id=o.id,await we(),await this._syncRoomsWithWalls()}})}catch(t){console.error("Error creating wall:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.inverse();return{x:i.a*t.x+i.c*t.y+i.e,y:i.b*t.x+i.d*t.y+i.f}}const i=this._svg.getBoundingClientRect(),o=this._viewBox.width/i.width,n=this._viewBox.height/i.height;return{x:this._viewBox.x+(t.x-i.left)*o,y:this._viewBox.y+(t.y-i.top)*n}}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let n=0,r=o-1;n<o;r=n++){const o=e[n],s=e[r];o.y>t.y!=s.y>t.y&&t.x<(s.x-o.x)*(t.y-o.y)/(s.y-o.y)+o.x&&(i=!i)}return i}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithWalls(){if(!this.hass)return;const t=ce.value,e=de.value;if(!t||!e)return;const i=function(t){if(0===t.length)return[];const e=new Map,i=(t,i)=>{const o=Yt(t),n=Yt(i);if(o===n)return;const r=Math.atan2(i.y-t.y,i.x-t.x);e.has(o)||e.set(o,[]),e.get(o).push({targetKey:n,angle:r})};for(const e of t)i(e.start,e.end),i(e.end,e.start);for(const[,t]of e)t.sort((t,e)=>t.angle-e.angle);const o=new Set,n=[],r=(t,e)=>`${t}->${e}`;for(const[t,i]of e)for(const s of i){const i=r(t,s.targetKey);if(o.has(i))continue;const a=[];let l=t,d=s.targetKey,c=!0;for(let i=0;i<1e3;i++){const i=r(l,d);if(o.has(i)){c=!1;break}o.add(i),a.push(l);const n=Math.atan2(Xt(l).y-Xt(d).y,Xt(l).x-Xt(d).x),h=e.get(d);if(!h||0===h.length){c=!1;break}let p=null;for(const t of h)if(t.angle>n){p=t;break}if(p||(p=h[0]),l=d,d=p.targetKey,l===t&&d===s.targetKey)break;if(l===t)break}c&&a.length>=3&&n.push(a.map(Xt))}const s=[];for(const t of n){const e=Zt(t),i=Math.abs(e);if(i<100)continue;if(e>0)continue;const o=Vt(t);s.push({vertices:t,area:i,centroid:o})}const a=new Map;for(const t of s){const e=t.vertices.map(Yt).sort().join("|");(!a.has(e)||a.get(e).area<t.area)&&a.set(e,t)}return Array.from(a.values())}(t.walls),o=[...t.rooms],n=new Set;for(const r of i){let i=null,s=1/0;for(const t of o){if(n.has(t.id))continue;const e=this._getPolygonCenter(t.polygon.vertices);if(!e)continue;const o=Math.sqrt(Math.pow(r.centroid.x-e.x,2)+Math.pow(r.centroid.y-e.y,2));o<50&&o<s&&(s=o,i=t)}if(i){n.add(i.id);if(this._verticesChanged(i.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,polygon:{vertices:r.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{const i=this._getNextRoomNumber(o);try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${i}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of o)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await we()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let i=0;i<t.length;i++)if(Math.abs(t[i].x-e[i].x)>1||Math.abs(t[i].y-e[i].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const i of t){const t=i.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=ce.value,e=de.value;if(!t||!e)return;const{room:i,editName:o,editColor:n,editAreaId:r}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,name:o,color:n,ha_area_id:r}),await we()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,pe.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,pe.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=de.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await we()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,pe.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;return j`
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
            @change=${t=>{if(this._roomEditor){const e=t.target.value,i=this._haAreas.find(t=>t.area_id===e);this._roomEditor={...this._roomEditor,editAreaId:e||null,editName:i?i.name:this._roomEditor.editName}}}}
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
    `}_renderWallChains(t,e){let i=t;if(this._draggingEndpoint){const e=this._cursorPos,o=(this._draggingEndpoint.wallIds.map(t=>t.split(":")[0]),Kt(t,this._draggingEndpoint.originalCoords,e));i=t.map(t=>{const e=o.get(t.id);return e?{...t,start:e.start,end:e.end}:t})}const o=function(t){if(0===t.length)return[];const e=new Set,i=[],o=(t,e)=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1;for(const n of t){if(e.has(n.id))continue;const r=[n];e.add(n.id);let s=n.end,a=!0;for(;a;){a=!1;for(const i of t)if(!e.has(i.id)){if(o(i.start,s)){r.push(i),e.add(i.id),s=i.end,a=!0;break}if(o(i.end,s)){r.push({...i,start:i.end,end:i.start}),e.add(i.id),s=i.start,a=!0;break}}}let l=n.start;for(a=!0;a;){a=!1;for(const i of t)if(!e.has(i.id)){if(o(i.end,l)){r.unshift(i),e.add(i.id),l=i.start,a=!0;break}if(o(i.start,l)){r.unshift({...i,start:i.end,end:i.start}),e.add(i.id),l=i.end,a=!0;break}}}i.push(r)}return i}(i),n="wall"===e.type&&e.ids.length>0?i.find(t=>t.id===e.ids[0]):null;return q`
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
    `}_singleWallPath(t){const{start:e,end:i,thickness:o}=t,n=i.x-e.x,r=i.y-e.y,s=Math.sqrt(n*n+r*r);if(0===s)return"";const a=-r/s*(o/2),l=n/s*(o/2);return`M${e.x+a},${e.y+l}\n            L${i.x+a},${i.y+l}\n            L${i.x-a},${i.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_renderFloor(){const t=ce.value;if(!t)return null;const e=pe.value,i=ye.value;return q`
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
                ${t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name}
              </text>
            `:null})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${i.find(t=>"devices"===t.id)?.visible?q`
        <g class="devices-layer" opacity="${i.find(t=>"devices"===t.id)?.opacity??1}">
          ${_e.value.filter(e=>e.floor_id===t.id).map(t=>this._renderDevice(t))}
        </g>
      `:null}
    `}_renderDevice(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=pe.value;return q`
      <g class="device-marker ${i?"on":"off"} ${"device"===o.type&&o.ids.includes(t.id)?"selected":""}"
         transform="translate(${t.position.x}, ${t.position.y}) rotate(${t.rotation})">
        <circle r="12" fill="${i?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${t.show_label?q`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${t.label||e?.attributes.friendly_name||t.entity_id}
          </text>
        `:null}
      </g>
    `}_getWallEndpoints(){const t=ce.value;if(!t)return new Map;const e=new Map;for(const i of t.walls){const t=`${Math.round(i.start.x)},${Math.round(i.start.y)}`,o=`${Math.round(i.end.x)},${Math.round(i.end.y)}`;e.has(t)||e.set(t,{coords:i.start,wallIds:[]}),e.get(t).wallIds.push(i.id+":start"),e.has(o)||e.set(o,{coords:i.end,wallIds:[]}),e.get(o).wallIds.push(i.id+":end")}return e}_renderWallEndpoints(){const t=ce.value;if(!t||0===t.walls.length)return null;const e=[];return this._draggingEndpoint?e.push({coords:this._cursorPos,wallIds:this._draggingEndpoint.wallIds,isDragging:!0}):this._hoveredEndpoint&&e.push({coords:this._hoveredEndpoint.coords,wallIds:this._hoveredEndpoint.wallIds,isDragging:!1}),0===e.length?null:q`
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
    `}_renderDraggedWallLengths(t){if(!this._draggingEndpoint)return null;const e=this._cursorPos,i=(this._draggingEndpoint.wallIds.map(t=>t.split(":")[0]),Kt(t.walls,this._draggingEndpoint.originalCoords,e)),o=[];for(const[e,n]of i){const i=t.walls.find(t=>t.id===e);if(!i)continue;const r=this._calculateWallLength(n.start,n.end),s=Math.atan2(n.end.y-n.start.y,n.end.x-n.start.x);o.push({start:n.start,end:n.end,origStart:i.start,origEnd:i.end,length:r,angle:s,thickness:i.thickness})}const n=[];for(let t=0;t<o.length;t++)for(let i=t+1;i<o.length;i++){const r=Math.abs(o[t].angle-o[i].angle)%Math.PI;Math.abs(r-Math.PI/2)<.02&&n.push({point:e,angle:Math.min(o[t].angle,o[i].angle)})}return q`
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
    `}_handleEndpointPointerDown(t,e){t.stopPropagation(),t.preventDefault();const i=this._hoveredEndpoint?.coords||e.coords;this._draggingEndpoint={coords:i,wallIds:e.wallIds,originalCoords:{...i},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_renderDrawingPreview(){if("wall"===he.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,i=this._calculateWallLength(t,e),o=(t.x+e.x)/2,n=(t.y+e.y)/2,r=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),s=r>90||r<-90?r+180:r;return q`
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
      `}return null}_getPolygonCenter(t){if(0===t.length)return null;let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.a*t.x+e.c*t.y+e.e,o=e.b*t.x+e.d*t.y+e.f,n=this._svg.getBoundingClientRect();return{x:i-n.left,y:o-n.top}}const i=this._svg.getBoundingClientRect(),o=i.width/this._viewBox.width,n=i.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*o,y:(t.y-this._viewBox.y)*n}}_renderWallEditor(){if(!this._wallEditor)return null;const t=this._wallEditor.wall;return j`
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
          <button class="delete-btn" @click=${this._handleWallDelete}>Delete</button>
        </div>
      </div>
    `}async _toggleLengthLock(){if(!this._wallEditor||!this.hass)return;const t=ce.value,e=de.value;if(!t||!e)return;const i=this._wallEditor.wall;try{await this._withWallUndo([i.id],"Toggle length lock",async()=>{await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:e.id,floor_id:t.id,wall_id:i.id,length_locked:!i.length_locked}),await we()}),this._refreshWallEditor(i.id)}catch(t){console.error("Error toggling length lock:",t),alert(`Failed to toggle length lock: ${t}`)}}async _setDirection(t){if(!this._wallEditor||!this.hass)return;const e=ce.value,i=de.value;if(!e||!i)return;const o=this._wallEditor.wall;try{const n=jt(Lt(e.walls),o.id,t);if(n.blocked)return void alert("Cannot apply direction: blocked by connected walls.");const r=n.updates.length>0?n.updates.map(t=>t.wallId):[o.id];await this._withWallUndo(r,"Set wall direction",async()=>{if(n.updates.length>0){const r=n.updates.map(e=>{const i={wall_id:e.wallId,start:e.newStart,end:e.newEnd};return e.wallId===o.id&&(i.direction=t),i});await this.hass.callWS({type:"inhabit/walls/batch_update",floor_plan_id:i.id,floor_id:e.id,updates:r})}else await this.hass.callWS({type:"inhabit/walls/update",floor_plan_id:i.id,floor_id:e.id,wall_id:o.id,direction:t});await we()}),this._refreshWallEditor(o.id)}catch(t){console.error("Error setting wall direction:",t),alert(`Failed to set wall direction: ${t}`)}}_refreshWallEditor(t){const e=ce.value;if(e){const i=e.walls.find(e=>e.id===t);i&&this._wallEditor&&(this._wallEditor={...this._wallEditor,wall:i})}}_getFilteredEntities(){if(!this.hass)return[];const t=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));if(this._entitySearch){const t=this._entitySearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[e]||"mdi:devices"}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=ce.value,i=de.value;if(!e||!i)return;const o=this.hass,n=i.id,r=e.id,s={...this._pendingDevice.position},a=t.startsWith("binary_sensor.")||t.startsWith("sensor."),l={id:""};try{const e=await o.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:r,entity_id:t,position:s,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await we(),ie({type:"device_place",description:"Place device",undo:async()=>{await o.callWS({type:"inhabit/devices/remove",floor_plan_id:n,device_id:l.id}),await we()},redo:async()=>{const e=await o.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:r,entity_id:t,position:s,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=e.id,await we()}})}catch(t){console.error("Error placing device:",t),alert(`Failed to place device: ${t}`)}this._pendingDevice=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return j`
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
        class="${this._isPanning?"panning":""} ${"select"===he.value?"select-tool":""}"
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
      ${this._renderRoomEditor()}
      ${this._renderEntityPicker()}
    `;var t}_renderDevicePreview(){return"device"!==he.value||this._pendingDevice?null:q`
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
    `}};t([ut({attribute:!1})],se.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],se.prototype,"_svg",void 0),t([ft()],se.prototype,"_viewBox",void 0),t([ft()],se.prototype,"_isPanning",void 0),t([ft()],se.prototype,"_panStart",void 0),t([ft()],se.prototype,"_cursorPos",void 0),t([ft()],se.prototype,"_wallStartPoint",void 0),t([ft()],se.prototype,"_roomEditor",void 0),t([ft()],se.prototype,"_haAreas",void 0),t([ft()],se.prototype,"_hoveredEndpoint",void 0),t([ft()],se.prototype,"_draggingEndpoint",void 0),t([ft()],se.prototype,"_wallEditor",void 0),t([ft()],se.prototype,"_editingLength",void 0),t([ft()],se.prototype,"_pendingDevice",void 0),t([ft()],se.prototype,"_entitySearch",void 0),se=t([ct("fpb-canvas")],se);const ae=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"},{id:"device",icon:"mdi:devices",label:"Device"}];let le=class extends lt{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=s`
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
  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){he.value=t,this._addMenuOpen=!1}_handleUndo(){oe()}_handleRedo(){ne()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,i){t.stopPropagation(),confirm(`Delete "${i}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick)}render(){const t=de.value,e=ce.value,i=he.value,o=t?.floors||[];return j`
      <!-- Floor Selector -->
      ${o.length>0?j`
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
              ${o.map(t=>j`
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

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!te.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!ee.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Add Menu (right side) -->
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
                ${ae.map(t=>j`
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
    `}};t([ut({attribute:!1})],le.prototype,"hass",void 0),t([ut({attribute:!1})],le.prototype,"floorPlans",void 0),t([ft()],le.prototype,"_addMenuOpen",void 0),t([ft()],le.prototype,"_floorMenuOpen",void 0),le=t([ct("fpb-toolbar")],le);const de=kt(null),ce=kt(null),he=kt("select"),pe=kt({type:"none",ids:[]}),ue=kt({x:0,y:0,width:1e3,height:800}),fe=kt(10),ge=kt(!0);kt(!0);const ye=kt([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),_e=kt([]);let ve=null;async function we(){ve&&await ve()}class xe extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1}static{this.styles=s`
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
  `}connectedCallback(){super.connectedCallback(),this._loadFloorPlans(),ve=()=>this._reloadCurrentFloor()}async _reloadCurrentFloor(){if(!this.hass)return;const t=de.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const i=e.find(e=>e.id===t.id);if(i){de.value=i;const t=ce.value?.id;if(t){const e=i.floors.find(e=>e.id===t);e?ce.value=e:i.floors.length>0&&(ce.value=i.floors[0])}else i.floors.length>0&&(ce.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(t){console.error("Error reloading floor data:",t)}}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(de.value=t[0],t[0].floors.length>0&&(ce.value=t[0].floors[0],fe.value=t[0].grid_size),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});_e.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let i=0;i<t;i++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${i+1}`,level:i});e.floors.push(t)}this._floorPlans=[e],de.value=e,ce.value=e.floors[0],fe.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t}`)}}async _addFloor(){if(!this.hass)return;const t=de.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),o={...t,floors:[...t.floors,i]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?o:e),de.value=o,ce.value=i}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=de.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const i=e.floors.filter(e=>e.id!==t),o={...e,floors:i};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?o:t),de.value=o,ce.value?.id===t&&(re(),ce.value=i.length>0?i[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t}`)}}_handleFloorSelect(t){const e=de.value;if(e){const i=e.floors.find(e=>e.id===t);i&&(ce.value?.id!==i.id&&re(),ce.value=i)}}render(){return this._loading?j`
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
    `}}t([ut({attribute:!1})],xe.prototype,"hass",void 0),t([ut({type:Boolean})],xe.prototype,"narrow",void 0),t([ft()],xe.prototype,"_floorPlans",void 0),t([ft()],xe.prototype,"_loading",void 0),t([ft()],xe.prototype,"_error",void 0),t([ft()],xe.prototype,"_floorCount",void 0),customElements.define("ha-floorplan-builder",xe);export{xe as HaFloorplanBuilder};
