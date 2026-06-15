function t(t,e,i,o){var n,s=arguments.length,r=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(s<3?n(r):s>3?n(e,i,r):n(e,i))||r);return s>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new s(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,f=u.trustedTypes,_=f?f.emptyScript:"",m=u.reactiveElementPolyfillSupport,y=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const s=o?.call(this);n?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=o;const s=n.fromAttribute(e,t.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const s=this.constructor;if(!1===o&&(n=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??x)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,m?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=t=>t,E=$.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+S,C=`<${I}>`,z=document,A=()=>z.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,L="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,W=/>/g,O=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,B=/"/g,U=/^(?:script|style|textarea|title)$/i,j=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),H=j(1),q=j(2),V=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),X=new WeakMap,Y=z.createTreeWalker(z,129);function K(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}class G{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,s=0;const r=t.length-1,a=this.parts,[l,d]=((t,e)=>{const i=t.length-1,o=[];let n,s=2===e?"<svg>":3===e?"<math>":"",r=N;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===N?"!--"===l[1]?r=F:void 0!==l[1]?r=W:void 0!==l[2]?(U.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=O):void 0!==l[3]&&(r=O):r===O?">"===l[0]?(r=n??N,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?O:'"'===l[3]?B:R):r===B||r===R?r=O:r===F||r===W?r=N:(r=O,n=void 0);const h=r===O&&t[e+1].startsWith("/>")?" ":"";s+=r===N?i+C:d>=0?(o.push(a),i.slice(0,d)+M+i.slice(d)+S+h):i+S+(-2===d?e:h)}return[K(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=G.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=Y.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(M)){const e=d[s++],i=o.getAttribute(t).split(S),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?it:"?"===r[1]?ot:"@"===r[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:n}),o.removeAttribute(t));if(U.test(o.tagName)){const t=o.textContent.split(S),e=t.length-1;if(e>0){o.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],A()),Y.nextNode(),a.push({type:2,index:++n});o.append(t[e],A())}}}else if(8===o.nodeType)if(o.data===I)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(S,t+1));)a.push({type:7,index:n}),t+=S.length-1}n++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){if(e===V)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=D(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=J(t,n._$AS(t,e.values),n,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??z).importNode(e,!0);Y.currentNode=o;let n=Y.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=i[++r]}s!==a?.index&&(n=Y.nextNode(),s++)}return Y.currentNode=z,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),D(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=X.get(t.strings);return void 0===e&&X.set(t.strings,e=new G(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(A()),this.O(A()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,o){const n=this.strings;let s=!1;if(void 0===n)t=J(this,t,e,0),s=!D(t)||t!==this._$AH&&t!==V,s&&(this._$AH=t);else{const o=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=J(this,o[i+r],e,r),a===V&&(a=this._$AH[r]),s||=!D(a)||a!==this._$AH[r],a===Z?t=Z:t!==Z&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??Z)===V)return;const i=this._$AH,o=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==Z&&(i===Z||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const rt={I:tt},at=$.litHtmlPolyfillSupport;at?.(G,tt),($.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let dt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(A(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:x},pt=(t=ht,e,i)=>{const{kind:o,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,n,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];e.call(this,i),this.requestUpdate(o,n,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};function gt(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return gt({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ft(t,e){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}const _t=Symbol.for("preact-signals");function mt(){if(bt>1)return void bt--;let t,e=!1;for(;void 0!==vt;){let i=vt;for(vt=void 0,wt++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&Mt(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if(wt=0,bt--,e)throw t}let yt,vt;function xt(t){const e=yt;yt=void 0;try{return t()}finally{yt=e}}let bt=0,wt=0,$t=0;function kt(t){if(void 0===yt)return;let e=t.n;return void 0===e||e.t!==yt?(e={i:0,S:t,p:yt.s,n:void 0,t:yt,e:void 0,x:void 0,r:e},void 0!==yt.s&&(yt.s.n=e),yt.s=e,t.n=e,32&yt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=yt.s,e.n=void 0,yt.s.n=e,yt.s=e),e):void 0}function Et(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Pt(t,e){return new Et(t,e)}function Mt(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function St(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function It(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function Ct(t,e){Et.call(this,void 0),this.x=t,this.s=void 0,this.g=$t-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function zt(t,e){return new Ct(t,e)}function At(t){const e=t.u;if(t.u=void 0,"function"==typeof e){bt++;const i=yt;yt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Dt(t),e}finally{yt=i,mt()}}}function Dt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,At(t)}function Tt(t){if(yt!==this)throw new Error("Out-of-order effect");It(this),yt=t,this.f&=-2,8&this.f&&Dt(this),mt()}function Lt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Nt(t,e){const i=new Lt(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}Et.prototype.brand=_t,Et.prototype.h=function(){return!0},Et.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:xt(()=>{var t;null==(t=this.W)||t.call(this)}))},Et.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&xt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},Et.prototype.subscribe=function(t){return Nt(()=>{const e=this.value,i=yt;yt=void 0;try{t(e)}finally{yt=i}},{name:"sub"})},Et.prototype.valueOf=function(){return this.value},Et.prototype.toString=function(){return this.value+""},Et.prototype.toJSON=function(){return this.value},Et.prototype.peek=function(){const t=yt;yt=void 0;try{return this.value}finally{yt=t}},Object.defineProperty(Et.prototype,"value",{get(){const t=kt(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(wt>100)throw new Error("Cycle detected");this.v=t,this.i++,$t++,bt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{mt()}}}}),Ct.prototype=new Et,Ct.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===$t)return!0;if(this.g=$t,this.f|=1,this.i>0&&!Mt(this))return this.f&=-2,!0;const t=yt;try{St(this),yt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return yt=t,It(this),this.f&=-2,!0},Ct.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}Et.prototype.S.call(this,t)},Ct.prototype.U=function(t){if(void 0!==this.t&&(Et.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},Ct.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(Ct.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=kt(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Lt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Lt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,At(this),St(this),bt++;const t=yt;return yt=this,Tt.bind(this,t)},Lt.prototype.N=function(){2&this.f||(this.f|=2,this.o=vt,vt=this)},Lt.prototype.d=function(){this.f|=8,1&this.f||Dt(this)},Lt.prototype.dispose=function(){this.d()};const Ft=Pt([]),Wt=Pt([]),Ot=Pt(!1),Rt=zt(()=>Ft.value.length>0&&!Ot.value),Bt=zt(()=>Wt.value.length>0&&!Ot.value);function Ut(t){Ft.value=[...Ft.value.slice(-99),t],Wt.value=[]}async function jt(){const t=Ft.value;if(0===t.length||Ot.value)return;const e=t[t.length-1];Ot.value=!0;try{await e.undo()}finally{Ot.value=!1}Ft.value=t.slice(0,-1),Wt.value=[...Wt.value,e]}async function Ht(){const t=Wt.value;if(0===t.length||Ot.value)return;const e=t[t.length-1];Ot.value=!0;try{await e.redo()}finally{Ot.value=!1}Wt.value=t.slice(0,-1),Ft.value=[...Ft.value,e]}function qt(){Ft.value=[],Wt.value=[]}const Vt=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}];window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:Pt(null),currentFloor:Pt(null),canvasMode:Pt("walls"),activeTool:Pt("select"),selection:Pt({type:"none",ids:[]}),viewBox:Pt({x:0,y:0,width:1e3,height:800}),gridSize:Pt(10),snapToGrid:Pt(!0),showGrid:Pt(!0),layers:Pt(structuredClone(Vt)),lightPlacements:Pt([]),switchPlacements:Pt([]),buttonPlacements:Pt([]),otherPlacements:Pt([]),constraintConflicts:Pt(new Map),focusedRoomId:Pt(null),occupancyPanelTarget:Pt(null),devicePanelTarget:Pt(null),mmwaveCalibrationTarget:Pt(null),mmwavePlacements:Pt([]),simulatedTargets:Pt([]),simHitboxEnabled:Pt(!1),_reloadFloorData:null});const Zt=window.__inhabit_signals,Xt=Zt.currentFloorPlan,Yt=Zt.currentFloor,Kt=Zt.canvasMode,Gt=Zt.activeTool,Jt=Zt.selection,Qt=Zt.viewBox,te=Zt.gridSize,ee=Zt.snapToGrid,ie=Zt.showGrid,oe=Zt.layers,ne=Zt.lightPlacements,se=Zt.switchPlacements,re=Zt.buttonPlacements,ae=Zt.otherPlacements,le=Zt.constraintConflicts,de=Zt.focusedRoomId,ce=Zt.occupancyPanelTarget,he=Zt.devicePanelTarget,pe=Zt.mmwaveCalibrationTarget,ge=Zt.mmwavePlacements,ue=Zt.simulatedTargets,fe=Zt.simHitboxEnabled;async function _e(){Zt._reloadFloorData&&await Zt._reloadFloorData()}function me(t,e){return{code:t,message:e,severity:"warning"}}function ye(t,e){if(!t)return me("missing_entity_id","No entity is bound");const i=e[t];return i?"unavailable"===i.state?me("entity_unavailable",`${t} is unavailable`):"unknown"===i.state?me("entity_unknown",`${t} is unknown`):null:me("entity_missing",`${t} no longer exists`)}function ve(t,e){const i=ye(t.entity_id,e);return i?[i]:[]}function xe(t,e){const i=[],o=t.targets??[];if(0===o.length)return i.push(me("mmwave_no_targets","No target slots are configured")),i;for(const[t,n]of o.entries()){const o=`Target ${t+1}`;n.x_entity_id||i.push(me("mmwave_missing_x",`${o} is missing an X entity`)),n.y_entity_id||i.push(me("mmwave_missing_y",`${o} is missing a Y entity`));for(const[t,s]of[["X",n.x_entity_id],["Y",n.y_entity_id]]){if(!s)continue;const n=ye(s,e);if(n){i.push({...n,code:`mmwave_${t.toLowerCase()}_${n.code}`,message:`${o} ${t}: ${n.message}`});continue}const r=Number(e[s]?.state);Number.isFinite(r)||i.push(me(`mmwave_${t.toLowerCase()}_nonnumeric`,`${o} ${t}: ${s} is not numeric`))}}return i}function be(t,e){const i=e.x-t.x,o=e.y-t.y;return Math.sqrt(i*i+o*o)}function we(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function $e(t){const e=t.vertices;if(e.length<3)return 0;let i=0;const o=e.length;for(let t=0;t<o;t++){const n=(t+1)%o;i+=e[t].x*e[n].y,i-=e[n].x*e[t].y}return i/2}function ke(t){if(t.length<2)return{anchor:t[0]||{x:0,y:0},dir:{x:1,y:0}};let e=0,i=t[0],o=t[1];for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const r=be(t[n],t[s]);r>e&&(e=r,i=t[n],o=t[s])}if(e<1e-9)return{anchor:i,dir:{x:1,y:0}};return{anchor:i,dir:{x:(o.x-i.x)/e,y:(o.y-i.y)/e}}}function Ee(t,e,i){const o=t.x-e.x,n=t.y-e.y,s=o*i.x+n*i.y;return{x:e.x+s*i.x,y:e.y+s*i.y}}const Pe={viewing:{mode:"viewing",label:"View",icon:"mdi:home-outline",accent:"#2e7d32",tools:[],layers:["background","structure","devices"],showNormalDevices:!0,showMmwave:!0,showMmwaveCoverage:!1,showWallEditing:!1,showOpeningEditing:!1,showZoneEditing:!1,showDrawingPreview:!1},walls:{mode:"walls",label:"Rooms / Walls",icon:"mdi:wall",accent:"#455a64",tools:["wall"],layers:["background","structure","labels"],showNormalDevices:!1,showMmwave:!1,showMmwaveCoverage:!1,showWallEditing:!0,showOpeningEditing:!1,showZoneEditing:!1,showDrawingPreview:!0},openings:{mode:"openings",label:"Doors & Windows",icon:"mdi:door-open",accent:"#6d4c41",tools:["door","window"],layers:["background","structure","labels"],showNormalDevices:!1,showMmwave:!1,showMmwaveCoverage:!1,showWallEditing:!1,showOpeningEditing:!0,showZoneEditing:!1,showDrawingPreview:!0},furniture:{mode:"furniture",label:"Zones",icon:"mdi:vector-square",accent:"#00897b",tools:["zone"],layers:["background","structure","furniture","labels"],showNormalDevices:!1,showMmwave:!1,showMmwaveCoverage:!1,showWallEditing:!1,showOpeningEditing:!1,showZoneEditing:!0,showDrawingPreview:!0},placement:{mode:"placement",label:"Devices",icon:"mdi:devices",accent:"#1565c0",tools:["light","switch","button","mmwave","other"],layers:["background","structure","devices","coverage","labels"],showNormalDevices:!0,showMmwave:!0,showMmwaveCoverage:!0,showWallEditing:!1,showOpeningEditing:!1,showZoneEditing:!1,showDrawingPreview:!0},occupancy:{mode:"occupancy",label:"Occupancy",icon:"mdi:motion-sensor",accent:"#ef6c00",tools:[],layers:["background","structure","furniture","automation"],showNormalDevices:!1,showMmwave:!0,showMmwaveCoverage:!1,showWallEditing:!1,showOpeningEditing:!1,showZoneEditing:!1,showDrawingPreview:!1}};function Me(t){return Pe[t]}function Se(t,e,i=!1){return i?"background"===e||"structure"===e||"devices"===e:Me(t).layers.includes(e)}function Ie(t,e=!1){return e?{...Pe.placement,tools:[],layers:["background","structure","devices"],showNormalDevices:!1,showMmwave:!0,showMmwaveCoverage:!1,showWallEditing:!1,showOpeningEditing:!1,showZoneEditing:!1,showDrawingPreview:!1}:Me(t)}function Ce(t,e,i,o="cm"){const n=t.calibration?.enabled?t.calibration.world_transform:void 0;if(n)return{x:n.a*e+n.b*i+n.c,y:n.d*e+n.e*i+n.f};const s=function(t,e,i){const o=t.calibration;return o?.enabled?{x:e-o.raw_bias.x,y:i-o.raw_bias.y}:{x:e,y:i}}(t,e,i),r=function(t="cm"){switch(t){case"m":return.001;case"in":return 1/25.4;case"ft":return 1/304.8;default:return.1}}(o),a=s.x*r,l=s.y*r,d=t.angle*Math.PI/180,c=Math.cos(d),h=Math.sin(d);return{x:t.position.x+l*c-a*h,y:t.position.y+l*h+a*c}}function ze(t,e,i){const o=t.calibration?.enabled?t.calibration.jitter_radius:0;if(!e||!o||o<=0)return i;const n=i.x-e.x,s=i.y-e.y;if(Math.hypot(n,s)>o)return i;return{x:e.x+.25*n,y:e.y+.25*s}}function Ae(t){const e=new Map;for(const i of t)e.set(i.id,i);return e}function De(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return i&&o?{...t,startPos:{x:i.x,y:i.y},endPos:{x:o.x,y:o.y}}:null}function Te(t){const e=Ae(t.nodes),i=[];for(const o of t.edges){const t=De(o,e);t&&i.push(t)}return i}function Le(t,e){return e.filter(e=>e.start_node===t||e.end_node===t)}function Ne(t,e,i){let o=null,n=i;for(const i of e){const e=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);e<n&&(n=e,o=i)}return o}function Fe(t,e){if(0===e.length)return[];const i=new Map;for(const e of t)i.set(e.id,e);const o=new Map,n=(t,e)=>{const n=i.get(t),s=i.get(e);if(!n||!s)return;if(t===e)return;const r=Math.atan2(s.y-n.y,s.x-n.x);o.has(t)||o.set(t,[]),o.get(t).push({targetId:e,angle:r})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of o)t.sort((t,e)=>t.angle-e.angle);const s=new Set,r=[],a=(t,e)=>`${t}->${e}`;for(const[t,e]of o)for(const n of e){const e=a(t,n.targetId);if(s.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=a(d,c);if(s.has(e)){h=!1;break}s.add(e),l.push(d);const r=i.get(d),p=i.get(c),g=Math.atan2(r.y-p.y,r.x-p.x),u=o.get(c);if(!u||0===u.length){h=!1;break}let f=null;for(const t of u)if(t.angle>g){f=t;break}if(f||(f=u[0]),d=c,c=f.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&r.push(l.map(t=>{const e=i.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of r){const e=We(t),i=Math.abs(e);if(i<100)continue;if(e>0)continue;const o=Oe(t);l.push({vertices:t,area:i,centroid:o})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}function We(t){let e=0;const i=t.length;for(let o=0;o<i;o++){const n=(o+1)%i;e+=t[o].x*t[n].y,e-=t[n].x*t[o].y}return e/2}function Oe(t){const e=t.length;if(e<3){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}let i=0,o=0,n=0;for(let s=0;s<e;s++){const r=(s+1)%e,a=t[s].x*t[r].y-t[r].x*t[s].y;i+=a,o+=(t[s].x+t[r].x)*a,n+=(t[s].y+t[r].y)*a}if(i/=2,Math.abs(i)<1e-6){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}const s=1/(6*i);return{x:o*s,y:n*s}}const Re=.5;function Be(t){return Number.isFinite(t.x)&&Number.isFinite(t.y)}function Ue(t,e){return Math.hypot(e.x-t.x,e.y-t.y)}function je(t){return Number.isFinite(t)&&t>0?t:6}function He(t,e,i){return Math.abs(t.x-e.x)<=i&&Math.abs(t.y-e.y)<=i}function qe(t){const e=t.vertices;if(0===e.length)return"";const i=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return`${i.join(" ")} Z`}function Ve(t){const e=t.filter(t=>"wall"===t.type&&Be(t.startPos)&&Be(t.endPos)&&Ue(t.startPos,t.endPos)>=Re);if(0===e.length)return[];const i=new Map;for(const t of e)for(const e of[t.start_node,t.end_node])i.has(e)||i.set(e,[]),i.get(e).push(t);const o=new Set,n=[],s=t=>({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),r=(t,e)=>{const n=(i.get(t)??[]).filter(t=>t.id!==e.id&&!o.has(t.id)&&function(t,e){return Math.abs(je(t)-je(e))<=.01}(t.thickness,e.thickness));if(2!==(i.get(t)??[]).length||1!==n.length)return null;const r=n[0];return r.start_node===t?r:s(r)},a=(t,e)=>{for(;t.length>0;){const i="forward"===e?t[t.length-1]:t[0],n="forward"===e?i.end_node:i.start_node,a=r(n,i);if(!a)return;o.add(a.id),"forward"===e?t.push(a):t.unshift(s(a))}};for(const t of e){if(o.has(t.id))continue;const e=[t];o.add(t.id),a(e,"forward"),a(e,"backward"),n.push(e)}return n}function Ze(t){if(0===t.length)return"";const e=t.filter(t=>Be(t.start)&&Be(t.end)&&Ue(t.start,t.end)>=Re);if(0===e.length)return"";const i=je(e[0].thickness),o=i/2,n=[{...e[0].start}];for(const t of e){const e=t.end;He(n[n.length-1],e,Re)||n.push({...e})}const s=n.length>2&&He(n[0],n[n.length-1],1);if(s&&(n[n.length-1]={...n[0]}),n.length<2)return"";if(2===n.length)return function(t,e,i){if(!Be(t)||!Be(e))return"";const o=e.x-t.x,n=e.y-t.y,s=Math.sqrt(o*o+n*n);if(s<Re)return"";const r=je(i),a=-n/s*(r/2),l=o/s*(r/2);return`M${t.x+a},${t.y+l}\n          L${e.x+a},${e.y+l}\n          L${e.x-a},${e.y-l}\n          L${t.x-a},${t.y-l}\n          Z`}(n[0],n[1],i);const r=[],a=[];for(let t=0;t<n.length;t++){const e=n[t];let i,l=null,d=null;if(t>0||s){const i=n[t>0?t-1:n.length-2],o=e.x-i.x,s=e.y-i.y,r=Math.sqrt(o*o+s*s);r>=Re&&(l={x:o/r,y:s/r})}if(t<n.length-1||s){const i=n[t<n.length-1?t+1:1],o=i.x-e.x,s=i.y-e.y,r=Math.sqrt(o*o+s*s);r>=Re&&(d={x:o/r,y:s/r})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},o=t.x+e.x,n=t.y+e.y,s=Math.sqrt(o*o+n*n);if(s<.01)i=t;else{i={x:o/s,y:n/s};const e=t.x*i.x+t.y*i.y;if(Number.isFinite(e)&&Math.abs(e)>.1){const t=1/e,o=Math.min(Math.abs(t),3)*Math.sign(t);i={x:i.x*o,y:i.y*o}}}}else i=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};Be(i)||(i={x:1,y:0}),r.push({x:e.x+i.x*o,y:e.y+i.y*o}),a.push({x:e.x-i.x*o,y:e.y-i.y*o})}const l=Math.min(.8*o,4);let d=`M${r[0].x},${r[0].y}`;for(let t=1;t<r.length;t++)if(t<r.length-1&&r.length>2){const e=r[t-1],i=r[t],o=r[t+1],n=i.x-e.x,s=i.y-e.y,a=Math.sqrt(n*n+s*s),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(l,a/2),u=Math.min(l,p/2);if(a>0&&p>0){const t=i.x-n/a*g,e=i.y-s/a*g,o=i.x+c/p*u,r=i.y+h/p*u;d+=` L${t},${e} Q${i.x},${i.y} ${o},${r}`}else d+=` L${i.x},${i.y}`}else d+=` L${r[t].x},${r[t].y}`;const c=[...a].reverse();if(s){d+=` L${a[a.length-1].x},${a[a.length-1].y}`;for(let t=a.length-2;t>=0;t--){const e=a.length-1-t;if(e>0&&e<a.length-1){const e=a[t+1],i=a[t],o=a[t-1],n=i.x-e.x,s=i.y-e.y,r=Math.sqrt(n*n+s*s),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(l,r/2),u=Math.min(l,p/2);if(r>0&&p>0){const t=i.x-n/r*g,e=i.y-s/r*g,o=i.x+c/p*u,a=i.y+h/p*u;d+=` L${t},${e} Q${i.x},${i.y} ${o},${a}`}else d+=` L${i.x},${i.y}`}else d+=` L${a[t].x},${a[t].y}`}}else for(let t=0;t<c.length;t++)if(t>0&&t<c.length-1&&c.length>2){const e=c[t-1],i=c[t],o=c[t+1],n=i.x-e.x,s=i.y-e.y,r=Math.sqrt(n*n+s*s),a=o.x-i.x,h=o.y-i.y,p=Math.sqrt(a*a+h*h),g=Math.min(l,r/2),u=Math.min(l,p/2);if(r>0&&p>0){const t=i.x-n/r*g,e=i.y-s/r*g,o=i.x+a/p*u,l=i.y+h/p*u;d+=` L${t},${e} Q${i.x},${i.y} ${o},${l}`}else d+=` L${i.x},${i.y}`}else d+=` L${c[t].x},${c[t].y}`;return d+=" Z",d}const Xe=.05,Ye=.2,Ke="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),Ge="%c[constraint]",Je="color:#8b5cf6;font-weight:bold",Qe="color:#888",ti="color:#ef4444;font-weight:bold",ei="color:#22c55e;font-weight:bold";function ii(t){return`(${t.x.toFixed(1)},${t.y.toFixed(1)})`}function oi(t,e){const i=e.get(t.start_node),o=e.get(t.end_node),n=[];"free"!==t.direction&&n.push(t.direction),t.length_locked&&n.push("len🔒"),t.angle_group&&n.push(`ang:${t.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=i&&o?be(i,o).toFixed(1):"?";return`${t.id.slice(0,8)}… (${r}cm${s})`}function ni(t){return`${t.slice(0,8)}…`}function si(t,e){const i=new Map,o=new Map,n=new Map;for(const e of t)i.set(e.id,e);for(const t of e)o.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:i,edges:o,nodeToEdges:n}}function ri(t){return"free"!==t.direction||t.length_locked}function ai(t){const e=new Map;for(const[i,o]of t.nodes)e.set(i,{x:o.x,y:o.y});return e}function li(t,e,i,o,n){let s={x:o.x,y:o.y};if("horizontal"===t.direction?s={x:s.x,y:i.y}:"vertical"===t.direction&&(s={x:i.x,y:s.y}),t.length_locked){const e=be(n.nodes.get(t.start_node),n.nodes.get(t.end_node)),o=s.x-i.x,r=s.y-i.y,a=Math.sqrt(o*o+r*r);if(a>0&&e>0){const t=e/a;s={x:i.x+o*t,y:i.y+r*t}}}return s}function di(t,e,i,o,n){const s=o.has(t.start_node),r=o.has(t.end_node);if(s&&r)return{idealStart:e,idealEnd:i};if(s){return{idealStart:e,idealEnd:li(t,t.start_node,e,i,n)}}if(r){return{idealStart:li(t,t.end_node,i,e,n),idealEnd:i}}return function(t,e,i,o){const n=be(o.nodes.get(t.start_node),o.nodes.get(t.end_node));let s={x:e.x,y:e.y},r={x:i.x,y:i.y};if("horizontal"===t.direction){const t=(s.y+r.y)/2;s={x:s.x,y:t},r={x:r.x,y:t}}else if("vertical"===t.direction){const t=(s.x+r.x)/2;s={x:t,y:s.y},r={x:t,y:r.y}}if(t.length_locked){const t=(s.x+r.x)/2,e=(s.y+r.y)/2,i=r.x-s.x,o=r.y-s.y,a=Math.sqrt(i*i+o*o);if(a>0&&n>0){const l=n/2/(a/2);s={x:t-i/2*l,y:e-o/2*l},r={x:t+i/2*l,y:e+o/2*l}}}return{idealStart:s,idealEnd:r}}(t,e,i,n)}function ci(t,e){let i=0;const o=[],n=new Map;for(const[s,r]of t.edges){if(!ri(r))continue;const a=e.get(r.start_node),l=e.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const e=be(t.nodes.get(r.start_node),t.nodes.get(r.end_node)),i=be(a,l);d=Math.max(d,Math.abs(i-e))}n.set(s,d),d>Ye&&o.push(s),d>i&&(i=d)}const s=pi(t,e);for(const[,r]of s){let s=0;for(const t of r.nodeIds){const i=e.get(t);if(!i)continue;const o=be(i,Ee(i,r.anchor,r.dir));s=Math.max(s,o)}for(const[e,i]of t.edges)if(i.collinear_group&&r.nodeIds.has(i.start_node)){const t=n.get(e)??0;n.set(e,Math.max(t,s)),s>Ye&&(o.includes(e)||o.push(e));break}i=Math.max(i,s)}const r=gi(t);for(const[,s]of r){const r=e.get(s.sharedNodeId);if(!r)continue;let a=0;for(let i=0;i<s.edgeIds.length;i++){const o=t.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=e.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=be(r,l);for(let o=i+1;o<s.edgeIds.length;o++){const i=t.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=e.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let p=d-h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;const g=(c+be(r,l))/2;a=Math.max(a,Math.abs(p)*g)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>Ye&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}const a=fi(t);for(const[,s]of a){const r=[];for(const i of s.edgeIds){const o=t.edges.get(i),n=e.get(o.start_node),s=e.get(o.end_node);n&&s?r.push(be(n,s)):r.push(0)}let a=0;for(const t of r)a=Math.max(a,Math.abs(t-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>Ye&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}return{maxViolation:i,violatingEdgeIds:o,magnitudes:n}}function hi(t,e,i,o){const n=function(t,e){const i=[],o=new Set,n=new Set,s=[];for(const t of e)s.push(t),n.add(t);for(;s.length>0;){const e=s.shift(),r=t.nodeToEdges.get(e)||[];for(const{edgeId:a}of r){if(o.has(a))continue;o.add(a);const r=t.edges.get(a);if(!r)continue;i.push(r);const l=r.start_node===e?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return i}(t,e),s=n.filter(ri),r=pi(t,i),a=gi(t),l=fi(t);let d=0,c=0;Ke&&(console.groupCollapsed(`${Ge} solveIterative: %c%d constrained edges, %d pinned nodes`,Je,Qe,s.length,e.size),console.log("  Pinned nodes:",[...e].map(ni).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(e=>oi(e,t.nodes)).join(" | ")||"(none)"),o&&o.size>0&&console.log("  Pre-existing violations:",[...o.entries()].map(([e,i])=>{const o=t.edges.get(e);return(o?oi(o,t.nodes):`${e.slice(0,8)}…`)+` (${i.toFixed(2)})`}).join(" | ")));for(let o=0;o<100;o++){d=0,c=o+1;const s=0===o?new Set(e):e;for(const r of n){if(!ri(r))continue;const n=i.get(r.start_node),a=i.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=di(r,n,a,s,t);if(!e.has(r.start_node)){const t=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,t),i.set(r.start_node,l)}if(!e.has(r.end_node)){const t=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,t),i.set(r.end_node,c)}0===o&&(s.add(r.start_node),s.add(r.end_node))}for(const[,t]of r)for(const o of t.nodeIds){if(e.has(o))continue;const n=i.get(o);if(!n)continue;const s=Ee(n,t.anchor,t.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>Xe&&(d=Math.max(d,r),i.set(o,s))}const h=ui(t,a,e,i);d=Math.max(d,h);const p=_i(t,l,e,i);if(d=Math.max(d,p),d<Xe)break}const h=[];for(const[e,o]of i){const i=t.nodes.get(e);(Math.abs(o.x-i.x)>Xe||Math.abs(o.y-i.y)>Xe)&&h.push({nodeId:e,x:o.x,y:o.y})}if(d<Xe)Ke&&console.log(`${Ge} %cConverged%c in %d iteration(s), %d node(s) moved`,Je,ei,"",c,h.length);else{const{violatingEdgeIds:e,maxViolation:n,magnitudes:s}=ci(t,i),r=[];for(const t of e)if(o){const e=o.get(t);if(void 0===e)r.push(t);else{(s.get(t)??0)>e+Xe&&r.push(t)}}else r.push(t);if(r.length>0)return Ke&&(console.log(`${Ge} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,Je,ti,""),console.log("  All violating edges:",e.map(e=>{const i=t.edges.get(e);return i?oi(i,t.nodes):`${e.slice(0,8)}…`}).join(" | ")),console.log("  NEW violations (blocking):",r.map(e=>{const o=t.edges.get(e);if(!o)return`${e.slice(0,8)}…`;const n=i.get(o.start_node),s=i.get(o.end_node),r=n&&s?` now ${ii(n)}→${ii(s)}`:"";return oi(o,t.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};Ke&&console.log(`${Ge} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,Je,"color:#f59e0b;font-weight:bold","")}return Ke&&console.groupEnd(),{updates:h,blocked:!1}}function pi(t,e){const i=new Map,o=new Map;for(const[,e]of t.edges){if(!e.collinear_group)continue;o.has(e.collinear_group)||o.set(e.collinear_group,new Set);const t=o.get(e.collinear_group);t.add(e.start_node),t.add(e.end_node)}for(const[t,n]of o){const o=[];for(const t of n){const i=e.get(t);i&&o.push(i)}if(o.length<2)continue;const{anchor:s,dir:r}=ke(o);i.set(t,{nodeIds:n,anchor:s,dir:r})}return i}function gi(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.angle_group&&(i.has(e.angle_group)||i.set(e.angle_group,[]),i.get(e.angle_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;const i=n.map(e=>t.edges.get(e)),s=new Map;for(const t of i)s.set(t.start_node,(s.get(t.start_node)??0)+1),s.set(t.end_node,(s.get(t.end_node)??0)+1);let r=null;for(const[t,e]of s)if(e===n.length){r=t;break}if(!r)continue;const a=t.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const e of i){const i=e.start_node===r?e.end_node:e.start_node,o=t.nodes.get(i);if(!o){d=!1;break}l.push(Math.atan2(o.y-a.y,o.x-a.x))}d&&e.set(o,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return e}function ui(t,e,i,o){let n=0;for(const[,s]of e){const e=o.get(s.sharedNodeId);if(!e)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let i=0;i<r;i++){const n=t.edges.get(s.edgeIds[i]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=o.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-e.y,h.x-e.x))}if(!c)continue;const h=[];for(let t=0;t<r;t++){let e=d[t]-s.originalAngles[t];for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;h.push(e)}const p=a.map(t=>i.has(t)),g=p.filter(Boolean).length;if(g===r)continue;let u=0,f=0;if(g>0)for(let t=0;t<r;t++)p[t]&&(u+=Math.sin(h[t]),f+=Math.cos(h[t]));else for(let t=0;t<r;t++)u+=Math.sin(h[t]),f+=Math.cos(h[t]);const _=Math.atan2(u,f);for(let t=0;t<r;t++){if(p[t])continue;const i=s.originalAngles[t]+_,r=be(e,l[t]),d={x:e.x+Math.cos(i)*r,y:e.y+Math.sin(i)*r},c=Math.max(Math.abs(d.x-l[t].x),Math.abs(d.y-l[t].y));n=Math.max(n,c),o.set(a[t],d)}}return n}function fi(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.link_group&&(i.has(e.link_group)||i.set(e.link_group,[]),i.get(e.link_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;let i=0;for(const e of n){const o=t.edges.get(e);i+=be(t.nodes.get(o.start_node),t.nodes.get(o.end_node))}e.set(o,{edgeIds:n,targetLength:i/n.length})}return e}function _i(t,e,i,o){let n=0;for(const[,s]of e)for(const e of s.edgeIds){const r=t.edges.get(e),a=o.get(r.start_node),l=o.get(r.end_node);if(!a||!l)continue;const d=be(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=Xe)continue;const c=i.has(r.start_node),h=i.has(r.end_node);if(c&&h)continue;const p=l.x-a.x,g=l.y-a.y,u=s.targetLength/d;if(c){const t={x:a.x+p*u,y:a.y+g*u},e=Math.max(Math.abs(t.x-l.x),Math.abs(t.y-l.y));n=Math.max(n,e),o.set(r.end_node,t)}else if(h){const t={x:l.x-p*u,y:l.y-g*u},e=Math.max(Math.abs(t.x-a.x),Math.abs(t.y-a.y));n=Math.max(n,e),o.set(r.start_node,t)}else{const t=(a.x+l.x)/2,e=(a.y+l.y)/2,i=s.targetLength/2/(d/2),c={x:t-p/2*i,y:e-g/2*i},h={x:t+p/2*i,y:e+g/2*i},u=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),o.set(r.start_node,c),o.set(r.end_node,h)}}return n}function mi(t,e,i,o){let n=i,s=o;const r=function(t,e){const i=t.nodeToEdges.get(e);if(!i)return null;for(const{edgeId:e}of i){const i=t.edges.get(e);if(i?.collinear_group)return i.collinear_group}return null}(t,e);if(r){const e=function(t,e){const i=new Set;for(const[,o]of t.edges)o.collinear_group===e&&(i.add(o.start_node),i.add(o.end_node));return i}(t,r),a=[];for(const i of e){const e=t.nodes.get(i);e&&a.push({x:e.x,y:e.y})}if(a.length>=2){const{anchor:t,dir:e}=ke(a),r=Ee({x:i,y:o},t,e);n=r.x,s=r.y}}const a=ai(t),{magnitudes:l}=ci(t,a),d=ai(t);d.set(e,{x:n,y:s});const c=new Set([e]);for(const[i,o]of t.nodes)o.pinned&&i!==e&&c.add(i);const h=hi(t,c,d,l),p=h.updates.some(t=>t.nodeId===e);if(!p){const i=t.nodes.get(e);i.x===n&&i.y===s||h.updates.unshift({nodeId:e,x:n,y:s})}const g=h.updates.find(t=>t.nodeId===e);if(g&&(g.x=n,g.y=s),h.updates=h.updates.filter(i=>i.nodeId===e||!t.nodes.get(i.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:e,magnitudes:i}=ci(t,d),o=[];for(const t of e){const e=l.get(t);if(void 0===e)o.push(t);else{(i.get(t)??0)>e+Xe&&o.push(t)}}o.length>0&&(h.blocked=!0,h.blockedBy=o)}return h}function yi(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};if(Ke&&console.log(`${Ge} solveEdgeLengthChange: %c%s → %scm`,Je,Qe,oi(o,t.nodes),i.toFixed(1)),o.length_locked)return Ke&&console.log(`${Ge} %c→ BLOCKED: edge is length-locked`,Je,ti),{updates:[],blocked:!0,blockedBy:[o.id]};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===be(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return Math.atan2(o.y-i.y,o.x-i.x)}(o,t.nodes),d=i/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},p=ai(t);p.set(o.start_node,c),p.set(o.end_node,h);const g=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&g.add(e);const u=hi(t,g,p);return u.updates.some(t=>t.nodeId===o.start_node)||u.updates.unshift({nodeId:o.start_node,x:c.x,y:c.y}),u.updates.some(t=>t.nodeId===o.end_node)||u.updates.push({nodeId:o.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function vi(t){const e=new Map;for(const i of t)e.set(i.nodeId,{x:i.x,y:i.y});return e}function xi(t,e,i,o,n){const s=mi(si(t,e),i,o,n);return{positions:vi(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function bi(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);Ke&&(console.group(`${Ge} solveConstraintSnap: %csnap %s → %s`,Je,Qe,oi(o,t.nodes),i),console.log(`  Nodes: ${ni(o.start_node)} ${ii(n)} → ${ni(o.end_node)} ${ii(s)}`));const r=function(t,e,i){if("free"===e)return null;const o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=be(o,n)/2;if("horizontal"===e){if(Math.round(o.y)===Math.round(n.y))return null;const e=o.x<=n.x;return{nodeUpdates:[{nodeId:t.start_node,x:e?s-a:s+a,y:r},{nodeId:t.end_node,x:e?s+a:s-a,y:r}]}}if("vertical"===e){if(Math.round(o.x)===Math.round(n.x))return null;const e=o.y<=n.y;return{nodeUpdates:[{nodeId:t.start_node,x:s,y:e?r-a:r+a},{nodeId:t.end_node,x:s,y:e?r+a:r-a}]}}return null}(o,i,t.nodes);if(!r)return Ke&&(console.log(`${Ge} %cAlready satisfies %s — no-op`,Je,ei,i),console.groupEnd()),{updates:[],blocked:!1};const a=ai(t),{magnitudes:l}=ci(t,a),d=r.nodeUpdates.find(t=>t.nodeId===o.start_node),c=r.nodeUpdates.find(t=>t.nodeId===o.end_node);Ke&&console.log(`  Snap target: ${ni(o.start_node)} ${ii(d)} → ${ni(o.end_node)} ${ii(c)}`);const h=ai(t);h.set(o.start_node,{x:d.x,y:d.y}),h.set(o.end_node,{x:c.x,y:c.y});const p=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&p.add(e);const g=hi(t,p,h,l);return g.updates.some(t=>t.nodeId===o.start_node)||g.updates.unshift({nodeId:o.start_node,x:d.x,y:d.y}),g.updates.some(t=>t.nodeId===o.end_node)||g.updates.push({nodeId:o.end_node,x:c.x,y:c.y}),g.updates=g.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),Ke&&(g.blocked?console.log(`${Ge} %c→ SNAP BLOCKED by: %s`,Je,ti,(g.blockedBy||[]).map(e=>{const i=t.edges.get(e);return i?oi(i,t.nodes):`${e.slice(0,8)}…`}).join(" | ")):console.log(`${Ge} %c→ Snap OK%c, %d node(s) to update`,Je,ei,"",g.updates.length),console.groupEnd()),g}function wi(t,e,i=.2){const o=new Map;for(const e of t)o.set(e.id,e);const n=[];for(const t of e){const e=o.get(t.start_node),s=o.get(t.end_node);if(e&&s)if("horizontal"===t.direction){const o=Math.abs(e.y-s.y);o>i&&n.push({edgeId:t.id,type:"direction",expected:0,actual:o})}else if("vertical"===t.direction){const o=Math.abs(e.x-s.x);o>i&&n.push({edgeId:t.id,type:"direction",expected:0,actual:o})}}const s=new Map,r=new Map;for(const t of e)t.collinear_group&&(s.has(t.collinear_group)||(s.set(t.collinear_group,new Set),r.set(t.collinear_group,t.id)),s.get(t.collinear_group).add(t.start_node),s.get(t.collinear_group).add(t.end_node));for(const[t,e]of s){const s=[];for(const t of e){const e=o.get(t);e&&s.push({x:e.x,y:e.y})}if(s.length<2)continue;const{anchor:a,dir:l}=ke(s);let d=0;for(const t of s){const e=Ee(t,a,l);d=Math.max(d,be(t,e))}d>i&&n.push({edgeId:r.get(t),type:"collinear",expected:0,actual:d})}const a=new Map;for(const t of e)t.link_group&&(a.has(t.link_group)||a.set(t.link_group,[]),a.get(t.link_group).push(t.id));for(const[,t]of a){if(t.length<2)continue;const s=[];for(const i of t){const t=e.find(t=>t.id===i),n=o.get(t.start_node),r=o.get(t.end_node);n&&r?s.push(be(n,r)):s.push(0)}const r=s.reduce((t,e)=>t+e,0)/s.length;let a=0;for(const t of s)a=Math.max(a,Math.abs(t-r));a>i&&n.push({edgeId:t[0],type:"link_group",expected:r,actual:a})}return n}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $i=2;let ki=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:Ei}=rt,Pi=t=>t,Mi=()=>document.createComment(""),Si=(t,e,i)=>{const o=t._$AA.parentNode,n=void 0===e?t._$AB:e._$AA;if(void 0===i){const e=o.insertBefore(Mi(),n),s=o.insertBefore(Mi(),n);i=new Ei(e,s,t,t.options)}else{const e=i._$AB.nextSibling,s=i._$AM,r=s!==t;if(r){let e;i._$AQ?.(t),i._$AM=t,void 0!==i._$AP&&(e=t._$AU)!==s._$AU&&i._$AP(e)}if(e!==n||r){let t=i._$AA;for(;t!==e;){const e=Pi(t).nextSibling;Pi(o).insertBefore(t,n),t=e}}}return i},Ii=(t,e,i=t)=>(t._$AI(e,i),t),Ci={},zi=(t,e=Ci)=>t._$AH=e,Ai=t=>{t._$AR(),t._$AA.remove()},Di=(t,e,i)=>{const o=new Map;for(let n=e;n<=i;n++)o.set(t[n],n);return o},Ti=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends ki{constructor(t){if(super(t),t.type!==$i)throw Error("repeat() can only be used in text expressions")}dt(t,e,i){let o;void 0===i?i=e:void 0!==e&&(o=e);const n=[],s=[];let r=0;for(const e of t)n[r]=o?o(e,r):r,s[r]=i(e,r),r++;return{values:s,keys:n}}render(t,e,i){return this.dt(t,e,i).values}update(t,[e,i,o]){const n=(t=>t._$AH)(t),{values:s,keys:r}=this.dt(e,i,o);if(!Array.isArray(n))return this.ut=r,s;const a=this.ut??=[],l=[];let d,c,h=0,p=n.length-1,g=0,u=s.length-1;for(;h<=p&&g<=u;)if(null===n[h])h++;else if(null===n[p])p--;else if(a[h]===r[g])l[g]=Ii(n[h],s[g]),h++,g++;else if(a[p]===r[u])l[u]=Ii(n[p],s[u]),p--,u--;else if(a[h]===r[u])l[u]=Ii(n[h],s[u]),Si(t,l[u+1],n[h]),h++,u--;else if(a[p]===r[g])l[g]=Ii(n[p],s[g]),Si(t,n[h],n[p]),p--,g++;else if(void 0===d&&(d=Di(r,g,u),c=Di(a,h,p)),d.has(a[h]))if(d.has(a[p])){const e=c.get(r[g]),i=void 0!==e?n[e]:null;if(null===i){const e=Si(t,n[h]);Ii(e,s[g]),l[g]=e}else l[g]=Ii(i,s[g]),Si(t,n[h],i),n[e]=null;g++}else Ai(n[p]),p--;else Ai(n[h]),h++;for(;g<=u;){const e=Si(t,l[u+1]);Ii(e,s[g]),l[g++]=e}for(;h<=p;){const t=n[h++];null!==t&&Ai(t)}return this.ut=r,zi(t,l),V}});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Li(t){return"string"==typeof t&&t.startsWith("fp_")&&(t.endsWith("_occupancy")||t.endsWith("_occupancy_override"))}function Ni(t,e,i){return i.has(t)||Li(e.attributes?.unique_id)}let Fi=null,Wi=null;function Oi(){return Fi}async function Ri(t){if(Fi)return Fi;Wi??=t.callWS({type:"config/entity_registry/list"}).then(t=>new Set(t.filter(t=>function(t){return"inhabit"===t.platform||Li(t.unique_id)}(t)).map(t=>t.entity_id)));try{return Fi=await Wi,Fi}catch(t){throw Wi=null,t}}class Bi extends dt{constructor(){super(...arguments),this.domains=[],this.exclude=[],this.excludeDomains=[],this.numericOnly=!1,this.multi=!1,this.title="Select Entity",this.placeholder="Search entities...",this._search="",this._staged=new Set,this._integrationEntityIds=Oi()??new Set,this._registryLoadComplete=null!==Oi(),this._registryLoadStarted=!1}static{this.styles=r`
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
      border-radius: 16px;
      width: 420px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 20px;
    }

    .close-btn:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .search-container {
      padding: 12px 16px 8px;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--primary-color);
    }

    .result-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px;
      min-height: 120px;
      max-height: 360px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 8px;
      color: var(--primary-text-color);
      text-align: left;
      width: 100%;
      transition: background 0.1s;
    }

    .result-item:hover {
      background: var(--secondary-background-color);
    }

    .result-item.selected {
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    }

    .result-item .check {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--divider-color, #ccc);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.1s, background 0.1s;
    }

    .result-item.selected .check {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .check-mark {
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
    }

    .result-item .text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
    }

    .result-item .name {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-item .eid {
      color: var(--secondary-text-color);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-state {
      padding: 24px 12px;
      text-align: center;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .footer-btn {
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .cancel-btn {
      background: none;
      color: var(--secondary-text-color);
    }

    .cancel-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .confirm-btn {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .confirm-btn:hover {
      opacity: 0.9;
    }

    .confirm-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      .overlay {
        align-items: flex-end;
      }

      .dialog {
        width: 100vw;
        max-width: 100vw;
        max-height: min(82vh, 680px);
        border-radius: 20px 20px 0 0;
        padding-bottom: env(safe-area-inset-bottom);
      }

      .dialog-header {
        padding: 14px 16px 10px;
      }

      .close-btn {
        min-width: 44px;
        min-height: 44px;
      }

      .search-container {
        padding: 10px 16px;
      }

      .search-input {
        min-height: 44px;
        font-size: 16px;
      }

      .result-list {
        max-height: min(56vh, 420px);
        padding: 6px 10px;
      }

      .result-item {
        min-height: 54px;
        padding: 10px 12px;
        border-radius: 12px;
      }

      .dialog-footer {
        padding: 12px 16px;
      }

      .footer-btn {
        min-height: 44px;
      }
    }
  `}firstUpdated(){requestAnimationFrame(()=>this._input?.focus()),this._loadIntegrationEntities()}updated(t){t.has("hass")&&this.hass&&!this._registryLoadStarted&&!this._registryLoadComplete&&this._loadIntegrationEntities()}async _loadIntegrationEntities(){if(!this.hass||this._registryLoadStarted||this._registryLoadComplete)return;this._registryLoadStarted=!0;const t=Oi();if(t)return this._integrationEntityIds=t,void(this._registryLoadComplete=!0);try{this._integrationEntityIds=await Ri(this.hass)}catch(t){console.warn("Failed to load entity registry for Inhabit filter:",t)}finally{this._registryLoadComplete=!0}}_getIcon(t){if(t.startsWith("binary_sensor.")){const e=this.hass?.states[t],i=e?.attributes?.device_class??"";return"motion"===i?"mdi:motion-sensor":"occupancy"===i?"mdi:account-eye":"door"===i?"mdi:door":"window"===i?"mdi:window-closed":"presence"===i?"mdi:account-eye":"mdi:checkbox-blank-circle-outline"}return t.startsWith("event.")?"mdi:bell-ring":t.startsWith("button.")||t.startsWith("input_button.")?"mdi:gesture-tap-button":t.startsWith("switch.")||t.startsWith("input_boolean.")?"mdi:toggle-switch":t.startsWith("light.")?"mdi:lightbulb":t.startsWith("sensor.")?"mdi:eye":"mdi:ray-vertex"}_scoreMatch(t,e){if(0===e.length)return 1;const i=t.friendly_name.toLowerCase(),o=t.entity_id.toLowerCase();let n=0;for(const t of e){const e=i.indexOf(t),s=o.indexOf(t);if(-1===e&&-1===s)return-1;0===e||e>0&&" "===i[e-1]?n+=3:e>=0&&(n+=2),0===s||s>0&&("."===o[s-1]||"_"===o[s-1])?n+=3:s>=0&&(n+=1)}return n}_getFilteredEntities(){if(!this.hass)return[];const t=new Set(this.exclude),e=new Set(this.domains),i=new Set(this.excludeDomains),o=this._search.toLowerCase().split(/\s+/).filter(Boolean),n=[];for(const s of Object.keys(this.hass.states)){const r=this.hass.states[s];if(!r)continue;if(Ni(s,r,this._integrationEntityIds))continue;if(t.has(s))continue;const a=s.split(".")[0];if(e.size>0&&!e.has(a))continue;if(i.size>0&&i.has(a))continue;if(this.numericOnly){const t=r.state;if(Number.isNaN(parseFloat(t))||!Number.isFinite(Number(t)))continue}const l={entity_id:s,friendly_name:String(r.attributes?.friendly_name??s),domain:a},d=this._scoreMatch(l,o);d>=0&&n.push({...l,score:d})}return n.sort((t,e)=>{if(this.multi){const i=this._staged.has(t.entity_id)?1:0,o=this._staged.has(e.entity_id)?1:0;if(i!==o)return o-i}return e.score-t.score||t.friendly_name.localeCompare(e.friendly_name)||t.entity_id.localeCompare(e.entity_id)}),n.slice(0,50)}_toggleStaged(t){const e=new Set(this._staged);e.has(t)?e.delete(t):e.add(t),this._staged=e}_onItemClick(t){this.multi?this._toggleStaged(t):this._confirm([t])}_confirm(t){this.dispatchEvent(new CustomEvent("entities-confirmed",{detail:{entityIds:t},bubbles:!0,composed:!0})),this._close()}_close(){this._search="",this._staged=new Set,this.dispatchEvent(new CustomEvent("picker-closed",{bubbles:!0,composed:!0}))}_onOverlayClick(t){t.target.classList.contains("overlay")&&this._close()}render(){const t=this._getFilteredEntities(),e=this._staged.size;return H`
      <div class="overlay" @click=${this._onOverlayClick} @keydown=${t=>{"Escape"===t.key&&this._close()}}>
        <div class="dialog">
          <div class="dialog-header">
            <h3>${this.title}</h3>
            <button class="close-btn" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="search-container">
            <input
              class="search-input"
              type="text"
              .placeholder=${this.placeholder}
              .value=${this._search}
              @input=${t=>{this._search=t.target.value}}
              @keydown=${t=>{"Escape"===t.key&&this._close()}}
            />
          </div>

          <div class="result-list">
            ${t.length>0?Ti(t,t=>t.entity_id,t=>{const e=this._staged.has(t.entity_id);return H`
                <button
                  class="result-item ${e?"selected":""}"
                  @click=${()=>this._onItemClick(t.entity_id)}
                >
                  ${this.multi?H`
                    <div class="check">
                      ${e?H`<span class="check-mark">✓</span>`:Z}
                    </div>
                  `:H`
                    <ha-icon icon=${this._getIcon(t.entity_id)} style="--mdc-icon-size: 18px;"></ha-icon>
                  `}
                  <div class="text">
                    <span class="name">${t.friendly_name}</span>
                    <span class="eid">${t.entity_id}</span>
                  </div>
                </button>
              `}):H`
              <div class="empty-state">
                ${this._search?"No matching entities":"No entities available"}
              </div>
            `}
          </div>

          ${this.multi?H`
            <div class="dialog-footer">
              <button class="footer-btn cancel-btn" @click=${this._close}>Cancel</button>
              <button
                class="footer-btn confirm-btn"
                ?disabled=${0===e}
                @click=${()=>this._confirm([...this._staged])}
              >
                Add${e>0?` (${e})`:""}
              </button>
            </div>
          `:Z}
        </div>
      </div>
    `}}t([gt({attribute:!1})],Bi.prototype,"hass",void 0),t([gt({type:Array})],Bi.prototype,"domains",void 0),t([gt({type:Array})],Bi.prototype,"exclude",void 0),t([gt({type:Array})],Bi.prototype,"excludeDomains",void 0),t([gt({type:Boolean})],Bi.prototype,"numericOnly",void 0),t([gt({type:Boolean})],Bi.prototype,"multi",void 0),t([gt({type:String})],Bi.prototype,"title",void 0),t([gt({type:String})],Bi.prototype,"placeholder",void 0),t([ut()],Bi.prototype,"_search",void 0),t([ut()],Bi.prototype,"_staged",void 0),t([ut()],Bi.prototype,"_integrationEntityIds",void 0),t([ut()],Bi.prototype,"_registryLoadComplete",void 0),t([ft(".search-input")],Bi.prototype,"_input",void 0),customElements.define("fpb-entity-picker",Bi);const Ui=85*Math.PI/180;function ji(t,e,i,o,n,s){const r=n*Math.PI/180,a=s?1:-1,l=Math.cos(r),d=a*Math.sin(r),c=i-t,h=o-e,p=t+l*c-d*h,g=e+d*c+l*h,u=p-t,f=g-e,_=a*(4/3)*Math.tan(r/4);return{ox:p,oy:g,cp1x:i-_*h,cp1y:o+_*c,cp2x:p+_*f,cp2y:g-_*u}}const Hi=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function qi(t){let e=0;for(let i=0;i<t.length;i++)e=(e<<5)-e+t.charCodeAt(i);return Hi[Math.abs(e)%Hi.length]}class Vi extends dt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._spaceHeld=!1,this._panStart={x:0,y:0},this._activePointers=new Map,this._pinchStartDist=0,this._pinchStartMid={x:0,y:0},this._pinchStartViewBox=null,this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._iconCache=new Map,this._iconLoaders=new Map,this._stateIconCache=new Map,this._stateIconLoaders=new Map,this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._showEntityPickerModal=!1,this._longPressTimer=null,this._longPressTriggered=!1,this._viewingPointerStart=null,this._viewingClickedDevice=null,this._openingPreview=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,this._zoneEditor=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._draggingLayer=null,this._draggingCorner=null,this._rotatingMmwave=null,this._mmwaveTargetPositions=new Map,this._mmwaveFadingTargets=[],this._mmwaveAnimTimer=null,this._draggingSimTarget=null,this._simMoveThrottle=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=r`
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
      touch-action: none;
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

    svg.space-pan {
      cursor: grab;
    }

    svg.space-pan.panning {
      cursor: grabbing;
    }

    svg.select-tool {
      cursor: default;
    }

    .room {
      transition: fill 0.2s ease;
      pointer-events: none;
    }

    svg.mode-walls .room,
    svg.mode-occupancy .room {
      pointer-events: auto;
      cursor: pointer;
    }

    svg.mode-walls .room:hover,
    svg.mode-occupancy .room:hover {
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

    svg.mode-viewing .room {
      fill: none;
      stroke: none;
    }

    svg.mode-viewing .window,
    svg.mode-viewing .window-pane,
    svg.mode-viewing .window-closed-segment {
      fill: none;
      stroke: var(--primary-text-color, #333);
    }

    svg.mode-viewing .zone-label {
      display: none;
    }

    svg.mode-viewing .door-swing,
    svg.mode-viewing .swing-wedge,
    svg.mode-viewing .window-swing-wedge,
    svg.mode-viewing .door-leaf-panel,
    svg.mode-viewing .window-leaf-panel,
    svg.mode-viewing .door-jamb,
    svg.mode-viewing .hinge-dot,
    svg.mode-viewing .hinge-glow,
    svg.mode-viewing .sliding-arrow,
    svg.mode-viewing .opening-stop,
    svg.mode-viewing .metal-hinge,
    svg.mode-viewing .swing-wedge-fill {
      display: none;
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
      pointer-events: none;
    }

    .device-issue-badge {
      pointer-events: none;
    }

    .device-issue-badge circle {
      fill: #ffb300;
      stroke: var(--card-background-color, #fff);
      stroke-width: 1.5;
    }

    .device-issue-badge text {
      fill: #2c1d00;
      font-size: 10px;
      font-weight: 800;
      text-anchor: middle;
      dominant-baseline: central;
    }

    svg.mode-placement .device-marker,
    svg.mode-viewing .device-marker {
      pointer-events: auto;
      cursor: pointer;
    }

    svg.mode-placement .device-marker *,
    svg.mode-viewing .device-marker * {
      cursor: pointer;
    }

    .device-marker circle {
      transition: r 0.2s ease;
    }

    svg.mode-placement .device-marker:hover circle {
      r: 14;
    }

    .rotation-handle {
      cursor: grab;
    }

    .rotation-handle:active {
      cursor: grabbing;
    }

    .rotation-handle-dot {
      fill: var(--primary-color, #03a9f4);
      stroke: #fff;
      stroke-width: 1.5;
      transition: r 0.15s ease;
    }

    .rotation-handle:hover .rotation-handle-dot {
      r: 6;
    }

    .rotation-handle-line {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 1.5;
      stroke-dasharray: 3 2;
    }

    .device-marker.on circle {
      fill: var(--state-light-active-color, #ffd600);
    }

    .device-marker.off circle {
      fill: var(--disabled-text-color, #bdbdbd);
    }

    svg.mode-viewing .device-marker.on circle,
    svg.mode-viewing .device-marker.off circle {
      fill: #fff;
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

    .wall-editor .delete-btn:hover:not(:disabled) {
      background: var(--error-color, #f44336);
      color: white;
    }

    .wall-editor .delete-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: var(--disabled-text-color, #999);
      color: var(--disabled-text-color, #999);
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

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      .wall-editor {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: min(76vh, 620px);
        padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
        border-radius: 20px 20px 0 0;
        gap: 10px;
        overflow-y: auto;
        overscroll-behavior: contain;
        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.22);
        z-index: 320;
      }

      .wall-editor::before {
        content: "";
        width: 38px;
        height: 4px;
        flex: 0 0 auto;
        align-self: center;
        border-radius: 999px;
        background: var(--divider-color, rgba(0, 0, 0, 0.18));
        margin-top: -4px;
      }

      .wall-editor-header {
        position: sticky;
        top: -14px;
        z-index: 2;
        margin: -14px -14px 0;
        padding: 14px 14px 10px;
        background: var(--card-background-color, white);
      }

      .wall-editor-title {
        font-size: 14px;
      }

      .wall-editor-close {
        min-width: 44px;
        min-height: 44px;
        margin: -8px -8px -8px 0;
      }

      .wall-editor-section {
        gap: 6px;
      }

      .wall-editor-row {
        gap: 6px;
      }

      .wall-editor input,
      .wall-editor-select {
        min-height: 44px;
        font-size: 16px;
        box-sizing: border-box;
      }

      .wall-editor .constraint-btn {
        min-height: 40px;
      }

      .wall-editor-actions {
        position: sticky;
        bottom: calc(-14px - env(safe-area-inset-bottom));
        z-index: 2;
        margin: 0 -14px calc(-14px - env(safe-area-inset-bottom));
        padding: 10px 14px calc(14px + env(safe-area-inset-bottom));
        background: var(--card-background-color, white);
      }

      .wall-editor-actions button {
        min-height: 44px;
      }

      .wall-editor-colors {
        gap: 8px;
      }
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

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      .color-swatch {
        width: 34px;
        height: 34px;
      }
    }

    .room-bg-upload {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--primary-color, #2196f3);
      color: var(--text-primary-color, #fff);
      font-size: 13px;
      cursor: pointer;
    }

    .room-bg-preview {
      position: relative;
      display: inline-block;
    }

    .room-bg-preview img {
      max-width: 100%;
      max-height: 80px;
      border-radius: 6px;
      object-fit: cover;
    }

    .room-bg-remove {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      background: var(--error-color, #f44336);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      --mdc-icon-size: 14px;
    }

    .bg-layer-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 160px;
      overflow-y: auto;
      margin-bottom: 6px;
    }

    .bg-layer-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 6px;
      cursor: pointer;
      background: rgba(255,255,255,0.05);
      border: 1.5px solid transparent;
    }

    .bg-layer-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .bg-layer-item.selected {
      border-color: var(--primary-color, #2196f3);
      background: rgba(33,150,243,0.1);
    }

    .bg-layer-vis {
      background: none;
      border: none;
      color: var(--secondary-text-color, #aaa);
      cursor: pointer;
      padding: 0;
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }

    .bg-layer-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .bg-layer-name {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bg-layer-delete {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
      cursor: pointer;
      padding: 0;
      --mdc-icon-size: 14px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .bg-layer-delete:hover {
      opacity: 1;
    }

    .bg-layer-controls {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px 0;
    }

    .bg-layer-reorder {
      display: flex;
      gap: 4px;
    }

    .bg-layer-reorder button {
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 6px;
      color: var(--text-primary-color, #fff);
      cursor: pointer;
      padding: 4px 8px;
      --mdc-icon-size: 14px;
    }

    .bg-layer-reorder button:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .bg-layer-slider-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .bg-layer-slider-row span:first-child {
      width: 48px;
      flex-shrink: 0;
    }

    .bg-layer-slider-row input[type="range"] {
      flex: 1;
      height: 4px;
      accent-color: var(--primary-color, #2196f3);
    }

    .bg-layer-slider-val {
      width: 36px;
      text-align: right;
      font-size: 11px;
      color: var(--secondary-text-color, #aaa);
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

    /* --- Zone / Furniture styles --- */
    .zone-shape {
      transition: fill-opacity 0.2s ease;
      pointer-events: none;
    }

    svg.mode-viewing .zone-shape {
      fill: none;
      fill-opacity: 0;
      stroke: none;
    }

    svg.mode-viewing .zone-border {
      stroke: var(--secondary-text-color, #666);
      stroke-dasharray: 4,4;
    }

    svg.mode-furniture .zone-shape,
    svg.mode-occupancy .zone-shape {
      pointer-events: auto;
      cursor: pointer;
    }

    svg.mode-furniture .zone-shape:hover,
    svg.mode-occupancy .zone-shape:hover {
      fill-opacity: 0.55;
    }

    .zone-shape.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 3;
      stroke-dasharray: none;
    }

    .zone-midpoint-handle {
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .zone-midpoint-handle:hover {
      opacity: 1;
      fill-opacity: 0.6;
    }

    .furniture-layer:hover .zone-midpoint-handle {
      opacity: 0.5;
    }

    .zone-area-shape {
      fill: none;
      stroke-dasharray: 6,4;
      pointer-events: none;
    }

    svg.mode-furniture .zone-area-shape,
    svg.mode-occupancy .zone-area-shape {
      pointer-events: auto;
      cursor: pointer;
    }

    svg.mode-furniture .zone-area-shape:hover,
    svg.mode-occupancy .zone-area-shape:hover {
      stroke-width: 3;
    }

    .zone-area-shape.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 3;
      stroke-dasharray: none;
    }

    .zone-label {
      font-size: 11px;
      font-weight: 500;
      fill: #333;
      text-anchor: middle;
      dominant-baseline: middle;
      stroke: white;
      stroke-width: 2.5px;
      paint-order: stroke fill;
      pointer-events: none;
    }

    .furniture-preview {
      pointer-events: none;
    }

    .furniture-rect-preview {
      fill: rgba(160, 196, 253, 0.3);
      stroke: var(--primary-color, #2196f3);
      stroke-width: 2;
      stroke-dasharray: 5,5;
    }

    .furniture-poly-preview {
      fill: rgba(160, 196, 253, 0.2);
      stroke: var(--primary-color, #2196f3);
      stroke-width: 2;
      stroke-dasharray: 5,5;
    }

    .furniture-picker {
      position: absolute;
      background: var(--card-background-color, white);
      border-radius: 14px;
      padding: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-width: 260px;
    }

    .furniture-picker-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 10px;
      border: 1.5px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color, #555);
      cursor: pointer;
      font-size: 11px;
      transition: all 0.15s;
      min-width: 56px;
    }

    .furniture-picker-item:hover {
      border-color: var(--primary-color, #2196f3);
      background: rgba(33, 150, 243, 0.06);
    }

    .furniture-picker-item ha-icon {
      --mdc-icon-size: 24px;
    }
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(Nt(()=>{this._viewBox=Qt.value}),Nt(()=>{const t=Kt.value,e=this._canvasMode;this._canvasMode=t,"occupancy"===e&&"occupancy"!==t&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Nt(()=>{!fe.value&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Nt(()=>{const t=Yt.value;t&&t.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=t.id,requestAnimationFrame(()=>this._fitToFloor(t)))}),Nt(()=>{pe.value,this.requestUpdate()}),Nt(()=>{const t=de.value,e=this._focusedRoomId;this._focusedRoomId=t,t&&"__reset__"!==t?requestAnimationFrame(()=>this._animateToRoom(t)):null!==e&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas(),this._onSpaceDown=t=>{if("Space"===t.code&&!t.repeat){t.composedPath().some(t=>t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)||(t.preventDefault(),this._spaceHeld=!0)}},this._onSpaceUp=t=>{"Space"===t.code&&(this._spaceHeld=!1,this._isPanning&&(this._isPanning=!1))},window.addEventListener("keydown",this._onSpaceDown),window.addEventListener("keyup",this._onSpaceUp),this._resizeObserver=new ResizeObserver(()=>{const t=Yt.value;t&&this._fitToFloor(t)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),null!==this._swingRaf&&(cancelAnimationFrame(this._swingRaf),this._swingRaf=null),null!==this._blinkTimer&&(clearTimeout(this._blinkTimer),this._blinkTimer=null),this._onSpaceDown&&window.removeEventListener("keydown",this._onSpaceDown),this._onSpaceUp&&window.removeEventListener("keyup",this._onSpaceUp),this._spaceHeld=!1,this._resizeObserver?.disconnect();for(const t of this._cleanupEffects)t();this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault(),this._cancelViewBoxAnimation();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,n=this._viewBox.height*e;if(o<100||o>1e4)return;const s={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:n};Qt.value=s,this._viewBox=s}_handlePointerDown(t){if(this._activePointers.set(t.pointerId,{x:t.clientX,y:t.clientY}),2===this._activePointers.size){this._isPanning&&(this._isPanning=!1);const[e,i]=[...this._activePointers.values()],o=i.x-e.x,n=i.y-e.y;return this._pinchStartDist=Math.sqrt(o*o+n*n),this._pinchStartMid={x:(e.x+i.x)/2,y:(e.y+i.y)/2},this._pinchStartViewBox={...this._viewBox},this._cancelViewBoxAnimation(),void this._svg?.setPointerCapture(t.pointerId)}const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=pe.value;if(i){if(t.preventDefault(),t.stopPropagation(),i.sampling)return;return void window.dispatchEvent(new CustomEvent("inhabit-mmwave-calibration-point",{detail:{placementId:i.placementId,targetIndex:i.targetIndex,point:e}}))}const o=Gt.value,n=this._getSnappedPoint(e,"light"===o||"switch"===o||"button"===o||"other"===o||"mmwave"===o||"wall"===o||"zone"===o),s=this._canvasMode;if(this._pendingDevice&&"light"!==Gt.value&&"switch"!==Gt.value&&"button"!==Gt.value&&"other"!==Gt.value&&(this._pendingDevice=null,this._showEntityPickerModal=!1),1===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if(this._spaceHeld&&0===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===s&&0===t.button){const i=Yt.value;if(i){const o=this._hitTestDevice(e,i);if(o)return this._viewingClickedDevice=o,this._viewingPointerStart={x:t.clientX,y:t.clientY},this._longPressTriggered=!1,this._longPressTimer=setTimeout(()=>{this._longPressTriggered=!0,o.entityId&&this._openEntityDetails(o.entityId)},500),void this._svg?.setPointerCapture(t.pointerId)}return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId)}if("occupancy"===s&&fe.value&&(0===t.button||2===t.button)){const i=ue.value,o=this._viewBox,n=.015*Math.max(o.width,o.height),s=i.find(t=>{const i=t.position.x-e.x,o=t.position.y-e.y;return Math.sqrt(i*i+o*o)<n});if(2===t.button&&s)return void this._removeSimulatedTarget(s.id);if(0===t.button&&s)return this._draggingSimTarget={targetId:s.id,pointerId:t.pointerId},void this._svg?.setPointerCapture(t.pointerId);if(0===t.button)return void this._addSimulatedTarget(e)}if(0===t.button&&this._roomEditor&&null!==this._roomEditor.selectedLayerIdx){const i=this._roomEditor.editLayers[this._roomEditor.selectedLayerIdx];if(i){const o=this._roomEditor.room,n=o.polygon.vertices,s=n.map(t=>t.x),r=n.map(t=>t.y),a=Math.min(...s),l=Math.min(...r),d=Math.max(...s)-a,c=Math.max(...r)-l,h=a+i.offset_x,p=l+i.offset_y,g=d*i.scale,u=c*i.scale;if(e.x>=h&&e.x<=h+g&&e.y>=p&&e.y<=p+u||this._pointInPolygon(e,o.polygon.vertices))return this._draggingLayer={layerIdx:this._roomEditor.selectedLayerIdx,startPoint:e,originalOffsetX:i.offset_x,originalOffsetY:i.offset_y,pointerId:t.pointerId},void this._svg?.setPointerCapture(t.pointerId)}}if(0===t.button)if("select"===o){const i=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null;if(this._handleSelectClick(e,t.shiftKey)){if("zone"===Jt.value.type&&1===Jt.value.ids.length){const t=Yt.value,e=t?.zones?.find(t=>t.id===Jt.value.ids[0]);if(e)if("occupancy"===this._canvasMode){const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;ce.value={id:e.id,name:t,type:"zone"},de.value=e.id}else this._zoneEditor={zone:e,editName:e.name,editColor:e.color,editAreaId:e.ha_area_id??null}}else if("placement"===s&&("light"===Jt.value.type||"switch"===Jt.value.type||"button"===Jt.value.type||"other"===Jt.value.type||"mmwave"===Jt.value.type)&&1===Jt.value.ids.length){const i=Jt.value.type,o=Jt.value.ids[0];let n=null;n="light"===i?ne.value.find(t=>t.id===o)?.position??null:"switch"===i?se.value.find(t=>t.id===o)?.position??null:"button"===i?re.value.find(t=>t.id===o)?.position??null:"other"===i?ae.value.find(t=>t.id===o)?.position??null:ge.value.find(t=>t.id===o)?.position??null,n&&(this._draggingPlacement={type:i,id:o,startPoint:e,originalPosition:{...n},hasMoved:!1,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId))}}else i&&(Jt.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId)}else if("wall"===o&&"walls"===s){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:n;this._handleWallClick(e,t.shiftKey)}else"placement"!==s||"light"!==o&&"switch"!==o&&"button"!==o&&"other"!==o?"mmwave"===o&&"placement"===s?(this._edgeEditor=null,this._multiEdgeEditor=null,this._placeMmwave(n)):"openings"!==s||"door"!==o&&"window"!==o?"zone"===o&&"furniture"===s?(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._handleZonePolyClick(this._cursorPos)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId)):this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(o)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(n))}_handleDeviceClick(t){this._pendingDevice={position:t},this._showEntityPickerModal=!0}async _placeOpening(t){if(!this.hass||!this._openingPreview)return;const e=Yt.value,i=Xt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,{edgeId:r,t:a,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,p="door"===t?80:100,g=t,u={...l},f={...d},_=c,m={...h};try{const e=await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:r,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await _e(),await this._syncRoomsWithEdges();const i=e.edges.map(t=>t.id);Ut({type:"opening_place",description:`Place ${t}`,undo:async()=>{for(const t of i)try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:t})}catch{}await o.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:f,thickness:_}),await _e(),await this._syncRoomsWithEdges()},redo:async()=>{const e=Yt.value;if(!e)return;const i=Te(e).find(t=>{if("wall"!==t.type)return!1;const e=this._getClosestPointOnSegment(m,t.startPos,t.endPos);return Math.sqrt((e.x-m.x)**2+(e.y-m.y)**2)<5});i&&await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:i.id,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await _e(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error placing opening:",t)}}_handlePointerMove(t){if(this._activePointers.has(t.pointerId)&&this._activePointers.set(t.pointerId,{x:t.clientX,y:t.clientY}),2===this._activePointers.size&&this._pinchStartViewBox){const[t,e]=[...this._activePointers.values()],i=e.x-t.x,o=e.y-t.y,n=Math.sqrt(i*i+o*o);if(this._pinchStartDist>0){const i=this._pinchStartDist/n,o=this._pinchStartViewBox,s=o.width*i,r=o.height*i;if(s<100||s>1e4)return;const a={x:(t.x+e.x)/2,y:(t.y+e.y)/2},l=this._screenToSvgWithViewBox(this._pinchStartMid,o),d=a.x-this._pinchStartMid.x,c=a.y-this._pinchStartMid.y,h=d*(o.width/this._svg.clientWidth),p=c*(o.height/this._svg.clientHeight),g={x:l.x-(l.x-o.x)*i-h,y:l.y-(l.y-o.y)*i-p,width:s,height:r};Qt.value=g,this._viewBox=g}return}const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Gt.value;let o=this._getSnappedPoint(e,"light"===i||"switch"===i||"button"===i||"other"===i||"mmwave"===i||"wall"===i||"zone"===i);if(t.shiftKey&&"wall"===i&&this._wallStartPoint){o=Math.abs(o.x-this._wallStartPoint.x)>=Math.abs(o.y-this._wallStartPoint.y)?{x:o.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:o.y},o=this._getSnappedPoint(o,!0)}if("zone"===i&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints[this._zonePolyPoints.length-1],e=Math.abs(o.x-t.x),i=Math.abs(o.y-t.y),n=15;i<n&&e>n?o={x:o.x,y:t.y}:e<n&&i>n&&(o={x:t.x,y:o.y}),o=this._getSnappedPoint(o,!0)}if(this._cursorPos=o,this._longPressTimer&&this._viewingPointerStart){const e=t.clientX-this._viewingPointerStart.x,i=t.clientY-this._viewingPointerStart.y;(Math.abs(e)>5||Math.abs(i)>5)&&(clearTimeout(this._longPressTimer),this._longPressTimer=null,this._viewingClickedDevice=null,this._viewingPointerStart=null,this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY})}if(this._draggingSimTarget)return this._moveSimulatedTargetLocal(this._draggingSimTarget.targetId,e),void this._throttledMoveSimTarget(this._draggingSimTarget.targetId,e);if(this._draggingCorner&&this._roomEditor){const{corner:t,layerIdx:i,anchorX:o,anchorY:n,bx:s,by:r,bw:a,bh:l}=this._draggingCorner,d=e.x-o,c=e.y-n,h=Math.sqrt(a*a+l*l),p=Math.sqrt(d*d+c*c),g=Math.max(p/h,.05);let u,f;"br"===t?(u=o-s,f=n-r):"tl"===t?(u=o-a*g-s,f=n-l*g-r):"tr"===t?(u=o-s,f=n-l*g-r):(u=o-a*g-s,f=n-r);const _=[...this._roomEditor.editLayers];return _[i]={..._[i],scale:g,offset_x:u,offset_y:f},void(this._roomEditor={...this._roomEditor,editLayers:_})}if(this._draggingLayer&&this._roomEditor){const t=e.x-this._draggingLayer.startPoint.x,i=e.y-this._draggingLayer.startPoint.y,o=[...this._roomEditor.editLayers];return o[this._draggingLayer.layerIdx]={...o[this._draggingLayer.layerIdx],offset_x:this._draggingLayer.originalOffsetX+t,offset_y:this._draggingLayer.originalOffsetY+i},void(this._roomEditor={...this._roomEditor,editLayers:o})}if(this._draggingPlacement){const t=e.x-this._draggingPlacement.startPoint.x,i=e.y-this._draggingPlacement.startPoint.y;if(!this._draggingPlacement.hasMoved&&(Math.abs(t)>3||Math.abs(i)>3)&&(this._draggingPlacement.hasMoved=!0),this._draggingPlacement.hasMoved){const e={x:this._draggingPlacement.originalPosition.x+t,y:this._draggingPlacement.originalPosition.y+i},o=ee.value?we(e,te.value):e,n=this._draggingPlacement;"light"===n.type?ne.value=ne.value.map(t=>t.id===n.id?{...t,position:o}:t):"switch"===n.type?se.value=se.value.map(t=>t.id===n.id?{...t,position:o}:t):"button"===n.type?re.value=re.value.map(t=>t.id===n.id?{...t,position:o}:t):"other"===n.type?ae.value=ae.value.map(t=>t.id===n.id?{...t,position:o}:t):ge.value=ge.value.map(t=>t.id===n.id?{...t,position:o}:t),this.requestUpdate()}return}if(this._rotatingMmwave)this._handleMmwaveRotationMove(e);else{if(this._draggingZoneVertex){const t=this._draggingZoneVertex.zone;let i=this._getSnappedPoint(e,!0,!1,t.id);if(t.polygon?.vertices){const e=t.polygon.vertices,o=this._draggingZoneVertex.vertexIndex,n=e.length,s=e[(o-1+n)%n],r=e[(o+1)%n],a=15;for(const t of[s,r])Math.abs(i.x-t.x)<a&&(i={x:t.x,y:i.y}),Math.abs(i.y-t.y)<a&&(i={x:i.x,y:t.y});const l={x:s.x-i.x,y:s.y-i.y},d={x:r.x-i.x,y:r.y-i.y},c=Math.sqrt(l.x*l.x+l.y*l.y),h=Math.sqrt(d.x*d.x+d.y*d.y);if(c>1&&h>1){const t=l.x*d.x+l.y*d.y,e=t/(c*h),o=5,n=Math.cos((90-o)*Math.PI/180);if(Math.abs(e)<n){const e=d.x*d.x+d.y*d.y;i={x:Math.round(i.x+t/e*d.x),y:Math.round(i.y+t/e*d.y)}}}e[o]={x:i.x,y:i.y}}return void this.requestUpdate()}if(this._draggingNode){const i=t.clientX-this._draggingNode.startX,o=t.clientY-this._draggingNode.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};return this._panStart={x:t.clientX,y:t.clientY},Qt.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||"walls"!==this._canvasMode||this._checkNodeHover(e),"zone"===i&&this._zonePolyPoints.length>0&&this.requestUpdate(),"openings"!==this._canvasMode||"door"!==i&&"window"!==i?this._openingPreview=null:this._updateOpeningPreview(e)}}_checkNodeHover(t){const e=Yt.value;if(!e)return void(this._hoveredNode=null);const i=Ne(t,e.nodes,15);this._hoveredNode=i}_updateOpeningPreview(t){const e=Yt.value;if(!e)return void(this._openingPreview=null);const i=Te(e);let o=null,n=30,s=t,r=0;for(const e of i){if("wall"!==e.type)continue;const i=this._getClosestPointOnSegment(t,e.startPos,e.endPos),a=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);if(a<n){n=a,o=e,s=i;const t=e.endPos.x-e.startPos.x,l=e.endPos.y-e.startPos.y,d=t*t+l*l;r=d>0?((i.x-e.startPos.x)*t+(i.y-e.startPos.y)*l)/d:0}}this._openingPreview=o?{edgeId:o.id,position:s,startPos:o.startPos,endPos:o.endPos,thickness:o.thickness,t:r}:null,this.requestUpdate()}_handlePointerUp(t){if(this._activePointers.delete(t.pointerId),this._pinchStartViewBox)return this._pinchStartViewBox=null,this._pinchStartDist=0,void this._svg?.releasePointerCapture(t.pointerId);if(this._viewingClickedDevice){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null);const e=this._viewingClickedDevice;return this._viewingClickedDevice=null,this._viewingPointerStart=null,this._svg?.releasePointerCapture(t.pointerId),this._longPressTriggered||("light"!==e.type&&"switch"!==e.type&&"button"!==e.type||!e.entityId?e.entityId&&this._openEntityDetails(e.entityId):this._toggleEntity(e.entityId)),void(this._longPressTriggered=!1)}if(this._draggingSimTarget){const e=this._screenToSvg({x:t.clientX,y:t.clientY});return this._sendSimTargetMove(this._draggingSimTarget.targetId,e),this._svg?.releasePointerCapture(t.pointerId),this._draggingSimTarget=null,void(this._simMoveThrottle&&(clearTimeout(this._simMoveThrottle),this._simMoveThrottle=null))}return this._rotatingMmwave?(this._finishMmwaveRotation(),void this._svg?.releasePointerCapture(t.pointerId)):this._draggingCorner?(this._svg?.releasePointerCapture(t.pointerId),void(this._draggingCorner=null)):this._draggingLayer?(this._svg?.releasePointerCapture(t.pointerId),void(this._draggingLayer=null)):this._draggingPlacement?(this._draggingPlacement.hasMoved&&this._finishPlacementDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingPlacement=null)):this._draggingZoneVertex?(this._finishZoneVertexDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingZoneVertex=null)):this._draggingNode?(this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId)):void(this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId)))}_handlePointerCancel(t){this._activePointers.delete(t.pointerId),this._pinchStartViewBox&&(this._pinchStartViewBox=null,this._pinchStartDist=0)}async _handleDblClick(t){if("viewing"===this._canvasMode){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Yt.value;if(i){const t=this._hitTestDevice(e,i);t?.entityId&&this._openEntityDetails(t.entityId)}return}if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Yt.value,o=Xt.value;if(!i||!o||!this.hass)return;const n=Ne(e,i.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Te(i);for(const t of s){if(this._pointToSegmentDistance(e,t.startPos,t.endPos)<t.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:o.id,floor_id:i.id,edge_id:t.id,point:{x:e.x,y:e.y}}),await _e(),await this._syncRoomsWithEdges()}catch(t){console.error("Failed to split edge:",t)}return}}}async _handleContextMenu(t){if(t.preventDefault(),"viewing"===this._canvasMode){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Yt.value;if(i){const t=this._hitTestDevice(e,i);t?.entityId&&this._openEntityDetails(t.entityId)}return}if("occupancy"===this._canvasMode&&fe.value)return;if("furniture"===this._canvasMode)return;if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Yt.value,o=Xt.value;if(!i||!o||!this.hass)return;const n=Ne(e,i.nodes,15);if(!n)return;if(2===Le(n.id,i.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:o.id,floor_id:i.id,node_id:n.id}),await _e(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Jt.value={type:"none",ids:[]},this._edgeEditor=null}catch(t){console.error("Failed to dissolve node:",t)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Gt.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=Yt.value,e=Xt.value;if(!t||!e)return void(this._draggingNode=null);const i=this._cursorPos,o=this._draggingNode.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingNode=null);const n=mi(si(t.nodes,t.edges),this._draggingNode.node.id,i.x,i.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await _e()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=function(t,e,i=.5){const o=new Map;for(const e of t)o.set(e.id,e);const n=[];for(const t of e){const e=o.get(t.start_node),s=o.get(t.end_node);e&&s&&be(e,s)<=i&&n.push(t.id)}return n}(t.nodes,t.edges);if(0!==i.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",i.length,i.map(t=>`${t.slice(0,8)}…`).join(", "));try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o});await _e(),await this._syncRoomsWithEdges()}catch(t){console.error("Error removing degenerate edges:",t)}}}_handleKeyDown(t){if("Escape"===t.key){if(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._draggingLayer=null,this._draggingCorner=null,this._rotatingMmwave){const t=this._rotatingMmwave;ge.value=ge.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e),this._rotatingMmwave=null}this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,Jt.value={type:"none",ids:[]},he.value=null,Gt.value="select"}else"Backspace"!==t.key&&"Delete"!==t.key||!this._zoneEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||"light"!==Jt.value.type&&"switch"!==Jt.value.type&&"mmwave"!==Jt.value.type?"r"===t.key&&"mmwave"===Jt.value.type?(t.preventDefault(),this._rotateMmwave(t.shiftKey?-15:15)):"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),Ht()):(t.preventDefault(),jt()):(t.preventDefault(),this._deleteSelectedPlacement()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete()):(t.preventDefault(),this._handleZoneDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._edgeEditor.edge,o=parseFloat(this._editingLength);if(Number.isNaN(o)||o<=0)return;const n=Math.abs(o-this._edgeEditor.length)>=.01,s=this._editingDirection!==i.direction,r=this._editingLengthLocked!==i.length_locked,a="door"===i.type||"window"===i.type,l=a&&this._editingOpeningParts!==(i.opening_parts??"single"),d=a&&this._editingOpeningType!==(i.opening_type??"swing"),c=a&&this._editingSwingDirection!==(i.swing_direction??"left"),h=a&&(this._editingEntityId??null)!==(i.entity_id??null),p=s||r||l||d||c||h;try{if(s){if(!await this._applyDirection(i,this._editingDirection))return}if(n&&await this._updateEdgeLength(i,o),p){const o=Yt.value;if(o&&r){const t={};s&&(t.direction=this._editingDirection),r&&(t.length_locked=this._editingLengthLocked);const e=function(t,e,i,o){if(Ke){const t=Object.entries(o).map(([t,e])=>`${t}=${e}`).join(", ");console.group(`${Ge} checkConstraintsFeasible: %cedge %s → {%s}`,Je,Qe,`${i.slice(0,8)}…`,t)}const n=si(t,e),s=ai(n),{magnitudes:r}=ci(n,s),a=e.map(t=>t.id!==i?t:{...t,...void 0!==o.direction&&{direction:o.direction},...void 0!==o.length_locked&&{length_locked:o.length_locked},...void 0!==o.angle_group&&{angle_group:o.angle_group??void 0}}),l=si(t,a),d=ai(l),c=new Set;for(const[t,e]of l.nodes)e.pinned&&c.add(t);const h=hi(l,c,d,r);return h.blocked?(Ke&&(console.log(`${Ge} %c→ NOT FEASIBLE%c — blocked by: %s`,Je,ti,"",(h.blockedBy||[]).map(t=>{const e=l.edges.get(t);return e?oi(e,l.nodes):`${t.slice(0,8)}…`}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(Ke&&(console.log(`${Ge} %c→ Feasible`,Je,ei),console.groupEnd()),{feasible:!0})}(o.nodes,o.edges,i.id,t);if(!e.feasible)return void(e.blockedBy&&this._blinkEdges(e.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await _e()}}catch(t){console.error("Error applying edge changes:",t)}this._edgeEditor=null,Jt.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Jt.value={type:"none",ids:[]}}async _setDoorOpensToSide(t,e){if(!this.hass)return;if("a"===t)return;const i=Yt.value,o=Xt.value;if(!i||!o)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:o.id,floor_id:i.id,edge_id:e.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await _e();const t=Yt.value;if(t){const i=t.edges.find(t=>t.id===e.id);i&&this._updateEdgeEditorForSelection([i.id])}}catch(t){console.error("Error flipping door side:",t)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this.hass,o=e.id,n=t.id,s=this._edgeEditor.edge,r=Ae(t.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await _e(),await this._syncRoomsWithEdges(),Ut({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await i.callWS({type:"inhabit/edges/add",floor_plan_id:o,floor_id:n,...d});c.id=t.edge.id,await _e(),await this._syncRoomsWithEdges()},redo:async()=>{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await _e(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,Jt.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,i){if(!this.hass)return;const o=Yt.value,n=Xt.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l=new Map;for(const e of t){const t=o.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await i(),await this._syncRoomsWithEdges();const d=Yt.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:e}),await _e(),await this._syncRoomsWithEdges()};Ut({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const i=Yt.value,o=Xt.value;if(!i||!o)return;const n=i.edges.map(e=>e.id===t.id?{...e,length_locked:!1}:e),s=yi(si(i.nodes,n),t.id,e);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await _e()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(t){const e=Yt.value;if(e){const i=this._draggingNode?.node.id,o=Ne(t,i?e.nodes.filter(t=>t.id!==i):e.nodes,15);if(o)return{x:o.x,y:o.y};if(i){const o=new Set(Le(i,e.edges).map(t=>`${t.start_node}-${t.end_node}`)),n=Te(e);let s=null,r=15;for(const e of n){const i=`${e.start_node}-${e.end_node}`;if(o.has(i))continue;const n=this._getClosestPointOnSegment(t,e.startPos,e.endPos),a=Math.sqrt((t.x-n.x)**2+(t.y-n.y)**2);a<r&&(r=a,s=n)}if(s)return s;const a=5,l=Le(i,e.edges);let d=null,c=1/0;for(const o of l){const n=o.start_node===i?o.end_node:o.start_node,s=e.nodes.find(t=>t.id===n);if(!s)continue;const r=t.x-s.x,l=t.y-s.y,h=Math.sqrt(r*r+l*l);if(h<1)continue;const p=180*Math.atan2(l,r)/Math.PI,g=90*Math.round(p/90),u=Math.abs(p-g);if(u<a&&u>.01){const e=g*Math.PI/180,i={x:Math.round(s.x+h*Math.cos(e)),y:Math.round(s.y+h*Math.sin(e))},o=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);o<c&&(c=o,d=i)}}if(d)return d}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1,i=!1,o){const n=Yt.value;if(!n)return!i&&ee.value?we(t,te.value):t;const s=this._svg,r=s?this._viewBox.width/s.clientWidth:1,a=Math.max(15,20*r),l=Ne(t,n.nodes,a);if(l)return{x:l.x,y:l.y};if(n.zones?.length){let e=null,i=a;for(const s of n.zones)if(s.id!==o&&s.polygon?.vertices)for(const o of s.polygon.vertices){const n=Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2);n<i&&(i=n,e={x:o.x,y:o.y})}if(e)return e}if(e){let e=null,i=a;const s=Te(n);for(const o of s){const n=this._getClosestPointOnSegment(t,o.startPos,o.endPos),s=Math.sqrt((t.x-n.x)**2+(t.y-n.y)**2);s<Math.max(i,o.thickness/2+5)&&s<i&&(i=s,e=n)}if(n.zones?.length)for(const s of n.zones){if(s.id===o)continue;if(!s.polygon?.vertices)continue;const n=s.polygon.vertices;for(let o=0;o<n.length;o++){const s=n[o],r=n[(o+1)%n.length],a=this._getClosestPointOnSegment(t,s,r),l=Math.sqrt((t.x-a.x)**2+(t.y-a.y)**2);l<i&&(i=l,e=a)}}if(e)return e}return!i&&ee.value?we(t,te.value):t}_getClosestPointOnSegment(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return e;const r=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s));return{x:e.x+r*o,y:e.y+r*n}}_getOccupancyHits(t,e){const i=[];for(const o of ge.value.filter(t=>t.floor_id===e.id)){Math.hypot(t.x-o.position.x,t.y-o.position.y)<18&&i.push({type:"mmwave",id:o.id,placement:o})}for(const o of e.zones??[])o.polygon?.vertices&&this._pointInPolygon(t,o.polygon.vertices)&&i.push({type:"zone",id:o.id,zone:o});for(const o of e.rooms)this._pointInPolygon(t,o.polygon.vertices)&&i.push({type:"room",id:o.id,room:o});return i}_selectOccupancyHit(t,e){const i=this._getOccupancyHits(t,e);if(0===i.length)return!1;const o=he.value?`${he.value.type}:${he.value.id}`:ce.value?`${ce.value.type}:${ce.value.id}`:null,n=o?i.findIndex(t=>`${t.type}:${t.id}`===o):-1,s=i[(n+1)%i.length];if("mmwave"===s.type)return Jt.value={type:"mmwave",ids:[s.id]},ce.value=null,de.value=null,he.value={id:s.id,type:"mmwave"},!0;if(he.value=null,Jt.value={type:s.type,ids:[s.id]},"zone"===s.type){const t=s.zone,e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name;return ce.value={id:t.id,name:e,type:"zone"},de.value=t.id,!0}const r=s.room,a=r.ha_area_id?this._haAreas.find(t=>t.area_id===r.ha_area_id)?.name??r.name:r.name;return ce.value={id:r.id,name:a,type:"room"},de.value=r.id,!0}_handleSelectClick(t,e=!1){const i=Yt.value;if(!i)return!1;const o=this._canvasMode;if("occupancy"===o){if(this._selectOccupancyHit(t,i))return!0}if("walls"===o||"openings"===o){const n=Te(i);for(const i of n){if(!("walls"===o?"wall"===i.type:"wall"!==i.type))continue;if(this._pointToSegmentDistance(t,i.startPos,i.endPos)<i.thickness/2+5){if("walls"===o&&e&&"edge"===Jt.value.type){const t=[...Jt.value.ids],e=t.indexOf(i.id);return e>=0?t.splice(e,1):t.push(i.id),Jt.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return Jt.value={type:"edge",ids:[i.id]},this._updateEdgeEditorForSelection([i.id]),!0}}}if("placement"===o||"viewing"===o){for(const e of ne.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Jt.value={type:"light",ids:[e.id]},"placement"===o?he.value={id:e.id,type:"light"}:this._toggleEntity(e.entity_id),!0}for(const e of se.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Jt.value={type:"switch",ids:[e.id]},"placement"===o?he.value={id:e.id,type:"switch"}:this._toggleEntity(e.entity_id),!0}for(const e of re.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Jt.value={type:"button",ids:[e.id]},"placement"===o?he.value={id:e.id,type:"button"}:this._toggleEntity(e.entity_id),!0}for(const e of ae.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Jt.value={type:"other",ids:[e.id]},"placement"===o?he.value={id:e.id,type:"other"}:this._openEntityDetails(e.entity_id),!0}for(const e of ge.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Jt.value={type:"mmwave",ids:[e.id]},he.value=null,!0}}if(("furniture"===o||"occupancy"===o)&&i.zones){const e=[...i.zones];for(const i of e)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices)){if("occupancy"===o){Jt.value={type:"zone",ids:[i.id]};const t=i.ha_area_id?this._haAreas.find(t=>t.area_id===i.ha_area_id)?.name??i.name:i.name;return ce.value={id:i.id,name:t,type:"zone"},de.value=i.id,!0}return Jt.value={type:"zone",ids:[i.id]},!0}}if("walls"===o||"occupancy"===o)for(const e of i.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){Jt.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return"occupancy"===o?(ce.value={id:e.id,name:t,type:"room"},de.value=e.id):this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null,editLayers:(e.background_layers??[]).map(t=>({...t})),selectedLayerIdx:null},!0}return Jt.value={type:"none",ids:[]},he.value=null,!1}_updateEdgeEditorForSelection(t){const e=Yt.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const i=Ae(e.nodes);if(1===t.length){const o=e.edges.find(e=>e.id===t[0]);if(o){const t=i.get(o.start_node),e=i.get(o.end_node);if(t&&e){const i=this._calculateWallLength(t,e);this._edgeEditor={edge:o,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:i},this._editingLength=Math.round(i).toString(),this._editingLengthLocked=o.length_locked,this._editingDirection=o.direction,this._editingOpeningParts=o.opening_parts??"single",this._editingOpeningType=o.opening_type??"swing",this._editingSwingDirection=o.swing_direction??"left",this._editingEntityId=o.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const o=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t),n=[];for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&n.push({x:e.x,y:e.y}),o&&n.push({x:o.x,y:o.y})}const s=function(t,e=2){if(t.length<2)return!0;if(2===t.length)return!0;let i=0,o=t[0],n=t[1];for(let e=0;e<t.length;e++)for(let s=e+1;s<t.length;s++){const r=be(t[e],t[s]);r>i&&(i=r,o=t[e],n=t[s])}if(i<1e-9)return!0;const s=n.x-o.x,r=n.y-o.y,a=Math.sqrt(s*s+r*r);for(const i of t)if(Math.abs((i.x-o.x)*r-(i.y-o.y)*s)/a>e)return!1;return!0}(n);let r;if(s){r=0;for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&o&&(r+=this._calculateWallLength(e,o))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:o,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return Math.sqrt((t.x-e.x)**2+(t.y-e.y)**2);const r=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s)),a=e.x+r*o,l=e.y+r*n;return Math.sqrt((t.x-a)**2+(t.y-l)**2)}_handleWallClick(t,e=!1){if(this._wallStartPoint){let i="free";if(e){i=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,i);const o=Yt.value,n=o?.nodes.some(e=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1);this._wallChainStart&&Math.abs(t.x-this._wallChainStart.x)<1&&Math.abs(t.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Gt.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=t}else this._wallStartPoint=t,this._wallChainStart=t}async _completeWall(t,e,i="free"){if(!this.hass)return;const o=Yt.value,n=Xt.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l={id:""};try{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await _e(),await this._syncRoomsWithEdges(),Ut({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await _e(),await this._syncRoomsWithEdges()},redo:async()=>{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await _e(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.inverse();return{x:i.a*t.x+i.c*t.y+i.e,y:i.b*t.x+i.d*t.y+i.f}}const i=this._svg.getBoundingClientRect(),o=this._viewBox.width/i.width,n=this._viewBox.height/i.height;return{x:this._viewBox.x+(t.x-i.left)*o,y:this._viewBox.y+(t.y-i.top)*n}}_screenToSvgWithViewBox(t,e){if(!this._svg)return t;const i=this._svg.getBoundingClientRect();return{x:e.x+(t.x-i.left)*(e.width/i.width),y:e.y+(t.y-i.top)*(e.height/i.height)}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(t){const e=Yt.value;if(!e)return;const i=e.rooms.find(e=>e.id===t)??e.zones?.find(e=>e.id===t);if(!i||!i.polygon?.vertices?.length)return;const o=i.polygon.vertices.map(t=>t.x),n=i.polygon.vertices.map(t=>t.y),s=Math.min(...o),r=Math.max(...o),a=Math.min(...n),l=Math.max(...n),d=r-s,c=l-a,h=ce.value?.3:.15;let p=d+2*(Math.max(d,50)*h),g=c+2*(Math.max(c,50)*h);const u=this._svg?.getBoundingClientRect(),f=u&&u.width>0&&u.height>0?u.width/u.height:1.25;p/g>f?g=p/f:p=g*f;const _=(s+r)/2,m=(a+l)/2;let y=0;if(!!ce.value&&u&&u.width>0){y=316/u.width*p/2}this._animateViewBox({x:_-p/2+y,y:m-g/2,width:p,height:g},400)}_animateToFloor(){const t=Yt.value;if(!t)return;const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of ne.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of se.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of re.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of ge.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s;let d=a+2*(.1*Math.max(a,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),p=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>p?c=d/p:d=c*p;const g=(o+n)/2,u=(s+r)/2;this._animateViewBox({x:g-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(t,e){this._cancelViewBoxAnimation();const i={...this._viewBox},o=performance.now(),n=s=>{const r=s-o,a=Math.min(r/e,1),l=1-(1-a)**3,d={x:i.x+(t.x-i.x)*l,y:i.y+(t.y-i.y)*l,width:i.width+(t.width-i.width)*l,height:i.height+(t.height-i.height)*l};this._viewBox=d,Qt.value=d,this._viewBoxAnimation=a<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(t){const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of ne.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of se.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of re.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of ge.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=a+2*(.1*Math.max(a,50)),p=l+2*(.1*Math.max(l,50));h/p>c?p=h/c:h=p*c;const g={x:(o+n)/2-h/2,y:(s+r)/2-p/2,width:h,height:p};Qt.value=g,this._viewBox=g}async _addSimulatedTarget(t){if(!this.hass)return;const e=Xt.value,i=Yt.value;if(e&&i)try{const o=await this.hass.callWS({type:"inhabit/simulate/target/add",floor_plan_id:e.id,floor_id:i.id,position:{x:t.x,y:t.y},hitbox:fe.value});ue.value=[...ue.value,o]}catch(t){console.error("Failed to add simulated target:",t)}}async _removeSimulatedTarget(t){if(this.hass)try{await this.hass.callWS({type:"inhabit/simulate/target/remove",target_id:t}),ue.value=ue.value.filter(e=>e.id!==t)}catch(t){console.error("Failed to remove simulated target:",t)}}_moveSimulatedTargetLocal(t,e){const i=Yt.value,o=ue.value,n=o.findIndex(e=>e.id===t);if(-1===n)return;const s=fe.value&&i?this._getRegionAtPoint(e,i):null,r={...o[n],position:{x:e.x,y:e.y},region_id:s?.id??null,region_name:s?.name??null},a=[...o];a[n]=r,ue.value=a}_throttledMoveSimTarget(t,e){this._simMoveThrottle||(this._simMoveThrottle=setTimeout(()=>{this._simMoveThrottle=null,this._sendSimTargetMove(t,e)},66))}async _sendSimTargetMove(t,e){if(this.hass)try{const i=await this.hass.callWS({type:"inhabit/simulate/target/move",target_id:t,position:{x:e.x,y:e.y},hitbox:fe.value}),o=ue.value,n=o.findIndex(e=>e.id===t);if(-1!==n){const t=[...o];t[n]=i,ue.value=t}}catch{}}_getRegionAtPoint(t,e){if(e.zones)for(const i of e.zones)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};for(const i of e.rooms)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};return null}_renderSimulationLayer(t){const e=ue.value,i=fe.value,o=new Set;if(i)for(const t of e)t.region_id&&o.add(t.region_id);const n=this._viewBox,s=Math.max(n.width,n.height)/100,r=.55*s,a=2.8*r,l=1.1*s,d=r+.8*l;return q`
      <defs>
        <filter id="sim-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="${.1*s}" stdDeviation="${.15*s}" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g class="simulation-layer">
        <!-- Room/zone occupation highlights -->
        ${t.rooms.map(t=>o.has(t.id)?q`
          <path d="${qe(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}
        ${(t.zones||[]).map(t=>o.has(t.id)?q`
          <path d="${qe(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}

        <!-- Target markers -->
        ${e.map(t=>{const e=!!t.region_id,i=e?"#4caf50":"#78909c";return q`
            <g class="sim-target" style="cursor: grab;">
              <!-- Pulse ring for detected targets -->
              ${e?q`
                <circle cx="${t.position.x}" cy="${t.position.y}" r="${a}"
                        fill="none" stroke="${i}" stroke-width="${.06*s}"
                        opacity="0.3"/>
              `:null}
              <!-- Dot -->
              <circle cx="${t.position.x}" cy="${t.position.y}" r="${r}"
                      fill="${i}"
                      filter="url(#sim-shadow)"/>
              ${t.region_name?q`
                <text x="${t.position.x}" y="${t.position.y+d}"
                      text-anchor="middle"
                      fill="var(--secondary-text-color, #666)"
                      font-size="${l}"
                      font-weight="400"
                      font-family="var(--ha-font-family, Roboto, sans-serif)"
                      pointer-events="none">
                  ${t.region_name}
                </text>
              `:null}
            </g>
          `})}
      </g>
    `}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[n],r=e[s];o.y>t.y!=r.y>t.y&&t.x<(r.x-o.x)*(t.y-o.y)/(r.y-o.y)+o.x&&(i=!i)}return i}_pointInOrNearPolygon(t,e,i){if(this._pointInPolygon(t,e))return!0;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[s].x,r=e[s].y,a=e[n].x-o,l=e[n].y-r,d=a*a+l*l;if(0===d){if(Math.hypot(t.x-o,t.y-r)<=i)return!0;continue}const c=Math.max(0,Math.min(1,((t.x-o)*a+(t.y-r)*l)/d)),h=o+c*a,p=r+c*l;if(Math.hypot(t.x-h,t.y-p)<=i)return!0}return!1}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=Fe(t.nodes,t.edges),o=[...t.rooms],n=new Set,s=new Set;let r=this._getNextRoomNumber(o)-1;const a=[];for(let t=0;t<i.length;t++){const e=i[t];for(const i of o){const o=i.polygon.vertices,n=this._getPolygonCenter(o);if(!n)continue;const s=Math.sqrt((n.x-e.centroid.x)**2+(n.y-e.centroid.y)**2);let r=0;this._pointInPolygon(n,e.vertices)&&(r+=.6),o.length===e.vertices.length&&(r+=.3),s<200&&(r+=.1*(1-s/200)),r>.3&&a.push({di:t,roomId:i.id,score:r})}}a.sort((t,e)=>e.score-t.score);const l=new Map;for(const{di:t,roomId:e,score:i}of a){if(s.has(t)||n.has(e))continue;const i=o.find(t=>t.id===e);l.set(t,i),s.add(t),n.add(e)}for(let o=0;o<i.length;o++){const n=i[o],s=l.get(o);if(s){if(this._verticesChanged(s.polygon.vertices,n.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:s.id,polygon:{vertices:n.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{r++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${r}`,polygon:{vertices:n.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of o)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await _e()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let i=0;i<t.length;i++)if(Math.abs(t[i].x-e[i].x)>1||Math.abs(t[i].y-e[i].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const i of t){const t=i.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}_getAssignedHaAreaIds(t){const e=new Set,i=Xt.value;if(!i)return e;for(const o of i.floors){for(const i of o.rooms)i.id!==t?.roomId&&i.ha_area_id&&e.add(i.ha_area_id);for(const i of o.zones)i.id!==t?.zoneId&&i.ha_area_id&&e.add(i.ha_area_id)}return e}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const{room:i,editName:o,editColor:n,editAreaId:s,editLayers:r}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,name:o,color:n,ha_area_id:s,background_layers:r}),await _e()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,Jt.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Jt.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=Xt.value,e=Yt.value;if(!t||!e)return;const i=Fe(e.nodes,e.edges),o=this._roomEditor.room.polygon.vertices,n=this._getPolygonCenter(o);if(n){if(i.some(t=>this._pointInPolygon(n,t.vertices)&&t.vertices.length===o.length))return void alert("Cannot delete a room while its walls are still connected. Remove a wall first.")}try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await _e()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,Jt.value={type:"none",ids:[]}}async _handleRoomBgUpload(t){const e=t.target.files?.[0];if(!e||!this.hass)return;const i=new FormData;i.append("file",e);try{const t=await fetch("/api/inhabit/images/upload",{method:"POST",headers:{Authorization:`Bearer ${this.hass.auth.data.access_token}`},body:i}),o=await t.json();if(o.url&&this._roomEditor){const t=e.name.replace(/\.[^.]+$/,"")||"Layer",i={id:Math.random().toString(36).slice(2,10),name:t,url:o.url,offset_x:0,offset_y:0,scale:1,opacity:1,visible:!0},n=[...this._roomEditor.editLayers,i];this._roomEditor={...this._roomEditor,editLayers:n,selectedLayerIdx:n.length-1}}}catch(t){console.error("Error uploading room background:",t)}}_startCornerDrag(t,e,i,o,n,s,r){if(t.stopPropagation(),t.preventDefault(),!this._roomEditor)return;const a=this._roomEditor.editLayers[i],l=o+a.offset_x,d=n+a.offset_y,c=s*a.scale,h=r*a.scale;let p,g;"tl"===e?(p=l+c,g=d+h):"tr"===e?(p=l,g=d+h):"bl"===e?(p=l+c,g=d):(p=l,g=d),this._draggingCorner={corner:e,layerIdx:i,anchorX:p,anchorY:g,bx:o,by:n,bw:s,bh:r,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId)}_roomLoopExists(){const t=Yt.value;if(!t||!this._roomEditor)return!1;const e=this._roomEditor.room.polygon.vertices,i=this._getPolygonCenter(e);if(!i)return!1;return Fe(t.nodes,t.edges).some(t=>this._pointInPolygon(i,t.vertices)&&t.vertices.length===e.length)}_renderRoomEditor(){if(!this._roomEditor)return null;const t=this._getAssignedHaAreaIds({roomId:this._roomEditor.room.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._roomEditor?.editAreaId);return H`
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
            @change=${t=>{if(this._roomEditor){const e=t.target.value,i=this._haAreas.find(t=>t.area_id===e);this._roomEditor={...this._roomEditor,editAreaId:e||null,editName:i?i.name:this._roomEditor.editName}}}}
          >
            <option value="">None</option>
            ${e.map(t=>H`
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

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Background Layers</span>
          <div class="bg-layer-list">
            ${this._roomEditor.editLayers.map((t,e)=>H`
              <div class="bg-layer-item ${this._roomEditor?.selectedLayerIdx===e?"selected":""}"
                   @click=${()=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,selectedLayerIdx:this._roomEditor.selectedLayerIdx===e?null:e})}}>
                <button class="bg-layer-vis" @click=${t=>{if(t.stopPropagation(),!this._roomEditor)return;const i=[...this._roomEditor.editLayers];i[e]={...i[e],visible:!i[e].visible},this._roomEditor={...this._roomEditor,editLayers:i}}}><ha-icon icon=${t.visible?"mdi:eye":"mdi:eye-off"}></ha-icon></button>
                <img class="bg-layer-thumb" src="${t.url}" />
                <span class="bg-layer-name">${t.name||"Layer"}</span>
                <button class="bg-layer-delete" @click=${t=>{if(t.stopPropagation(),!this._roomEditor)return;const i=this._roomEditor.editLayers.filter((t,i)=>i!==e);let o=this._roomEditor.selectedLayerIdx;null!==o&&(o===e?o=null:o>e&&o--),this._roomEditor={...this._roomEditor,editLayers:i,selectedLayerIdx:o}}}><ha-icon icon="mdi:close"></ha-icon></button>
              </div>
            `)}
          </div>
          ${null!==this._roomEditor.selectedLayerIdx&&this._roomEditor.editLayers[this._roomEditor.selectedLayerIdx]?(()=>{const t=this._roomEditor.selectedLayerIdx,e=this._roomEditor.editLayers[t];return H`
              <div class="bg-layer-controls">
                <div class="bg-layer-reorder">
                  <button ?disabled=${0===t} @click=${()=>{if(!this._roomEditor||0===t)return;const e=[...this._roomEditor.editLayers];[e[t-1],e[t]]=[e[t],e[t-1]],this._roomEditor={...this._roomEditor,editLayers:e,selectedLayerIdx:t-1}}}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
                  <button ?disabled=${t===this._roomEditor.editLayers.length-1} @click=${()=>{if(!this._roomEditor||t===this._roomEditor.editLayers.length-1)return;const e=[...this._roomEditor.editLayers];[e[t],e[t+1]]=[e[t+1],e[t]],this._roomEditor={...this._roomEditor,editLayers:e,selectedLayerIdx:t+1}}}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
                </div>
                <div class="bg-layer-slider-row">
                  <span>Scale</span>
                  <input type="range" min="0.1" max="5" step="0.05" .value=${String(e.scale)}
                    @input=${e=>{if(!this._roomEditor)return;const i=[...this._roomEditor.editLayers];i[t]={...i[t],scale:parseFloat(e.target.value)},this._roomEditor={...this._roomEditor,editLayers:i}}} />
                  <span class="bg-layer-slider-val">${Math.round(100*e.scale)}%</span>
                </div>
                <div class="bg-layer-slider-row">
                  <span>Opacity</span>
                  <input type="range" min="0" max="1" step="0.05" .value=${String(e.opacity)}
                    @input=${e=>{if(!this._roomEditor)return;const i=[...this._roomEditor.editLayers];i[t]={...i[t],opacity:parseFloat(e.target.value)},this._roomEditor={...this._roomEditor,editLayers:i}}} />
                  <span class="bg-layer-slider-val">${Math.round(100*e.opacity)}%</span>
                </div>
              </div>
            `})():null}
          <label class="room-bg-upload">
            <ha-icon icon="mdi:image-plus"></ha-icon> Add Image
            <input type="file" accept="image/*" @change=${this._handleRoomBgUpload} hidden />
          </label>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleRoomEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleRoomDelete} ?disabled=${this._roomLoopExists()} title=${this._roomLoopExists()?"Remove a wall to delete this room":"Delete room"}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}_renderEdgeChains(t,e,i=null){const o=Te(t);let n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:t.startPos,endPos:t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}));if(this._draggingNode){const{positions:e,blocked:i,blockedBy:s}=xi(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);i?s&&this._blinkEdges(s):n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:e.get(t.start_node)??t.startPos,endPos:e.get(t.end_node)??t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}))}const s=Ve(n),r="edge"===e.type?n.filter(t=>e.ids.includes(t.id)):[],a=le.value.get(t.id),l=a?new Set(a.map(t=>t.edgeId)):new Set,d=n.filter(t=>("door"===t.type||"window"===t.type)&&this._isRenderableSegment(t.startPos,t.endPos)),c=[];for(const t of s)if(i){let e=[],o=!1;for(const n of t){const t=i.has(n.id);0===e.length?(e.push(n),o=t):t===o?e.push(n):(c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"}),e=[n],o=t)}e.length>0&&c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"})}else c.push({edges:t,dimClass:""});return q`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(t=>{const e=Ze(t.edges.map(t=>({start:t.startPos,end:t.endPos,thickness:t.thickness})));return e?q`
        <path class="wall ${t.dimClass}"
              d="${e}"/>
      `:null})}

      <!-- Door and window openings -->
      ${d.map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness});if(!e)return null;const o=!!i&&i.has(t.id),n=i?o?"edges-focused":"edges-dimmed":"";let s=0;if(t.entity_id&&this.hass?.states[t.entity_id]){const e=this.hass.states[t.entity_id],i=e.state;if("on"===i||"open"===i){const i="door"===t.type?Ui:Math.PI/2,o=e.attributes.current_position;s=void 0!==o&&o>=0&&o<=100?o/100*i:i}}const r=this._swingAngles.get(t.id)??0;let a=r;const l=s-r;Math.abs(l)>.001?(a=r+.15*l,this._swingAngles.set(t.id,a),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):a!==s&&(a=s,this._swingAngles.set(t.id,s));const d=t.endPos.x-t.startPos.x,c=t.endPos.y-t.startPos.y,h=Math.sqrt(d*d+c*c);if(!Number.isFinite(h)||h<.5)return null;const p=d/h,g=c/h,u=-g,f=p,_=t.opening_parts??"single",m=t.opening_type??"swing",y="window"===t.type?"window":"door",v=`opening-overlay ${y}-opening`;if("swing"===m){const e=.5*t.thickness,i=.7*t.thickness,o=1.5,s=(t,o)=>{const n=t.x,s=t.y,r=n+p*o*e,a=s+g*o*e;return`M${n-u*i},${s-f*i}\n                    L${n+u*i},${s+f*i}\n                    L${r+u*i},${a+f*i}\n                    L${r-u*i},${a-f*i} Z`},r=e+o,l={x:t.startPos.x+p*r,y:t.startPos.y+g*r},d={x:t.endPos.x-p*r,y:t.endPos.y-g*r},c=t.swing_direction??"left",m="right"===c?t.endPos:t.startPos,x="right"===c?-1:1,b=m.x+p*x*e+u*(t.thickness/2),w=m.y+g*x*e+f*(t.thickness/2);if("door"===y){const e=t.thickness/2,i=m.x+u*e,o=m.y+f*e,r="right"===c?t.startPos:t.endPos,p=r.x+u*e,g=r.y+f*e,_=ji(i,o,p,g,85,"left"===c),y=`M${i},${o} L${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy} Z`,x=Math.cos(a),$=Math.sin(a),k="left"===c?1:-1,E=t=>{const e=t.x-b,i=t.y-w;return{x:b+x*e-k*$*i,y:w+k*$*e+x*i}},P=E(l),M=E(d),S=this._singleEdgePath({start:P,end:M,thickness:t.thickness});return q`
              <g class="${n} ${v}">
                ${this._fadedWedge(t.id,y,i,o,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="door-closed-segment" d="${S}"/>
                <circle class="metal-hinge" cx="${b}" cy="${w}" r="2.5"/>
              </g>
            `}const $=t.thickness/2,k=m.x+u*$,E=m.y+f*$,P="right"===c?t.startPos:t.endPos,M=P.x+u*$,S=P.y+f*$,I=k+u*h,C=E+f*h,z=.5522847498,A=M+z*(I-k),D=S+z*(C-E),T=I+z*(M-k),L=C+z*(S-E),N=`M${M},${S} C${A},${D} ${T},${L} ${I},${C}`,F=`M${k},${E} L${M},${S} C${A},${D} ${T},${L} ${I},${C} Z`;if("double"===_){const i=(l.x+d.x)/2,r=(l.y+d.y)/2,c=.5*o,_=(t.startPos.x+t.endPos.x)/2,m=(t.startPos.y+t.endPos.y)/2,y=h/2,x=t.startPos.x+u*$,b=t.startPos.y+f*$,w=t.endPos.x+u*$,k=t.endPos.y+f*$,E=_+u*$,P=m+f*$,M=x+u*y,S=b+f*y,I=w+u*y,C=k+f*y,A=E+z*(M-x),D=P+z*(S-b),T=M+z*(E-x),L=S+z*(P-b),N=E+z*(I-w),F=P+z*(C-k),W=I+z*(E-w),O=C+z*(P-k),R=`M${x},${b} L${E},${P} C${A},${D} ${T},${L} ${M},${S} Z`,B=`M${w},${k} L${E},${P} C${N},${F} ${W},${O} ${I},${C} Z`,U=Math.cos(a),j=Math.sin(a),H=(t,e,i,o)=>{const n=t.x-e,s=t.y-i;return{x:e+U*n-o*j*s,y:i+o*j*n+U*s}},V=t.startPos.x+p*e+u*(t.thickness/2),Z=t.startPos.y+g*e+f*(t.thickness/2),X=t.endPos.x-p*e+u*(t.thickness/2),Y=t.endPos.y-g*e+f*(t.thickness/2),K={x:i-p*c,y:r-g*c},G={x:i+p*c,y:r+g*c},J=this._singleEdgePath({start:H(l,V,Z,1),end:H(K,V,Z,1),thickness:t.thickness}),Q=this._singleEdgePath({start:H(G,X,Y,-1),end:H(d,X,Y,-1),thickness:t.thickness});return q`
              <g class="${n} ${v}">
                ${this._fadedWedge(`${t.id}-l`,R,x,b,y,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${t.id}-r`,B,w,k,y,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${E},${P} C${A},${D} ${T},${L} ${M},${S}"/>
                <path class="door-swing"
                      d="M${E},${P} C${N},${F} ${W},${O} ${I},${C}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="window-closed-segment" d="${J}"/>
                <path class="window-closed-segment" d="${Q}"/>
              </g>
            `}const W=Math.cos(a),O=Math.sin(a),R="left"===c?1:-1,B=t=>{const e=t.x-b,i=t.y-w;return{x:b+W*e-R*O*i,y:w+R*O*e+W*i}},U=this._singleEdgePath({start:B(l),end:B(d),thickness:t.thickness});return q`
            <g class="${n} ${v}">
              ${this._fadedWedge(t.id,F,k,E,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${N}"/>
              <path class="opening-stop" d="${s(t.startPos,1)}"/>
              <path class="opening-stop" d="${s(t.endPos,-1)}"/>
              <path class="window-closed-segment" d="${U}"/>
            </g>
          `}if("sliding"===m){const i=.3*t.thickness,o=3,s=t.endPos.x+u*i,r=t.endPos.y+f*i,a=t.startPos.x-u*i,l=t.startPos.y-f*i;return q`
            <g class="${n} ${v}">
              <path class="${y}" d="${e}"/>
              <line class="door-swing"
                    x1="${t.startPos.x+u*i}" y1="${t.startPos.y+f*i}"
                    x2="${s}" y2="${r}"/>
              <polygon class="sliding-arrow"
                       points="${s},${r} ${s-p*o+u*o*.5},${r-g*o+f*o*.5} ${s-p*o-u*o*.5},${r-g*o-f*o*.5}"/>
              <line class="door-swing"
                    x1="${t.endPos.x-u*i}" y1="${t.endPos.y-f*i}"
                    x2="${a}" y2="${l}"/>
              <polygon class="sliding-arrow"
                       points="${a},${l} ${a+p*o+u*o*.5},${l+g*o+f*o*.5} ${a+p*o-u*o*.5},${l+g*o-f*o*.5}"/>
              ${"window"===y?q`
                <line class="window-pane"
                      x1="${t.startPos.x}" y1="${t.startPos.y}"
                      x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-f*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+f*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-f*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+f*t.thickness/2}"/>
            </g>
          `}if("tilt"===m){const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,s=.25*h;return q`
            <g class="${n} ${v}">
              <path class="${y}" d="${e}"/>
              <line class="window-pane"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              <line class="door-swing"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${i+u*s}" y2="${o+f*s}"/>
              <line class="door-swing"
                    x1="${t.endPos.x}" y1="${t.endPos.y}"
                    x2="${i+u*s}" y2="${o+f*s}"/>
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-f*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+f*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-f*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+f*t.thickness/2}"/>
            </g>
          `}return null})}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${l.size>0?n.filter(t=>l.has(t.id)&&this._isRenderableSegment(t.startPos,t.endPos)).map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness});return e?q`
          <path class="wall-conflict-highlight"
                d="${e}"/>
        `:null}):null}

      <!-- Selected edge highlights -->
      ${r.map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness});return e?q`
        <path class="wall-selected-highlight"
              d="${e}"/>
      `:null})}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(t=>{const e=n.find(e=>e.id===t);if(!e)return null;const i=this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness});return i?q`
          <path class="wall-blocked-blink"
                d="${i}"/>
        `:null}):null}
    `}_fadedWedge(t,e,i,o,n,s){return e&&Number.isFinite(i)&&Number.isFinite(o)&&Number.isFinite(n)?q`
      <defs>
        <radialGradient id="wg-${t}" cx="${i}" cy="${o}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path class="swing-wedge-fill" d="${e}" fill="url(#wg-${t})" stroke="none"/>
    `:null}_singleEdgePath(t){const{start:e,end:i,thickness:o}=t;if(!this._isFinitePoint(e)||!this._isFinitePoint(i))return"";const n=i.x-e.x,s=i.y-e.y,r=Math.sqrt(n*n+s*s);if(!Number.isFinite(r)||r<.5)return"";const a=Number.isFinite(o)&&o>0?o:6,l=-s/r*(a/2),d=n/r*(a/2);return`M${e.x+l},${e.y+d}\n            L${i.x+l},${i.y+d}\n            L${i.x-l},${i.y-d}\n            L${e.x-l},${e.y-d}\n            Z`}_isFinitePoint(t){return Number.isFinite(t.x)&&Number.isFinite(t.y)}_isRenderableSegment(t,e){return this._isFinitePoint(t)&&this._isFinitePoint(e)&&Math.hypot(e.x-t.x,e.y-t.y)>=.5}_blinkEdges(t){this._blinkTimer&&clearTimeout(this._blinkTimer);const e=Array.isArray(t)?t:[t];this._blinkingEdgeIds=e;const i=Yt.value;if(i){const t=e.map(t=>{const e=i.edges.find(e=>e.id===t);if(!e)return`${t.slice(0,8)}…`;const o=i.nodes.find(t=>t.id===e.start_node),n=i.nodes.find(t=>t.id===e.end_node),s=o&&n?Math.sqrt((n.x-o.x)**2+(n.y-o.y)**2).toFixed(1):"?",r=[];return"free"!==e.direction&&r.push(e.direction),e.length_locked&&r.push("len-locked"),e.angle_group&&r.push(`ang:${e.angle_group.slice(0,4)}`),`${t.slice(0,8)}… (${s}cm${r.length?` ${r.join(",")}`:""})`});console.warn(`%c[constraint]%c Blinking ${e.length} blocked edge(s):\n  ${t.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(t,e){return Math.sqrt((e.x-t.x)**2+(e.y-t.y)**2)}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_getRoomEdgeIds(t,e){const i=e.rooms.find(e=>e.id===t);if(!i)return new Set;const o=i.polygon.vertices;if(o.length<2)return new Set;const n=[];for(const t of o){const i=Ne(t,e.nodes,5);i&&n.push(i.id)}if(n.length<2)return new Set;const s=new Map;for(const t of e.edges)s.set(`${t.start_node}|${t.end_node}`,t.id),s.set(`${t.end_node}|${t.start_node}`,t.id);const r=new Set;for(let t=0;t<n.length;t++){const e=n[t],i=n[(t+1)%n.length],o=s.get(`${e}|${i}`);o&&r.add(o)}return r}_renderFloor(){const t=Yt.value;if(!t)return null;const e=Jt.value,i=oe.value,o=pe.value,n=Ie(this._canvasMode,null!==o),s=this._focusedRoomId,r=s?this._getRoomEdgeIds(s,t):null,a=i.find(t=>"background"===t.id),l=i.find(t=>"structure"===t.id),d=i.find(t=>"furniture"===t.id),c=i.find(t=>"labels"===t.id),h=n.showZoneEditing&&("zone"===Gt.value||!!this._zoneEditor),p=d?.visible&&Se(this._canvasMode,"furniture")?q`
      <g class="furniture-layer-container" opacity="${d.opacity??1}">
        ${this._renderFurnitureLayer()}
      </g>
    `:null,g=l?.visible&&Se(this._canvasMode,"structure")?q`
      <g class="structure-layer" opacity="${l.opacity??1}">
        <!-- Edges (rendered as chains for proper corners) -->
        ${this._renderEdgeChains(t,e,r)}
      </g>
    `:null;return q`
      <!-- Background layer -->
      ${a?.visible&&Se(this._canvasMode,"background",null!==o)&&t.background_image&&t.rooms.length>0?q`
        <defs>
          <clipPath id="bg-clip-${t.id}">
            ${t.rooms.map(t=>q`<path d="${qe(t.polygon)}"/>`)}
          </clipPath>
        </defs>
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               clip-path="url(#bg-clip-${t.id})"
               opacity="${a.opacity??1}"
               class="${s?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer (rooms) -->
      ${l?.visible&&Se(this._canvasMode,"structure",null!==o)?q`
        <g class="structure-layer" opacity="${l.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>q`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""} ${s?t.id===s?"room-focused":"room-dimmed":""}"
                  d="${qe(t.polygon)}"
                  fill="${t.color}"
                  stroke="none"/>
          `)}
          <!-- Room background layers -->
          ${t.rooms.filter(t=>(t.background_layers??[]).length>0||this._roomEditor?.room.id===t.id&&this._roomEditor.editLayers.length>0).map(t=>{const e=t.polygon.vertices,i=e.map(t=>t.x),o=e.map(t=>t.y),n=Math.min(...i),r=Math.min(...o),a=Math.max(...i)-n,l=Math.max(...o)-r,d=this._roomEditor&&this._roomEditor.room.id===t.id?this._roomEditor.editLayers:t.background_layers??[];return q`
              <clipPath id="room-bg-clip-${t.id}">
                <path d="${qe(t.polygon)}"/>
              </clipPath>
              <g clip-path="url(#room-bg-clip-${t.id})"
                 class="${s?t.id===s?"room-focused":"room-dimmed":""}">
                ${d.filter(t=>t.visible).map(t=>{const e=a*t.scale,i=l*t.scale,o=n+t.offset_x,s=r+t.offset_y;return q`
                    <image href="${t.url}"
                           x="${o}" y="${s}" width="${e}" height="${i}"
                           preserveAspectRatio="xMidYMid slice"
                           opacity="${t.opacity}"/>
                  `})}
              </g>
              ${this._roomEditor&&this._roomEditor.room.id===t.id&&null!==this._roomEditor.selectedLayerIdx?(()=>{const t=this._roomEditor.selectedLayerIdx,e=this._roomEditor.editLayers[t];if(!e)return null;const i=a*e.scale,o=l*e.scale,s=n+e.offset_x,d=r+e.offset_y,c=this._svg?5*this._viewBox.width/this._svg.clientWidth:5,h=this._svg?1.5*this._viewBox.width/this._svg.clientWidth:1.5;return q`
                  <rect x="${s}" y="${d}" width="${i}" height="${o}"
                        fill="none" stroke="var(--primary-color, #2196f3)"
                        stroke-width="${h}" stroke-dasharray="${4*h} ${2*h}"
                        pointer-events="none"/>
                  ${[["tl",s,d],["tr",s+i,d],["bl",s,d+o],["br",s+i,d+o]].map(([e,i,o])=>q`
                    <circle cx="${i}" cy="${o}" r="${c}"
                            fill="white" stroke="var(--primary-color, #2196f3)" stroke-width="${h}"
                            style="cursor:${"tl"===e||"br"===e?"nwse-resize":"nesw-resize"}"
                            @pointerdown=${i=>this._startCornerDrag(i,e,t,n,r,a,l)}/>
                  `)}
                `})():null}
            `})}
        </g>
      `:null}

      ${h?g:p}
      ${h?p:g}

      <!-- Labels layer (hidden in viewing mode) -->
      ${c?.visible&&Se(this._canvasMode,"labels",null!==o)?q`
        <g class="labels-layer" opacity="${c.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);if(!e)return null;const i=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name,o=!!t.ha_area_id;return q`
              <g class="room-label-group ${s?t.id===s?"label-focused":"label-dimmed":""}" transform="translate(${e.x}, ${e.y})">
                <text class="room-label" x="0" y="0">
                  ${i}
                </text>
                ${o?q`
                  <g class="room-link-icon" transform="translate(${3.8*i.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}
    `}_isDeviceInFocusedRegion(t,e,i,o){if(t===i)return!0;const n=o.zones?.find(t=>t.id===i);if(n?.polygon?.vertices&&this._pointInOrNearPolygon(e,n.polygon.vertices,5))return!0;const s=o.rooms.find(t=>t.id===i);return!(!s||!this._pointInOrNearPolygon(e,s.polygon.vertices,5))}_renderDeviceLayer(t){const e=oe.value,i=this._focusedRoomId,o=pe.value,n=Ie(this._canvasMode,null!==o);return e.find(t=>"devices"===t.id)?.visible&&Se(this._canvasMode,"devices",null!==o)?q`
      <g class="devices-layer" opacity="${e.find(t=>"devices"===t.id)?.opacity??1}">
        ${o||!n.showNormalDevices?null:ne.value.filter(e=>e.floor_id===t.id).map(e=>q`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderLight(e)}
            </g>
          `)}
        ${o||!n.showNormalDevices?null:se.value.filter(e=>e.floor_id===t.id).map(e=>q`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderSwitch(e)}
            </g>
          `)}
        ${o||!n.showNormalDevices?null:re.value.filter(e=>e.floor_id===t.id).map(e=>q`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderButton(e)}
            </g>
          `)}
        ${o||!n.showNormalDevices?null:ae.value.filter(e=>e.floor_id===t.id).map(e=>q`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderOther(e)}
            </g>
          `)}
        ${n.showMmwave?this._renderMmwaveLayer(t):null}
      </g>
    `:null}_renderDeviceIcon(t,e,i,o,n,s,r,a,l,d=[]){const c=Jt.value,h="viewing"===this._canvasMode,p=h?16:14,g=h?16:18,u=this._getIconData("mdi:devices"),f=l??u,_=f?.viewBox??"0 0 24 24";return q`
      <g class="device-marker ${i?"on":"off"} ${c.type===o&&c.ids.includes(n)?"selected":""}"
         transform="translate(${t}, ${e})">
        <circle r="${p}"
          fill="${h?"#fff":i?r:"#e0e0e0"}"
          stroke="${h?"none":"#333"}"
          stroke-width="${h?0:2}"/>
        ${f?.path?q`
          <svg x="${-g/2}" y="${-g/2}" width="${g}" height="${g}" viewBox="${_}">
            <path d="${f.path}" fill="${h&&i?r:a}"></path>
            ${f.secondaryPath?q`<path d="${f.secondaryPath}" fill="${h&&i?r:a}"></path>`:null}
          </svg>
        `:null}
        ${h?null:q`<text y="${p+12}" text-anchor="middle" font-size="10" fill="#333">${s}</text>`}
        ${this._renderDeviceIssueBadge(.72*p,.72*-p,d)}
      </g>
    `}_renderDeviceIssueBadge(t,e,i){if(0===i.length)return null;const o=function(t){return t.map(t=>t.message).join("; ")}(i);return q`
      <g class="device-issue-badge" transform="translate(${t}, ${e})">
        <title>${o}</title>
        <circle cx="0" cy="0" r="7"/>
        <text x="0" y="0">!</text>
      </g>
    `}_renderLight(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:lightbulb"),s=ve(t,this.hass?.states??{}),r=e?.attributes?.rgb_color,a=r?`rgb(${r[0]},${r[1]},${r[2]})`:"#ffd600";return this._renderDeviceIcon(t.position.x,t.position.y,i,"light",t.id,o,a,i?"#333":"#616161",n,s)}_renderSwitch(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:toggle-switch"),s=ve(t,this.hass?.states??{});return this._renderDeviceIcon(t.position.x,t.position.y,i,"switch",t.id,o,"#4caf50",i?"#fff":"#616161",n,s)}_renderButton(t){const e=this.hass?.states[t.entity_id],i=t.label||e?.attributes.friendly_name||t.entity_id,o=this._getEntityIconData(e,"mdi:gesture-tap-button"),n=ve(t,this.hass?.states??{});return this._renderDeviceIcon(t.position.x,t.position.y,!1,"button",t.id,i,"#2196f3","#616161",o,n)}_renderOther(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:devices"),s=ve(t,this.hass?.states??{});return this._renderDeviceIcon(t.position.x,t.position.y,i,"other",t.id,o,"#9c27b0",i?"#fff":"#616161",n,s)}_renderMmwaveLayer(t){const e=pe.value,i=Ie(this._canvasMode,null!==e),o=ge.value.filter(i=>i.floor_id===t.id&&(!e||i.id===e.placementId));if(0===o.length)return null;const n="viewing"===this._canvasMode,s=Jt.value,r=i.showMmwaveCoverage&&!n&&!e,a=this._viewBox,l=Math.max(a.width,a.height)/100,d=.5*l,c=2.5*d,h=.8*l,p=new Set;for(const e of this._mmwaveTargetPositions.values())for(const i of t.rooms){if(p.has(i.id))continue;const t=i.polygon?.vertices;if(!t||t.length<3)continue;let o=!1;for(let i=0,n=t.length-1;i<t.length;n=i++)t[i].y>e.displayY!=t[n].y>e.displayY&&e.displayX<(t[n].x-t[i].x)*(e.displayY-t[i].y)/(t[n].y-t[i].y)+t[i].x&&(o=!o);o&&p.add(i.id)}return q`
      <g class="mmwave-layer">
        <!-- Occupied room overlays -->
        ${e?null:t.rooms.filter(t=>p.has(t.id)&&t.polygon?.vertices?.length).map(t=>q`
            <path d="${qe(t.polygon)}"
                  fill="rgba(255, 255, 255, 0.05)" stroke="none"
                  class="mmwave-occupied-room"/>
          `)}
        ${o.map(i=>{const o=xe(i,this.hass?.states??{}),n="mmwave"===s.type&&s.ids.includes(i.id),a=i.field_of_view/2,p=i.detection_range,g=i.position.x,u=i.position.y,f=(i.angle-a)*Math.PI/180,_=(i.angle+a)*Math.PI/180,m=g+p*Math.cos(f),y=u+p*Math.sin(f),v=g+p*Math.cos(_),x=u+p*Math.sin(_),b=i.field_of_view>180?1:0,w=i.angle*Math.PI/180,$=g+30*Math.cos(w),k=u+30*Math.sin(w);let E=i.room_id?t.rooms.find(t=>t.id===i.room_id):null;E||(E=t.rooms.find(t=>{const e=t.polygon?.vertices;if(!e||e.length<3)return!1;let i=!1;for(let t=0,o=e.length-1;t<e.length;o=t++)e[t].y>u!=e[o].y>u&&g<(e[o].x-e[t].x)*(u-e[t].y)/(e[o].y-e[t].y)+e[t].x&&(i=!i);return i})??null);const P=`mmwave-clip-${i.id}`,M=new Set,S=Xt.value?.unit??"cm";for(let t=0;t<(i.targets??[]).length;t++){const e=i.targets[t];if(!e.x_entity_id||!e.y_entity_id)continue;const o=this.hass?.states[e.x_entity_id],n=this.hass?.states[e.y_entity_id];if(!o||!n)continue;const s=parseFloat(o.state),r=parseFloat(n.state);if(Number.isNaN(s)||Number.isNaN(r)||0===s&&0===r)continue;const a=`${i.id}-${t}`;M.add(a);const l=this._mmwaveTargetPositions.get(a),d=Ce(i,s,r,S),c=ze(i,l?{x:l.targetX,y:l.targetY}:void 0,d);l?(l.targetX=c.x,l.targetY=c.y,l.arrived=!1):this._mmwaveTargetPositions.set(a,{displayX:c.x,displayY:c.y,targetX:c.x,targetY:c.y,arrived:!0,isNew:!0}),this._ensureMmwaveAnimLoop()}for(const[t,e]of this._mmwaveTargetPositions)t.startsWith(`${i.id}-`)&&!M.has(t)&&(this._mmwaveFadingTargets.some(e=>e.key===t)||(this._mmwaveFadingTargets=[...this._mmwaveFadingTargets,{key:t,x:e.displayX,y:e.displayY,startTime:Date.now()}],this._ensureMmwaveAnimLoop()),this._mmwaveTargetPositions.delete(t));const I=(i.targets??[]).map((t,e)=>{const o=`${i.id}-${e}`,n=this._mmwaveTargetPositions.get(o);if(!n)return null;const s=n.isNew;return n.isNew&&(n.isNew=!1),q`
              <g class="mmwave-target" transform="translate(${n.displayX}, ${n.displayY})">
                ${s?q`
                  <animateTransform attributeName="transform" type="scale"
                    from="0 0" to="1 1" dur="0.35s" fill="freeze" additive="sum"/>
                  <animate attributeName="opacity" from="0" to="1" dur="0.35s" fill="freeze"/>
                `:null}
                <!-- Pulse ring -->
                <circle cx="0" cy="0" r="${c}"
                  fill="none" stroke="#ff5722" stroke-width="${.06*l}" opacity="0.4">
                  <animate attributeName="r" values="${d};${c}" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <!-- Target dot -->
                <circle cx="0" cy="0" r="${d}"
                  fill="#ff5722" stroke="#fff" stroke-width="${.1*l}" opacity="0.95"/>
                <!-- Target label -->
                <text x="0" y="${-d-.3*l}" text-anchor="middle"
                  font-size="${h}" fill="#ff5722" font-weight="600">T${e+1}</text>
              </g>
            `}),C=e?.placementId===i.id?(()=>{const t=e.activePoint,i=(e.points??[]).filter(e=>!t||Math.abs(e.x-t.x)>.001||Math.abs(e.y-t.y)>.001).map((t,e)=>q`
                      <g class="mmwave-calibration-point" transform="translate(${t.x}, ${t.y})">
                        <circle cx="0" cy="0" r="${1.15*d}"
                          fill="#00bcd4" stroke="#fff" stroke-width="${.1*l}" opacity="0.95"/>
                        <rect x="${.52*-l}" y="${-d-.92*l}"
                          width="${1.04*l}" height="${.44*l}" rx="${.18*l}"
                          fill="var(--card-background-color, #fff)" stroke="#00acc1"
                          stroke-width="${.04*l}" opacity="0.94"/>
                        <text x="0" y="${-d-.6*l}" text-anchor="middle"
                          font-size="${.78*h}" fill="#00acc1" font-weight="700">P${e+1}</text>
                      </g>
                    `);if(!t)return i;const o=Math.max(0,Math.min(1,e.sampleProgress??0)),n=e.sampleCount??0,s=e.sampleGoal??25,r=1.55*d,a=2*Math.PI*r,c=a*o,p=e.status??"Sampling",g="Captured"===p?"Captured":`${n}/${s}`,u="Needs 10 samples"===p?"#f44336":"#00acc1";return[...i,q`
                      <g class="mmwave-calibration-point active" transform="translate(${t.x}, ${t.y})">
                        <circle cx="0" cy="0" r="${r}"
                          fill="rgba(0, 188, 212, 0.14)" stroke="rgba(255,255,255,0.9)"
                          stroke-width="${.08*l}"/>
                        <circle cx="0" cy="0" r="${r}"
                          fill="none" stroke="#00bcd4" stroke-width="${.16*l}"
                          stroke-linecap="round" stroke-dasharray="${c} ${a}"
                          transform="rotate(-90)"/>
                        <circle cx="0" cy="0" r="${1.05*d}"
                          fill="${u}" stroke="#fff" stroke-width="${.1*l}" opacity="0.98"/>
                        <rect x="${.95*-l}" y="${-r-.82*l}"
                          width="${1.9*l}" height="${.5*l}" rx="${.2*l}"
                          fill="var(--card-background-color, #fff)" stroke="${u}"
                          stroke-width="${.04*l}" opacity="0.96"/>
                        <text x="0" y="${-r-.46*l}" text-anchor="middle"
                          font-size="${.76*h}" fill="${u}" font-weight="800">${g}</text>
                        <text x="0" y="${r+.55*l}" text-anchor="middle"
                          font-size="${.72*h}" fill="${u}" font-weight="700">${p}</text>
                      </g>
                    `]})():null,z=this._mmwaveFadingTargets.filter(t=>t.key.startsWith(`${i.id}-`)).map(t=>{const e=Date.now()-t.startTime,i=Math.min(e/800,1),o=1-i,n=i*l*.5,s=1-.3*i,r=`mmwave-fade-${t.key.replace(/[^a-zA-Z0-9]/g,"_")}`;return q`
                <g class="mmwave-target-fade" transform="translate(${t.x}, ${t.y}) scale(${s})"
                   opacity="${o}">
                  <defs>
                    <filter id="${r}">
                      <feGaussianBlur stdDeviation="${n}"/>
                    </filter>
                  </defs>
                  <g filter="url(#${r})">
                    <circle cx="0" cy="0" r="${d}"
                      fill="#ff5722" stroke="#fff" stroke-width="${.1*l}"/>
                  </g>
                </g>
              `});return q`
            <g class="mmwave-placement ${n?"selected":""}">
              ${r?q`
                ${E?.polygon?.vertices?.length?q`
                  <!-- FOV cone clipped to room -->
                  <defs>
                    <clipPath id="${P}">
                      <path d="${qe(E.polygon)}"/>
                    </clipPath>
                  </defs>
                  <path
                    d="M ${g} ${u} L ${m} ${y} A ${p} ${p} 0 ${b} 1 ${v} ${x} Z"
                    fill="rgba(33, 150, 243, 0.1)"
                    stroke="rgba(33, 150, 243, 0.4)"
                    stroke-width="1"
                    stroke-dasharray="4 2"
                    clip-path="url(#${P})"
                  />
                `:q`
                  <!-- FOV cone (no room to clip) -->
                  <path
                    d="M ${g} ${u} L ${m} ${y} A ${p} ${p} 0 ${b} 1 ${v} ${x} Z"
                    fill="rgba(33, 150, 243, 0.1)"
                    stroke="rgba(33, 150, 243, 0.4)"
                    stroke-width="1"
                    stroke-dasharray="4 2"
                  />
                `}
                <!-- Sensor icon -->
                <circle cx="${g}" cy="${u}" r="8"
                  fill="#2196f3" stroke="#fff" stroke-width="2"/>
                <text x="${g}" y="${u+3}" text-anchor="middle"
                  font-size="8" fill="#fff" font-weight="bold">R</text>
                ${this._renderDeviceIssueBadge(g+8,u-8,o)}
              `:null}
              ${e?q`
                <circle cx="${g}" cy="${u}" r="10"
                  fill="#2196f3" stroke="#fff" stroke-width="2.5"/>
                <text x="${g}" y="${u+3}" text-anchor="middle"
                  font-size="8" fill="#fff" font-weight="bold">R</text>
                ${this._renderDeviceIssueBadge(g+9,u-9,o)}
              `:null}
              ${I}
              ${C}
              ${z}
              ${r&&n?q`
                <!-- Rotation handle -->
                <g class="rotation-handle"
                   data-mmwave-id="${i.id}"
                   @pointerdown=${t=>this._startMmwaveRotation(t,i)}>
                  <line class="rotation-handle-line"
                    x1="${g}" y1="${u}" x2="${$}" y2="${k}" />
                  <circle class="rotation-handle-dot"
                    cx="${$}" cy="${k}" r="4.5" />
                </g>
              `:null}
            </g>
          `})}
      </g>
    `}_renderNodeGuideDots(){const t=Yt.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=t.nodes.filter(t=>e.has(t.id));return 0===i.length?null:q`
      <g class="node-guide-dots">
        ${i.map(t=>q`
          <circle cx="${t.x}" cy="${t.y}" r="4"
            fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        `)}
      </g>
    `}_renderNodeEndpoints(){const t=Yt.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=[];for(const o of t.nodes)o.pinned&&e.has(o.id)&&i.push({node:o,coords:{x:o.x,y:o.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&e.has(this._draggingNode.node.id)){const e=i.findIndex(t=>t.node.id===this._draggingNode.node.id);e>=0&&i.splice(e,1);const{positions:o,blocked:n}=xi(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:o.get(this._draggingNode.node.id)??this._cursorPos;i.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&e.has(this._hoveredNode.id)&&(i.some(t=>t.node.id===this._hoveredNode.id)||i.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===i.length)return null;return q`
      <g class="wall-endpoints-layer">
        ${i.map(t=>t.isPinned?q`
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
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,{positions:i,blocked:o}=xi(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y);if(o)return null;const n=Te(t),s=[];for(const t of n){const e=i.get(t.start_node),o=i.get(t.end_node);if(!e&&!o)continue;const n=e??t.startPos,r=o??t.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:t.startPos,origEnd:t.endPos,length:a,angle:l,thickness:t.thickness})}const r=[];for(let t=0;t<s.length;t++)for(let i=t+1;i<s.length;i++){const o=Math.abs(s[t].angle-s[i].angle)%Math.PI;Math.abs(o-Math.PI/2)<.02&&r.push({point:e,angle:Math.min(s[t].angle,s[i].angle)})}return q`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:t,origEnd:e,thickness:i})=>{const o=e.x-t.x,n=e.y-t.y,s=Math.sqrt(o*o+n*n);if(0===s)return null;const r=-n/s*(i/2),a=o/s*(i/2);return q`
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
      ${s.map(({start:t,end:e,length:i})=>{const o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return q`
          <g transform="translate(${o}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
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
    `}_handleNodePointerDown(t,e){if(2===t.button)return;t.stopPropagation(),t.preventDefault();const i=this._hoveredNode||e;if("wall"===Gt.value){const e={x:i.x,y:i.y};return void this._handleWallClick(e,t.shiftKey)}if(i.pinned)return this._wallStartPoint={x:i.x,y:i.y},Gt.value="wall",void(this._hoveredNode=null);this._draggingNode={node:i,originalCoords:{x:i.x,y:i.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_handleZonePolyClick(t){const e=this._zonePolyPoints;if(e.length>=3){const i=e[0];if(Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2)<15)return this._pendingZonePolygon=[...e],this._zonePolyPoints=[],void this._saveZone("Zone")}this._zonePolyPoints=[...e,t]}async _saveZone(t){if(!this.hass||!this._pendingZonePolygon)return;const e=Yt.value,i=Xt.value;if(e&&i){try{await this.hass.callWS({type:"inhabit/zones/add",floor_plan_id:i.id,floor_id:e.id,name:t,polygon:{vertices:this._pendingZonePolygon.map(t=>({x:t.x,y:t.y}))},color:"#a1c4fd"}),await _e()}catch(t){console.error("Error saving zone:",t)}this._pendingZonePolygon=null}}_renderFurnitureLayer(){const t=Yt.value;if(!t||!t.zones||0===t.zones.length)return null;const e=Jt.value,i=this._focusedRoomId,o=t.zones,n=i?t.rooms.find(t=>t.id===i):null,s=(t,e)=>{const i=Math.round(t.x),o=Math.round(t.y),n=Math.round(e.x),s=Math.round(e.y);return i<n||i===n&&o<=s?`${i},${o}-${n},${s}`:`${n},${s}-${i},${o}`},r=Te(t),a=r.map(t=>({x1:Math.round(t.startPos.x),y1:Math.round(t.startPos.y),x2:Math.round(t.endPos.x),y2:Math.round(t.endPos.y)})),l=new Set;for(const t of r)l.add(s(t.startPos,t.endPos));const d=(t,e)=>{if(l.has(s(t,e)))return!0;const i=e.x-t.x,o=e.y-t.y,n=i*i+o*o;if(n<1)return!1;const r=Math.sqrt(n),d=[];for(const e of a){const s=Math.abs(i*(e.y1-t.y)-o*(e.x1-t.x))/r,a=Math.abs(i*(e.y2-t.y)-o*(e.x2-t.x))/r;if(s>5||a>5)continue;const l=(i*(e.x1-t.x)+o*(e.y1-t.y))/n,c=(i*(e.x2-t.x)+o*(e.y2-t.y))/n;d.push([Math.min(l,c),Math.max(l,c)])}if(0===d.length)return!1;d.sort((t,e)=>t[0]-e[0]);let c=d[0][0];if(c>.05)return!1;for(const[t,e]of d){if(t>c+.05)return!1;c=Math.max(c,e)}return c>=.95},c=new Map;for(const t of o){if(!t.polygon?.vertices?.length)continue;const e=t.polygon.vertices,o=this._getPolygonCenter(e),r=i&&(t.id===i||t.room_id===i||n&&o&&this._pointInOrNearPolygon(o,n.polygon.vertices,5)),a=i?r?"":"room-dimmed":"",l=t.color||"#a1c4fd";for(let t=0;t<e.length;t++){const i=e[t],o=e[(t+1)%e.length],n=s(i,o);d(i,o)||(c.has(n)||c.set(n,{a:i,b:o,color:l,dimClass:a}))}}return q`
      <g class="furniture-layer">
        ${o.map(t=>{if(!t.polygon?.vertices?.length)return null;const o=qe(t.polygon),s="zone"===e.type&&e.ids.includes(t.id),r=this._getPolygonCenter(t.polygon.vertices),a=i&&(t.id===i||t.room_id===i||n&&r&&this._pointInOrNearPolygon(r,n.polygon.vertices,5));return q`
            <g class="${i?a?"":"room-dimmed":""}">
              <path class="zone-shape ${s?"selected":""}"
                    d="${o}"
                    fill="${t.color||"#a1c4fd"}"
                    fill-opacity="0.35"
                    stroke="none"/>
              ${r?q`
                <text class="zone-label" x="${r.x}" y="${r.y}">${t.name}</text>
              `:null}
              ${s?this._renderZoneVertexHandles(t):null}
            </g>
          `})}
        <!-- Deduplicated zone border edges (skip wall overlaps) -->
        ${Array.from(c.values()).map(({a:t,b:e,color:i,dimClass:o})=>q`
          <line class="zone-border ${o}" x1="${t.x}" y1="${t.y}" x2="${e.x}" y2="${e.y}"
                stroke="${i}" stroke-width="1.5" stroke-dasharray="4,3"
                pointer-events="none"/>
        `)}
      </g>
    `}_renderZoneVertexHandles(t){const e=t.polygon?.vertices;if(!e?.length)return null;const i=t.color||"#2196f3";return q`
      <!-- Midpoint handles for inserting new vertices -->
      ${e.map((o,n)=>{const s=e[(n+1)%e.length],r=(o.x+s.x)/2,a=(o.y+s.y)/2;return q`
          <circle
            class="zone-midpoint-handle"
            cx="${r}" cy="${a}" r="4"
            fill="${i}" fill-opacity="0.3" stroke="${i}" stroke-width="1"
            style="cursor: copy"
            @pointerdown=${e=>{e.stopPropagation(),e.preventDefault(),this._insertZoneVertex(t,n,{x:r,y:a},e.pointerId)}}
          />
        `})}
      <!-- Vertex handles (drag to move, right-click to remove) -->
      ${e.map((o,n)=>q`
        <circle
          class="zone-vertex-handle"
          cx="${o.x}" cy="${o.y}" r="6"
          fill="white" stroke="${i}" stroke-width="1.5"
          style="cursor: grab"
          @pointerdown=${e=>{2!==e.button&&(e.stopPropagation(),e.preventDefault(),this._draggingZoneVertex={zone:t,vertexIndex:n,originalCoords:{x:o.x,y:o.y},pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId))}}
          @contextmenu=${i=>{i.stopPropagation(),i.preventDefault(),e.length>3&&this._removeZoneVertex(t,n)}}
        />
      `)}
    `}async _insertZoneVertex(t,e,i,o){if(!t.polygon?.vertices||!this.hass)return;const n=Xt.value;if(!n)return;const s=[...t.polygon.vertices];s.splice(e+1,0,{x:i.x,y:i.y});try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:n.id,zone_id:t.id,polygon:{vertices:s.map(t=>({x:t.x,y:t.y}))}}),await _e();const r=Yt.value,a=r?.zones?.find(e=>e.id===t.id);a?.polygon?.vertices&&(this._draggingZoneVertex={zone:a,vertexIndex:e+1,originalCoords:{x:i.x,y:i.y},pointerId:o},this._svg?.setPointerCapture(o))}catch(t){console.error("Error inserting zone vertex:",t)}}async _removeZoneVertex(t,e){if(!t.polygon?.vertices||!this.hass)return;if(t.polygon.vertices.length<=3)return;const i=Xt.value;if(!i)return;const o=t.polygon.vertices.filter((t,i)=>i!==e);try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:i.id,zone_id:t.id,polygon:{vertices:o.map(t=>({x:t.x,y:t.y}))}}),await _e()}catch(t){console.error("Error removing zone vertex:",t)}}_renderFurnitureDrawingPreview(){if("zone"===Gt.value&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints,e=this._cursorPos;let i=`M ${t[0].x} ${t[0].y}`;for(let e=1;e<t.length;e++)i+=` L ${t[e].x} ${t[e].y}`;i+=` L ${e.x} ${e.y}`;let o=null;if(t.length>=3){const i=t[0];Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2)<15&&(o=q`<circle cx="${i.x}" cy="${i.y}" r="8" fill="rgba(76, 175, 80, 0.3)" stroke="#4caf50" stroke-width="2"/>`)}return q`
        <g class="furniture-preview">
          <path class="furniture-poly-preview" d="${i}"/>
          ${t.map(t=>q`
            <circle cx="${t.x}" cy="${t.y}" r="4" fill="var(--primary-color, #2196f3)" stroke="white" stroke-width="1.5"/>
          `)}
          ${o}
        </g>
      `}return null}_renderZoneEditor(){if(!this._zoneEditor)return null;const t=this._getAssignedHaAreaIds({zoneId:this._zoneEditor.zone.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._zoneEditor?.editAreaId);return H`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Zone</span>
          <button class="wall-editor-close" @click=${()=>{this._zoneEditor=null,Jt.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Area</span>
          <select class="wall-editor-select"
            .value=${this._zoneEditor.editAreaId??""}
            @change=${t=>{if(!this._zoneEditor)return;const e=t.target.value,i=this._haAreas.find(t=>t.area_id===e);this._zoneEditor={...this._zoneEditor,editAreaId:e||null,editName:i?i.name:this._zoneEditor.editName}}}
          >
            <option value="">None</option>
            ${e.map(t=>H`
              <option value=${t.area_id} ?selected=${this._zoneEditor?.editAreaId===t.area_id}>${t.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Name</span>
          <input
            type="text"
            .value=${this._zoneEditor.editName}
            @input=${t=>{this._zoneEditor&&(this._zoneEditor={...this._zoneEditor,editName:t.target.value})}}
            @keydown=${t=>{"Enter"===t.key?this._handleZoneEditorSave():"Escape"===t.key&&(this._zoneEditor=null,Jt.value={type:"none",ids:[]})}}
          />
        </div>

        ${this._zoneEditor.zone.polygon?.vertices?.length?H`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Size</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <label style="font-size:11px;">W</label>
              <input type="number" style="width:60px;" .value=${String(this._getZoneBBoxWidth())}
                @change=${t=>this._handleZoneSizeChange("width",parseFloat(t.target.value))}
              />
              <label style="font-size:11px;">H</label>
              <input type="number" style="width:60px;" .value=${String(this._getZoneBBoxHeight())}
                @change=${t=>this._handleZoneSizeChange("height",parseFloat(t.target.value))}
              />
            </div>
          </div>
        `:null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Color</span>
          <div class="wall-editor-colors">
            ${["#a1c4fd","#c5e1a5","#ffe0b2","#d1c4e9","#ffccbc","#b0bec5","#e0e0e0","#f8bbd0"].map(t=>H`
              <button
                class="color-swatch ${this._zoneEditor?.editColor===t?"active":""}"
                style="background:${t};"
                @click=${()=>{this._zoneEditor&&(this._zoneEditor={...this._zoneEditor,editColor:t})}}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleZoneEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleZoneDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}_getZoneBBoxWidth(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.x);return Math.round(Math.max(...t)-Math.min(...t))}_getZoneBBoxHeight(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.y);return Math.round(Math.max(...t)-Math.min(...t))}_handleZoneSizeChange(t,e){if(!this._zoneEditor||!this.hass||e<=0)return;const i=this._zoneEditor.zone,o=i.polygon?.vertices;if(!o?.length)return;const n=o.map(t=>t.x),s=o.map(t=>t.y),r=Math.min(...n),a=Math.max(...n),l=Math.min(...s),d=Math.max(...s),c=(r+a)/2,h=(l+d)/2,p=a-r,g=d-l;if(0===p||0===g)return;const u="width"===t?e/p:1,f="height"===t?e/g:1,_=o.map(t=>({x:c+(t.x-c)*u,y:h+(t.y-h)*f}));for(let t=0;t<o.length;t++)o[t]=_[t];this.requestUpdate();const m=Xt.value;m&&this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:m.id,zone_id:i.id,polygon:{vertices:_.map(t=>({x:t.x,y:t.y}))}}).then(()=>_e()).catch(t=>console.error("Error resizing zone:",t))}async _handleZoneEditorSave(){if(!this._zoneEditor||!this.hass)return;const t=Xt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id,name:this._zoneEditor.editName,color:this._zoneEditor.editColor,ha_area_id:this._zoneEditor.editAreaId??""}),await _e()}catch(t){console.error("Error updating zone:",t)}this._zoneEditor=null,Jt.value={type:"none",ids:[]}}}async _handleZoneDelete(){if(!this._zoneEditor||!this.hass)return;const t=Xt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/delete",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id}),await _e()}catch(t){console.error("Error deleting zone:",t)}this._zoneEditor=null,Jt.value={type:"none",ids:[]}}}async _finishZoneVertexDrag(){if(!this._draggingZoneVertex||!this.hass)return;const t=Xt.value;if(!t)return;const e=this._draggingZoneVertex.zone;if(e.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:e.id,polygon:{vertices:e.polygon.vertices.map(t=>({x:t.x,y:t.y}))}}),await _e()}catch(t){console.error("Error moving zone vertex:",t),e.polygon?.vertices&&this._draggingZoneVertex&&(e.polygon.vertices[this._draggingZoneVertex.vertexIndex]=this._draggingZoneVertex.originalCoords)}}_renderDrawingPreview(){if("wall"===Gt.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,i=this._calculateWallLength(t,e),o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return q`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${t.x}" y1="${t.y}"
                x2="${e.x}" y2="${e.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${o}, ${n}) rotate(${r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const t=Gt.value;if("door"!==t&&"window"!==t)return null;const{position:e,startPos:i,endPos:o,thickness:n}=this._openingPreview,s="door"===t?80:100,r=o.x-i.x,a=o.y-i.y,l=Math.sqrt(r*r+a*a);if(0===l)return null;const d=r/l,c=a/l,h=-c,p=d,g=s/2,u=n/2,f=e.x,_=e.y,m=`M${f-d*g+h*u},${_-c*g+p*u}\n                      L${f+d*g+h*u},${_+c*g+p*u}\n                      L${f+d*g-h*u},${_+c*g-p*u}\n                      L${f-d*g-h*u},${_-c*g-p*u}\n                      Z`;if("window"===t)return q`
        <g class="opening-ghost">
          <path class="window" d="${m}"/>
          <line class="window-pane"
                x1="${f}" y1="${_}"
                x2="${f+h*n}" y2="${_+p*n}"/>
        </g>
      `;const y=f-d*g,v=_-c*g,x=f+d*g,b=_+c*g,w=ji(y,v,x,b,85,!0),$=w.ox-y,k=w.oy-v,E=Math.sqrt($*$+k*k),P=E>0?-k/E*1.25:0,M=E>0?$/E*1.25:0,S=`M${y+P},${v+M} L${w.ox+P},${w.oy+M} L${w.ox-P},${w.oy-M} L${y-P},${v-M} Z`,I=`M${y},${v} L${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy} Z`,C=f-d*g,z=_-c*g,A=f+d*g,D=_+c*g;return q`
      <g class="opening-ghost">
        <path class="door" d="${m}"/>
        <path class="swing-wedge" d="${I}"/>
        <path class="door-leaf-panel" d="${S}"/>
        <path class="door-swing"
              d="M${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy}"/>
        <line class="door-jamb" x1="${C-h*u}" y1="${z-p*u}" x2="${C+h*u}" y2="${z+p*u}"/>
        <line class="door-jamb" x1="${A-h*u}" y1="${D-p*u}" x2="${A+h*u}" y2="${D+p*u}"/>
        <circle class="hinge-glow" cx="${y}" cy="${v}" r="5"/>
        <circle class="hinge-dot" cx="${y}" cy="${v}" r="3"/>
      </g>
    `}_getPolygonCenter(t){if(0===t.length)return null;if(t.length<3){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}let e=0,i=0,o=0;const n=t.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=t[s].x*t[r].y-t[r].x*t[s].y;e+=a,i+=(t[s].x+t[r].x)*a,o+=(t[s].y+t[r].y)*a}if(e/=2,Math.abs(e)<1e-6){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/n,y:i/n}}const s=1/(6*e);return{x:i*s,y:o*s}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const t=this._edgeEditor.edge,e="door"===t.type,i="window"===t.type,o=e||i;return H`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e?"Door Properties":i?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t.link_group?(()=>{const e=Yt.value,i=t.link_group,o=e?e.edges.filter(t=>t.link_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${qi(i)};">
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

        ${t.collinear_group?(()=>{const e=Yt.value,i=t.collinear_group,o=e?e.edges.filter(t=>t.collinear_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${qi(i)};">
                <ha-icon icon="mdi:vector-line" style="--mdc-icon-size:14px;"></ha-icon>
                Collinear (${o} edges)
              </span>
              <button
                class="constraint-btn"
                @click=${()=>this._collinearUnlinkEdges()}
                title="Remove collinear constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `})():null}

        ${o?(()=>{const e=Yt.value;if(!e)return null;const i=Ae(e.nodes),o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=n.x-o.x,l=n.y-o.y,d=Math.sqrt(a*a+l*l);if(0===d)return null;const c=-l/d,h=a/d,p=t.thickness/2+5,g={x:s+c*p,y:r+h*p},u={x:s-c*p,y:r-h*p},f=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(g,t.polygon.vertices)),_=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(u,t.polygon.vertices)),m=f?.name||(t.is_exterior?"Outside":null),y=_?.name||(t.is_exterior?"Outside":null);return m||y?H`
            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Opens into</span>
              <div class="wall-editor-row" style="gap:6px; font-size:12px; align-items:center;">
                <button
                  class="room-side-btn active"
                  style="background:${f?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("a",t)}
                >${m??"—"}</button>
                <ha-icon icon="mdi:door-open" style="--mdc-icon-size:14px; color:var(--secondary-text-color, #888);"></ha-icon>
                <button
                  class="room-side-btn"
                  style="background:${_?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("b",t)}
                >${y??"—"}</button>
              </div>
            </div>
          `:null})():null}

        ${o?(()=>{const t=e?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],i="swing"===this._editingOpeningType,o="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return H`
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

            ${i?H`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===o.length?H`
                    <button class="constraint-btn active">${o[0].label}</button>
                  `:o.map(t=>H`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===t.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=t.value}}
                    >${t.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${o?H`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const t=this.hass?.states[this._editingEntityId],e=t?.attributes.friendly_name||this._editingEntityId,i=t?.attributes.icon||"mdi:radiobox-marked";return H`
                <div class="wall-editor-row" style="gap:6px; align-items:center;">
                  <ha-icon icon=${i} style="--mdc-icon-size:18px; color:${"on"===t?.state?"var(--state-light-active-color, #ffd600)":"var(--secondary-text-color, #999)"};"></ha-icon>
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
            ${o?null:H`
              <button
                class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
                @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
                title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
              ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
            `}
          </div>
        </div>

        ${t.angle_group?(()=>{const e=Yt.value,i=t.angle_group,o=e?e.edges.filter(t=>t.angle_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${qi(i)};">
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

        ${o?null:H`
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
    `}async _applyDirection(t,e){if(!this.hass)return!1;const i=Yt.value,o=Xt.value;if(!i||!o)return!1;const n=i.edges.map(e=>e.id===t.id?{...e,direction:"free",length_locked:!1,angle_group:void 0}:e),s=bi(si(i.nodes,n),t.id,e);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await _e(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const t=this._nodeEditor.node,e=Yt.value,i=e?Le(t.id,e.edges).length:0;return H`
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
          ${2===i?H`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!Number.isNaN(o)&&!Number.isNaN(n))try{const s=mi(si(t.nodes,t.edges),i.id,o,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await _e(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error updating node position:",t),alert(`Failed to update node: ${t}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=!i.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:[{node_id:i.id,x:i.x,y:i.y,pinned:o}]}),await _e(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error toggling node pin:",t),alert(`Failed to toggle pin: ${t}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(t&&e)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:e.id,floor_id:t.id,node_id:this._nodeEditor.node.id}),await _e(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(t){console.error("Failed to dissolve node:",t),alert(`Failed to dissolve node: ${t}`)}}_refreshNodeEditor(t){const e=Yt.value;if(e){const i=e.nodes.find(e=>e.id===t);i&&(this._nodeEditor={node:i,editX:Math.round(i.x).toString(),editY:Math.round(i.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const t=["binary_sensor","cover"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(`${t}.`)));const i=Yt.value,o=this._edgeEditor?.edge.id;if(i){const t=new Set(i.edges.filter(t=>t.entity_id&&t.id!==o).map(t=>t.entity_id));e=e.filter(e=>!t.has(e.entity_id))}if(this._openingSensorSearch){const t=this._openingSensorSearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIconData(t,e){if(!t)return this._getIconData(e);const i=this.hass,o=i?.entities?.[t.entity_id]?.icon,n=t.attributes.icon;if(o||n)return this._getIconData(o??n??e);const s=this._getStateIconCacheKey(t),r=this._stateIconCache.get(s);return r||(this._queueStateIconLoad(t,s),this._getIconData(e))}_openEntityDetails(t){this.hass&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggleEntity(t){if(!this.hass)return;const e=t.split(".")[0];"button"===e||"input_button"===e?this.hass.callService("button","press",{entity_id:t}):"light"===e||"switch"===e||"input_boolean"===e?this.hass.callService("homeassistant","toggle",{entity_id:t}):this._openEntityDetails(t)}_hitTestDevice(t,e){for(const i of ne.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"light",id:i.id};for(const i of se.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"switch",id:i.id};for(const i of re.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"button",id:i.id};for(const i of ae.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"other",id:i.id};for(const i of ge.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:"",type:"mmwave",id:i.id};return null}_getStateIconCacheKey(t){const e=t.attributes.device_class;return`${t.entity_id}:${t.state}:${e??""}`}_queueStateIconLoad(t,e){if(this._stateIconLoaders.has(e))return;const i=this._loadStateIcon(t,e).catch(e=>{console.warn("Failed to load state icon",t.entity_id,e)}).finally(()=>{this._stateIconLoaders.delete(e)});this._stateIconLoaders.set(e,i)}async _ensureHaStateIconDefined(){if(customElements.get("ha-state-icon"))return;await this._ensureHaIconDefined();const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-state-icon.js","/frontend_es5/ha-state-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-state-icon module",i,t)}if(customElements.get("ha-state-icon"))break}customElements.get("ha-state-icon")&&await customElements.whenDefined("ha-state-icon")}async _loadStateIcon(t,e){if(!this.hass)return;if(await this._ensureHaStateIconDefined(),!customElements.get("ha-state-icon"))return;const i=document.createElement("ha-state-icon");i.hass=this.hass,i.stateObj=t,i.style.display="none";const o=this.isConnected?this:document.body;o?.appendChild(i);try{i.updateComplete&&await i.updateComplete;let t=null;for(let e=0;e<20;e++){const e=i.shadowRoot?.querySelector("ha-svg-icon");if(e?.path){t={path:e.path,secondaryPath:e.secondaryPath,viewBox:e.viewBox};break}const o=i.shadowRoot?.querySelector("ha-icon"),n=o?.shadowRoot?.querySelector("ha-svg-icon");if(n?.path){t={path:n.path,secondaryPath:n.secondaryPath,viewBox:n.viewBox};break}await new Promise(t=>setTimeout(t,50))}t&&(this._stateIconCache.set(e,t),this.requestUpdate())}finally{i.remove()}}_getIconData(t){const e=this._iconCache.get(t);if(e)return e;this._queueIconLoad(t)}_queueIconLoad(t){if(this._iconLoaders.has(t))return;const e=this._loadIcon(t).catch(e=>{console.warn("Failed to load icon",t,e)}).finally(()=>{this._iconLoaders.delete(t)});this._iconLoaders.set(t,e)}async _ensureHaIconDefined(){if(customElements.get("ha-icon"))return;const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-icon.js","/frontend_es5/ha-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-icon module",i,t)}if(customElements.get("ha-icon"))break}customElements.get("ha-icon")&&await customElements.whenDefined("ha-icon")}async _loadIcon(t){if(await this._ensureHaIconDefined(),!customElements.get("ha-icon"))return;const e=document.createElement("ha-icon");e.icon=t,e.style.display="none";const i=this.isConnected?this:document.body;i?.appendChild(e);try{e.updateComplete&&await e.updateComplete;let i=null;for(let t=0;t<10;t++){const t=e.shadowRoot?.querySelector("ha-svg-icon");if(t?.path){i={path:t.path,secondaryPath:t.secondaryPath,viewBox:t.viewBox};break}await new Promise(t=>setTimeout(t,50))}i&&(this._iconCache.set(t,i),this.requestUpdate())}finally{e.remove()}}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=Yt.value,i=Xt.value;if(!e||!i)return;const o=Gt.value,n="light"===o?"inhabit/lights/place":"button"===o?"inhabit/buttons/place":"other"===o?"inhabit/others/place":"inhabit/switches/place",s="light"===o?"inhabit/lights/remove":"button"===o?"inhabit/buttons/remove":"other"===o?"inhabit/others/remove":"inhabit/switches/remove",r="light"===o?"light_id":"button"===o?"button_id":"other"===o?"other_id":"switch_id",a=this.hass,l=i.id,d=e.id,c={...this._pendingDevice.position},h={id:""};try{const e=await a.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await _e(),Ut({type:`${o}_place`,description:`Place ${o}`,undo:async()=>{await a.callWS({type:s,[r]:h.id}),await _e()},redo:async()=>{const e=await a.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await _e()}})}catch(t){console.error(`Error placing ${o}:`,t),alert(`Failed to place ${o}: ${t}`)}this._pendingDevice=null}async _placeMmwave(t){if(!this.hass)return;const e=Yt.value,i=Xt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,r={...t},a={id:""};try{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=t.id,await _e(),Ut({type:"mmwave_place",description:"Place mmWave sensor",undo:async()=>{await o.callWS({type:"inhabit/mmwave/delete",placement_id:a.id}),await _e()},redo:async()=>{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=t.id,await _e()}})}catch(t){console.error("Error placing mmWave sensor:",t),alert(`Failed to place mmWave sensor: ${t}`)}}async _finishPlacementDrag(){if(!this.hass||!this._draggingPlacement)return;const t=this._draggingPlacement,e=this.hass;if(!Xt.value)return;let i;if(i="light"===t.type?ne.value.find(e=>e.id===t.id)?.position:"switch"===t.type?se.value.find(e=>e.id===t.id)?.position:"button"===t.type?re.value.find(e=>e.id===t.id)?.position:"other"===t.type?ae.value.find(e=>e.id===t.id)?.position:ge.value.find(e=>e.id===t.id)?.position,!i)return;const o={...i},n={...t.originalPosition};try{"light"===t.type?await e.callWS({type:"inhabit/lights/update",light_id:t.id,position:o}):"switch"===t.type?await e.callWS({type:"inhabit/switches/update",switch_id:t.id,position:o}):"button"===t.type?await e.callWS({type:"inhabit/buttons/update",button_id:t.id,position:o}):"other"===t.type?await e.callWS({type:"inhabit/others/update",other_id:t.id,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:t.id,position:o});const i=t.type,s=t.id;Ut({type:`${i}_move`,description:`Move ${i}`,undo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:n}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:n}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:n}):"other"===i?await e.callWS({type:"inhabit/others/update",other_id:s,position:n}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:n}),await _e()},redo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:o}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:o}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:o}):"other"===i?await e.callWS({type:"inhabit/others/update",other_id:s,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:o}),await _e()}})}catch(e){console.error(`Error moving ${t.type}:`,e),await _e()}}async _deleteSelectedPlacement(){if(!this.hass)return;const t=Jt.value;if(1!==t.ids.length)return;const e=this.hass;if(!Xt.value)return;const i=t.ids[0];try{if("light"===t.type)await e.callWS({type:"inhabit/lights/remove",light_id:i}),ne.value=ne.value.filter(t=>t.id!==i);else if("switch"===t.type)await e.callWS({type:"inhabit/switches/remove",switch_id:i}),se.value=se.value.filter(t=>t.id!==i);else if("button"===t.type)await e.callWS({type:"inhabit/buttons/remove",button_id:i}),re.value=re.value.filter(t=>t.id!==i);else{if("mmwave"!==t.type)return;await e.callWS({type:"inhabit/mmwave/delete",placement_id:i}),ge.value=ge.value.filter(t=>t.id!==i)}Jt.value={type:"none",ids:[]}}catch(t){console.error("Error deleting placement:",t)}}async _rotateMmwave(t){if(!this.hass)return;const e=Jt.value;if("mmwave"!==e.type||1!==e.ids.length)return;const i=e.ids[0],o=ge.value.find(t=>t.id===i);if(!o)return;const n=(o.angle+t+360)%360;try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:i,angle:n}),ge.value=ge.value.map(t=>t.id===i?{...t,angle:n}:t)}catch(t){console.error("Error rotating mmWave:",t)}}_startMmwaveRotation(t,e){t.stopPropagation(),t.preventDefault(),this._rotatingMmwave={id:e.id,originalAngle:e.angle,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId)}_handleMmwaveRotationMove(t){if(!this._rotatingMmwave)return;const e=ge.value.find(t=>t.id===this._rotatingMmwave.id);if(!e)return;const i=t.x-e.position.x,o=t.y-e.position.y;let n=180*Math.atan2(o,i)/Math.PI;n=(n%360+360)%360,n=15*Math.round(n/15),ge.value=ge.value.map(t=>t.id===this._rotatingMmwave.id?{...t,angle:n}:t)}async _finishMmwaveRotation(){if(!this._rotatingMmwave||!this.hass)return;const t=this._rotatingMmwave,e=ge.value.find(e=>e.id===t.id);if(!e)return void(this._rotatingMmwave=null);const i=e.angle;if(i!==t.originalAngle){try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:t.id,angle:i})}catch(e){console.error("Error committing mmWave rotation:",e),ge.value=ge.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e)}this._rotatingMmwave=null}else this._rotatingMmwave=null}_ensureMmwaveAnimLoop(){if(this._mmwaveAnimTimer)return;let t=performance.now();const e=i=>{const o=Math.min((i-t)/1e3,.05);t=i;let n=!1;for(const t of this._mmwaveTargetPositions.values()){if(t.arrived)continue;const e=t.targetX-t.displayX,i=t.targetY-t.displayY;Math.abs(e)<.1&&Math.abs(i)<.1?(t.displayX=t.targetX,t.displayY=t.targetY,t.arrived=!0):(t.displayX+=8*e*o,t.displayY+=8*i*o,n=!0)}const s=this._mmwaveFadingTargets.filter(t=>Date.now()-t.startTime<800);this._mmwaveFadingTargets=s,n||s.length>0?(this.requestUpdate(),this._mmwaveAnimTimer=requestAnimationFrame(e)):(this._mmwaveAnimTimer=null,this.requestUpdate())};this._mmwaveAnimTimer=requestAnimationFrame(e)}_cancelDevicePlacement(){this._pendingDevice=null,this._showEntityPickerModal=!1}_getPickerDomains(){const t=Gt.value;return"light"===t?["light"]:"switch"===t?["switch"]:"button"===t?["button"]:[]}_getPickerExcludeDomains(){return"other"===Gt.value?["light","switch","button"]:[]}_renderEntityPicker(){if(!this._showEntityPickerModal||!this._pendingDevice)return null;const t=Gt.value,e="light"===t?"Select Light":"switch"===t?"Select Switch":"button"===t?"Select Button":"Select Entity";return H`
      <fpb-entity-picker
        .hass=${this.hass}
        .domains=${this._getPickerDomains()}
        .excludeDomains=${this._getPickerExcludeDomains()}
        title=${e}
        @entities-confirmed=${t=>{this._placeDevice(t.detail.entityIds[0]),this._showEntityPickerModal=!1}}
        @picker-closed=${()=>this._cancelDevicePlacement()}
      ></fpb-entity-picker>
    `}render(){const t=this._canvasMode,e=pe.value,i=Ie(t,null!==e),o=i.showWallEditing||i.showOpeningEditing,n=[this._isPanning?"panning":"",this._spaceHeld?"space-pan":"","select"===Gt.value?"select-tool":"","viewing"===t?"view-mode":"",e?"calibration-mode":"",`mode-${t}`].filter(Boolean).join(" ");return H`
      <svg
        class="${n}"
        viewBox="${s=this._viewBox,`${s.x} ${s.y} ${s.width} ${s.height}`}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @pointercancel=${this._handlePointerCancel}
        @dblclick=${this._handleDblClick}
        @contextmenu=${this._handleContextMenu}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderFloor()}
        ${i.showWallEditing?this._renderEdgeAnnotations():null}
        ${i.showWallEditing?this._renderAngleConstraints():null}
        ${i.showWallEditing?this._renderNodeEndpoints():null}
        ${i.showZoneEditing&&"zone"===Gt.value?this._renderNodeGuideDots():null}
        ${Yt.value?this._renderDeviceLayer(Yt.value):null}
        ${i.showDrawingPreview?this._renderDrawingPreview():null}
        ${i.showZoneEditing?this._renderFurnitureDrawingPreview():null}
        ${i.showOpeningEditing?this._renderOpeningPreview():null}
        ${"placement"!==t||e?null:this._renderDevicePreview()}
        ${"occupancy"===t&&fe.value&&Yt.value?this._renderSimulationLayer(Yt.value):null}
      </svg>
      ${o?this._renderEdgeEditor():null}
      ${i.showWallEditing?this._renderNodeEditor():null}
      ${i.showWallEditing?this._renderMultiEdgeEditor():null}
      ${i.showWallEditing?this._renderRoomEditor():null}
      ${i.showZoneEditing?this._renderZoneEditor():null}
      ${"placement"!==t||e?null:this._renderEntityPicker()}
    `;var s}_getVisibleAnnotationEdgeIds(){const t=Jt.value;if("edge"!==t.type||0===t.ids.length)return null;const e=Yt.value;if(!e)return null;const i=new Set(t.ids),o=e.edges.filter(e=>t.ids.includes(e.id)),n=new Set,s=new Set,r=new Set;for(const t of o)t.link_group&&n.add(t.link_group),t.collinear_group&&s.add(t.collinear_group),t.angle_group&&r.add(t.angle_group);for(const t of e.edges)i.has(t.id)||(t.link_group&&n.has(t.link_group)&&i.add(t.id),t.collinear_group&&s.has(t.collinear_group)&&i.add(t.id),t.angle_group&&r.has(t.angle_group)&&i.add(t.id));return i}_renderEdgeAnnotations(){const t=Yt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Te(t);return q`
      <g class="wall-annotations-layer">
        ${i.map(t=>{if(!e.has(t.id))return null;const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,n=this._calculateWallLength(t.startPos,t.endPos),s=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),r=s>90||s<-90?s+180:s,a=[];t.length_locked&&a.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===t.direction&&a.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===t.direction&&a.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),p=-(t.thickness/2+6);return q`
            <g transform="translate(${i}, ${o}) rotate(${r})">
              ${t.link_group?q`
                <circle cx="${h}" cy="${p-1}" r="3.5"
                  fill="${qi(t.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${t.collinear_group?q`
                <g transform="translate(${h-(t.link_group?10:0)}, ${p-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${qi(t.collinear_group)}"
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
    `}_renderAngleConstraints(){const t=Yt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Ae(t.nodes),o=new Map;for(const e of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e));for(const[t,i]of o)i.some(t=>e.has(t.id))||o.delete(t);const n=[];for(const[,t]of o){if(2!==t.length)continue;const e=new Set([t[0].start_node,t[0].end_node]),o=new Set([t[1].start_node,t[1].end_node]);let s=null;for(const t of e)if(o.has(t)){s=t;break}if(!s)continue;const r=s,a=i.get(r);if(!a)continue;const l=[];for(const e of t){const t=e.start_node===r?e.end_node:e.start_node,o=i.get(t);o&&l.push(Math.atan2(o.y-a.y,o.x-a.x))}if(l.length<2)continue;l.sort((t,e)=>t-e);const d=l.length;for(let t=0;t<d;t++){const e=l[t],i=l[(t+1)%d],o=(i-e+2*Math.PI)%(2*Math.PI);if(Math.PI-o<.01)continue;const s=e+Math.PI,r=i+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):n.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return q`
      <g class="angle-constraints-layer">
        ${n.map(t=>{const e=t.angle1,i=t.angle2,o=i-e,n=180*o/Math.PI;if(n>85&&n<95){const n=.7*s,r=t.x+n*Math.cos(e),a=t.y+n*Math.sin(e),l=t.x+n*Math.cos(i),d=t.y+n*Math.sin(i),c=(e+i)/2,h=n/Math.cos(o/2),p=t.x+h*Math.cos(c),g=t.y+h*Math.sin(c);return q`
              <path d="M${r},${a} L${p},${g} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=t.x+s*Math.cos(e),a=t.y+s*Math.sin(e),l=t.x+s*Math.cos(i),d=t.y+s*Math.sin(i),c=o>Math.PI?1:0;return q`
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
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Jt.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
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
            ${(()=>{const i=t.map(t=>t.collinear_group).filter(Boolean);return i.length===t.length&&1===new Set(i).size?H`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error angle linking edges:",t)}}async _angleUnlinkEdges(){if(!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error angle unlinking edges:",t)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}}catch(t){console.error("Error linking edges:",t)}}async _unlinkEdges(){if(!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error unlinking edges:",t)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=parseFloat(this._editingTotalLength);if(Number.isNaN(i)||i<=0)return;const o=this._multiEdgeEditor.edges.map(t=>t.id),n=function(t,e,i){const o=new Set,n=[];for(const i of e){const e=t.edges.get(i);if(e){if(e.length_locked)return{updates:[],blocked:!0,blockedBy:[e.id]};n.push(e),o.add(e.start_node),o.add(e.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const e of o){const i=t.nodes.get(e);i&&s.push({x:i.x,y:i.y})}const{anchor:r,dir:a}=ke(s),l=new Map;for(const e of o){const i=t.nodes.get(e);if(!i)continue;const o=i.x-r.x,n=i.y-r.y,s=o*a.x+n*a.y;l.set(e,s)}let d=1/0,c=-1/0,h="";for(const[t,e]of l)e<d&&(d=e,h=t),e>c&&(c=e);const p=c-d;if(p<1e-9)return{updates:[],blocked:!1};const g=ai(t),u=new Set;for(const[t,e]of l){if(u.add(t),t===h)continue;const o=d+i/p*(e-d);g.set(t,{x:r.x+o*a.x,y:r.y+o*a.y})}const f=new Set(u);for(const[e,i]of t.nodes)i.pinned&&f.add(e);const _=hi(t,f,g);for(const e of u){const i=g.get(e),o=t.nodes.get(e);i&&(Math.abs(i.x-o.x)>Xe||Math.abs(i.y-o.y)>Xe)&&(_.updates.some(t=>t.nodeId===e)||_.updates.push({nodeId:e,x:i.x,y:i.y}))}return _.blocked=!1,delete _.blockedBy,_}(si(t.nodes,t.edges),o,i);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await _e();Yt.value&&this._updateEdgeEditorForSelection(o)}catch(t){console.error("Error applying total length:",t)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error collinear linking edges:",t)}}async _collinearUnlinkEdges(){if(!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await _e();const o=Yt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error collinear unlinking edges:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=Yt.value,e=Xt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges;try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id});await _e(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,Jt.value={type:"none",ids:[]}}_renderDevicePreview(){const t=Gt.value;if("light"!==t&&"switch"!==t&&"button"!==t&&"other"!==t&&"mmwave"!==t||this._pendingDevice)return null;const e="light"===t?"#ffd600":"switch"===t?"#4caf50":"button"===t?"#2196f3":"other"===t?"#9c27b0":"#2196f3";return q`
      <g class="device-preview">
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="${"mmwave"===t?8:12}"
          fill="${e}"
          fill-opacity="0.3"
          stroke="${e}"
          stroke-width="2"
          stroke-dasharray="4,2"
        />
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="3"
          fill="${e}"
        />
      </g>
    `}}t([gt({attribute:!1})],Vi.prototype,"hass",void 0),t([ft("svg")],Vi.prototype,"_svg",void 0),t([ut()],Vi.prototype,"_viewBox",void 0),t([ut()],Vi.prototype,"_isPanning",void 0),t([ut()],Vi.prototype,"_spaceHeld",void 0),t([ut()],Vi.prototype,"_panStart",void 0),t([ut()],Vi.prototype,"_cursorPos",void 0),t([ut()],Vi.prototype,"_wallStartPoint",void 0),t([ut()],Vi.prototype,"_roomEditor",void 0),t([ut()],Vi.prototype,"_haAreas",void 0),t([ut()],Vi.prototype,"_hoveredNode",void 0),t([ut()],Vi.prototype,"_draggingNode",void 0),t([ut()],Vi.prototype,"_nodeEditor",void 0),t([ut()],Vi.prototype,"_edgeEditor",void 0),t([ut()],Vi.prototype,"_multiEdgeEditor",void 0),t([ut()],Vi.prototype,"_editingTotalLength",void 0),t([ut()],Vi.prototype,"_editingLength",void 0),t([ut()],Vi.prototype,"_editingLengthLocked",void 0),t([ut()],Vi.prototype,"_editingDirection",void 0),t([ut()],Vi.prototype,"_editingOpeningParts",void 0),t([ut()],Vi.prototype,"_editingOpeningType",void 0),t([ut()],Vi.prototype,"_editingSwingDirection",void 0),t([ut()],Vi.prototype,"_editingEntityId",void 0),t([ut()],Vi.prototype,"_openingSensorSearch",void 0),t([ut()],Vi.prototype,"_openingSensorPickerOpen",void 0),t([ut()],Vi.prototype,"_blinkingEdgeIds",void 0),t([ut()],Vi.prototype,"_focusedRoomId",void 0),t([ut()],Vi.prototype,"_pendingDevice",void 0),t([ut()],Vi.prototype,"_showEntityPickerModal",void 0),t([ut()],Vi.prototype,"_openingPreview",void 0),t([ut(),ut()],Vi.prototype,"_zonePolyPoints",void 0),t([ut()],Vi.prototype,"_pendingZonePolygon",void 0),t([ut()],Vi.prototype,"_zoneEditor",void 0),t([ut()],Vi.prototype,"_draggingZoneVertex",void 0),t([ut()],Vi.prototype,"_draggingPlacement",void 0),t([ut()],Vi.prototype,"_rotatingMmwave",void 0),t([ut()],Vi.prototype,"_mmwaveFadingTargets",void 0),t([ut()],Vi.prototype,"_draggingSimTarget",void 0),t([ut()],Vi.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",Vi);const Zi={select:{id:"select",icon:"mdi:cursor-default-outline",label:"Select"},wall:{id:"wall",icon:"mdi:wall",label:"Wall"},door:{id:"door",icon:"mdi:door",label:"Door"},window:{id:"window",icon:"mdi:window-closed-variant",label:"Window"},zone:{id:"zone",icon:"mdi:vector-polygon",label:"Zone"},light:{id:"light",icon:"mdi:lightbulb",label:"Light"},switch:{id:"switch",icon:"mdi:toggle-switch",label:"Switch"},button:{id:"button",icon:"mdi:gesture-tap-button",label:"Button"},mmwave:{id:"mmwave",icon:"mdi:access-point",label:"mmWave"},other:{id:"other",icon:"mdi:devices",label:"Other"}};class Xi extends dt{constructor(){super(...arguments),this.floorPlans=[],this._floorMenuOpen=!1,this._actionsMenuOpen=!1,this._modeMenuOpen=!1,this._toolbarWidth=0,this._toolbarCenterX=0,this._canvasMode="walls",this._renamingFloorId=null,this._renameValue="",this._cleanupEffects=[],this._renameCommitted=!1,this._documentListenerAttached=!1,this._boundWindowResize=()=>this._updateToolbarMetrics(),this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
    :host {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 12px;
      height: var(--header-height, 56px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-sizing: border-box;
      overflow: visible;
      gap: 10px;
    }

    .toolbar-left {
      justify-self: start;
      min-width: 0;
    }

    .toolbar-right {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
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
      background: rgba(0, 0, 0, 0.06);
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
      white-space: nowrap;
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

    .floor-option .rename-btn,
    .floor-option .delete-btn {
      display: flex;
      visibility: hidden;
      opacity: 0;
      padding: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
      transition: color 0.12s, background 0.12s, opacity 0.12s, visibility 0.12s;
    }

    .floor-option .rename-btn {
      margin-left: auto;
    }

    .floor-option .rename-btn ha-icon,
    .floor-option .delete-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .rename-btn,
    .floor-option:hover .delete-btn {
      visibility: visible;
      opacity: 1;
    }

    .floor-option .delete-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.08);
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
      background: var(--divider-color, rgba(0, 0, 0, 0.12));
      margin: 0 4px;
    }

    .tool-group {
      display: flex;
      gap: 2px;
    }

    .context-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      position: relative;
    }

    .map-actions {
      position: fixed;
      left: var(--map-actions-x, 50vw);
      bottom: max(18px, env(safe-area-inset-bottom));
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      max-width: min(calc(100vw - 32px), 640px);
      padding: 6px;
      border-radius: 16px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
      z-index: 240;
    }

    .map-actions .context-actions {
      justify-content: center;
      gap: 6px;
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
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .tool-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .tool-button.active {
      background: var(--mode-accent, var(--primary-color));
      color: #fff;
    }

    .tool-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .tool-button:disabled:hover {
      background: transparent;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .overflow-wrapper {
      position: relative;
    }

    .overflow-menu {
      position: absolute;
      right: 0;
      bottom: calc(100% + 8px);
      min-width: 180px;
      padding: 6px;
      border-radius: 14px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      z-index: 260;
    }

    .overflow-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
    }

    .overflow-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .overflow-item.active {
      background: color-mix(
        in srgb,
        var(--mode-accent, var(--primary-color)) 16%,
        transparent
      );
      color: var(--mode-accent, var(--primary-color));
    }

    .overflow-item:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .overflow-item ha-icon {
      --mdc-icon-size: 19px;
      flex: 0 0 auto;
    }

    .overflow-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* --- Done button --- */
    .done-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 8px;
      background: var(--primary-color);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
      margin-left: 4px;
    }

    .done-button:hover {
      opacity: 0.85;
    }

    .done-button ha-icon {
      --mdc-icon-size: 18px;
    }

    /* --- Mode switcher --- */
    .mode-group {
      display: flex;
      gap: 4px;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      padding: 3px;
    }

    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 78px;
      height: 36px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .mode-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .mode-button.active {
      background: var(--mode-accent, var(--primary-color));
      color: #fff;
    }

    .mode-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .mode-label {
      line-height: 1;
    }

    .mode-selector {
      position: relative;
      display: none;
      justify-self: center;
      min-width: 0;
    }

    .mode-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 168px;
      height: 38px;
      padding: 0 12px;
      border: none;
      border-radius: 12px;
      background: var(--mode-accent, var(--primary-color));
      color: #fff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .mode-trigger ha-icon {
      --mdc-icon-size: 19px;
      flex: 0 0 auto;
    }

    .mode-trigger .chevron {
      margin-left: auto;
      --mdc-icon-size: 18px;
      transition: transform 0.18s ease;
    }

    .mode-trigger.open .chevron {
      transform: rotate(180deg);
    }

    .mode-trigger-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mode-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      min-width: 220px;
      padding: 6px;
      border-radius: 14px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      z-index: 270;
    }

    .mode-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    .mode-option:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .mode-option.active {
      background: color-mix(
        in srgb,
        var(--mode-accent, var(--primary-color)) 16%,
        transparent
      );
      color: var(--mode-accent, var(--primary-color));
    }

    .mode-option ha-icon {
      --mdc-icon-size: 19px;
      flex: 0 0 auto;
    }

    @media (max-width: 1280px) {
      .mode-group {
        display: none;
      }

      .mode-selector {
        display: block;
      }
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        position: fixed;
        left: 10px;
        right: 10px;
        bottom: max(10px, env(safe-area-inset-bottom));
        top: auto;
        z-index: 250;
        height: auto;
        min-height: 64px;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        padding: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      }

      .toolbar-left {
        display: none;
      }

      .mode-selector {
        width: 100%;
        min-width: 0;
      }

      .mode-trigger {
        width: 100%;
        min-width: 0;
        height: 48px;
        border-radius: 14px;
      }

      .mode-dropdown {
        top: auto;
        bottom: calc(100% + 8px);
        left: 0;
        right: 0;
        min-width: 0;
        transform: none;
      }

      .mode-option {
        min-height: 44px;
      }

      .toolbar-right {
        width: 100%;
        justify-self: stretch;
        justify-content: flex-end;
        gap: 6px;
        overflow: visible;
        scrollbar-width: none;
      }

      .toolbar-right::-webkit-scrollbar {
        display: none;
      }

      .tool-group {
        gap: 6px;
        flex: 0 0 auto;
      }

      .context-actions {
        gap: 6px;
        min-width: 0;
      }

      .map-actions {
        bottom: calc(88px + env(safe-area-inset-bottom));
        max-width: calc(100vw - 20px);
        border-radius: 18px;
        padding: 7px;
      }

      .tool-button {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        background: var(--primary-background-color, #fafafa);
      }

      .divider {
        display: none;
      }

      .done-button {
        min-height: 44px;
        border-radius: 13px;
        margin-left: auto;
        position: sticky;
        right: 0;
        flex: 0 0 auto;
        box-shadow: -8px 0 12px var(--card-background-color, #fff);
      }
    }

    @media (max-width: 390px) {
      :host {
        left: 8px;
        right: 8px;
        padding: 7px;
        border-radius: 16px;
        gap: 7px;
      }

      .mode-button {
        min-width: 44px;
        height: 44px;
        padding: 4px;
      }

      .mode-trigger {
        height: 44px;
        padding: 0 10px;
      }

      .toolbar-right {
        gap: 5px;
      }

      .tool-group,
      .context-actions {
        gap: 5px;
      }

      .tool-button {
        width: 42px;
        height: 42px;
        border-radius: 12px;
      }

      .done-button {
        width: 42px;
        min-width: 42px;
        padding: 0;
        justify-content: center;
      }

      .done-button span {
        display: none;
      }
    }

    @media (max-width: 300px) {
      :host {
        left: 6px;
        right: 6px;
      }

      .mode-button {
        min-width: 40px;
      }

      .tool-button,
      .done-button {
        width: 40px;
        min-width: 40px;
      }
    }

  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){Gt.value=t}_handleUndo(){jt()}_handleRedo(){Ht()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,i){t.stopPropagation(),confirm(`Delete "${i}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_startRename(t,e,i){t.stopPropagation(),this._renamingFloorId=e,this._renameValue=i,this._renameCommitted=!1,this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".rename-input");t&&(t.focus(),t.select())})}_commitRename(){if(this._renameCommitted)return;this._renameCommitted=!0;const t=this._renamingFloorId,e=this._renameValue.trim();this._renamingFloorId=null,t&&e&&this.dispatchEvent(new CustomEvent("rename-floor",{detail:{id:t,name:e},bubbles:!0,composed:!0}))}_cancelRename(){this._renamingFloorId=null}_handleRenameKeyDown(t){"Enter"===t.key?this._commitRename():"Escape"===t.key&&this._cancelRename()}_exitEditor(){this.dispatchEvent(new CustomEvent("exit-editor",{bubbles:!0,composed:!0}))}_openImportExport(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("open-import-export",{bubbles:!0,composed:!0}))}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._floorMenuOpen&&(this._actionsMenuOpen=!1,this._modeMenuOpen=!1)}_toggleActionsMenu(t){t?.stopPropagation(),this._actionsMenuOpen=!this._actionsMenuOpen,this._actionsMenuOpen&&(this._floorMenuOpen=!1,this._modeMenuOpen=!1)}_toggleModeMenu(t){t?.stopPropagation(),this._modeMenuOpen=!this._modeMenuOpen,this._modeMenuOpen&&(this._floorMenuOpen=!1,this._actionsMenuOpen=!1)}_selectMode(t){!function(t){Kt.value=t,Gt.value="select",Jt.value={type:"none",ids:[]},"occupancy"!==t&&(ce.value=null,ue.value=[],fe.value=!1),"placement"!==t&&"occupancy"!==t&&(he.value=null,pe.value=null)}(t),this._modeMenuOpen=!1}_closeMenus(){this._floorMenuOpen=!1,this._actionsMenuOpen=!1,this._modeMenuOpen=!1}_runAction(t){t.disabled||(t.run(),this._actionsMenuOpen=!1)}_directActionLimit(t){return function(t,e){return 0===t||t>=900||t>=620?e:t>=520?Math.min(e,5):t>=440?Math.min(e,4):t>=360?Math.min(e,3):t>=300?Math.min(e,2):Math.min(e,1)}(this._toolbarWidth,t)}_splitActions(t){const e=this._directActionLimit(t.length);return e>=t.length?{direct:t,overflow:[]}:{direct:t.slice(0,e),overflow:t.slice(e)}}_toolAction(t,e){return{id:`tool-${t.id}`,icon:t.icon,label:t.label,active:Gt.value===t.id,accent:e.accent,run:()=>this._handleToolSelect(t.id)}}_toolbarActions(t,e,i){const o=[{id:"undo",icon:"mdi:undo",label:"Undo",disabled:!Rt.value,run:()=>this._handleUndo()},{id:"redo",icon:"mdi:redo",label:"Redo",disabled:!Bt.value,run:()=>this._handleRedo()}];"occupancy"===e&&o.push({id:"simulate",icon:"mdi:target-account",label:fe.value?"Stop simulating":"Simulate positions",active:fe.value,accent:i.accent,run:()=>{const t=!fe.value;fe.value=t,t||(ue.value=[])}});const n=t.find(t=>t.id===Gt.value);n&&o.push(this._toolAction(n,i));for(const e of t)e.id!==n?.id&&o.push(this._toolAction(e,i));return o}_renderActionButton(t){return H`
      <button
        class="tool-button ${t.active?"active":""}"
        style=${t.accent?`--mode-accent: ${t.accent}`:""}
        @click=${()=>this._runAction(t)}
        ?disabled=${t.disabled}
        title=${t.label}
      >
        <ha-icon icon=${t.icon}></ha-icon>
      </button>
    `}_renderOverflowItem(t){return H`
      <button
        class="overflow-item ${t.active?"active":""}"
        style=${t.accent?`--mode-accent: ${t.accent}`:""}
        @click=${()=>this._runAction(t)}
        ?disabled=${t.disabled}
      >
        <ha-icon icon=${t.icon}></ha-icon>
        <span class="overflow-label">${t.label}</span>
      </button>
    `}connectedCallback(){super.connectedCallback(),this._documentListenerAttached||(document.addEventListener("click",this._handleDocumentClick),this._documentListenerAttached=!0),this._cleanupEffects.push(Nt(()=>{this._canvasMode=Kt.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),window.removeEventListener("resize",this._boundWindowResize),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._documentListenerAttached=!1;for(const t of this._cleanupEffects)t();this._cleanupEffects=[]}firstUpdated(){this._resizeObserver=new ResizeObserver(([t])=>{const e=Math.round(t.contentRect.width);e!==this._toolbarWidth&&(this._toolbarWidth=e),this._updateToolbarMetrics()}),this._resizeObserver.observe(this),window.addEventListener("resize",this._boundWindowResize),this._updateToolbarMetrics()}_updateToolbarMetrics(){const t=this.getBoundingClientRect(),e=Math.round(t.width),i=Math.round(t.left+t.width/2);e!==this._toolbarWidth&&(this._toolbarWidth=e),i!==this._toolbarCenterX&&(this._toolbarCenterX=i)}render(){const t=Xt.value,e=Yt.value,i=this._canvasMode,o=t?.floors||[],n=Me(i),s=[Pe.walls,Pe.furniture,Pe.openings,Pe.placement,Pe.occupancy],r=function(t){return Me(t).tools}(i).map(t=>Zi[t]),a=this._toolbarActions(r,i,n),{direct:l,overflow:d}=this._splitActions(a);return H`
      <!-- Left: Floor Selector -->
      <div class="toolbar-left">
        ${o.length>0?H`
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
                ${o.map(t=>this._renamingFloorId===t.id?H`
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
      </div>

      <!-- Center: Mode Switcher -->
      <div class="mode-group">
        ${s.map(t=>H`
            <button
              class="mode-button ${i===t.mode?"active":""}"
              style="--mode-accent: ${t.accent}"
              @click=${()=>this._selectMode(t.mode)}
              title="${t.label} mode"
            >
              <ha-icon icon=${t.icon}></ha-icon>
              <span class="mode-label">${t.label}</span>
            </button>
          `)}
      </div>
      <div class="mode-selector">
        <button
          class="mode-trigger ${this._modeMenuOpen?"open":""}"
          style="--mode-accent: ${n.accent}"
          @click=${this._toggleModeMenu}
          title="Switch mode"
        >
          <ha-icon icon=${n.icon}></ha-icon>
          <span class="mode-trigger-label">${n.label}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </button>
        ${this._modeMenuOpen?H`
              <div class="mode-dropdown">
                ${s.map(t=>H`
                    <button
                      class="mode-option ${i===t.mode?"active":""}"
                      style="--mode-accent: ${t.accent}"
                      @click=${()=>this._selectMode(t.mode)}
                    >
                      <ha-icon icon=${t.icon}></ha-icon>
                      <span class="overflow-label">${t.label}</span>
                    </button>
                  `)}
              </div>
            `:null}
      </div>

      <!-- Right: Done -->
      <div class="toolbar-right">
        <button
          class="done-button"
          @click=${this._exitEditor}
          title="Exit editor"
        >
          <ha-icon icon="mdi:check"></ha-icon>
          Done
        </button>
      </div>

      <!-- Map overlay: Undo/Redo + contextual tools -->
      <div
        class="map-actions"
        style="--map-actions-x: ${this._toolbarCenterX?`${this._toolbarCenterX}px`:"50vw"};"
      >
        <div class="context-actions">
          ${l.map(t=>this._renderActionButton(t))}
          ${d.length>0?H`
                <div class="overflow-wrapper">
                  <button
                    class="tool-button ${this._actionsMenuOpen?"active":""}"
                    style="--mode-accent: ${n.accent}"
                    @click=${this._toggleActionsMenu}
                    title="More tools"
                  >
                    <ha-icon icon="mdi:dots-horizontal"></ha-icon>
                  </button>
                  ${this._actionsMenuOpen?H`
                        <div class="overflow-menu">
                          ${d.map(t=>this._renderOverflowItem(t))}
                        </div>
                      `:null}
                </div>
              `:null}
        </div>
      </div>
    `}}t([gt({attribute:!1})],Xi.prototype,"hass",void 0),t([gt({attribute:!1})],Xi.prototype,"floorPlans",void 0),t([ut()],Xi.prototype,"_floorMenuOpen",void 0),t([ut()],Xi.prototype,"_actionsMenuOpen",void 0),t([ut()],Xi.prototype,"_modeMenuOpen",void 0),t([ut()],Xi.prototype,"_toolbarWidth",void 0),t([ut()],Xi.prototype,"_toolbarCenterX",void 0),t([ut()],Xi.prototype,"_canvasMode",void 0),t([ut()],Xi.prototype,"_renamingFloorId",void 0),t([ut()],Xi.prototype,"_renameValue",void 0),customElements.get("fpb-toolbar")||customElements.define("fpb-toolbar",Xi);class Yi extends dt{constructor(){super(...arguments),this.open=!1,this._mode="export",this._exportSelection=new Set,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1,this._error=null}static{this.styles=r`
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
  `}show(t){this._mode=t||"export",this._error=null,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1;const e=Xt.value;e&&(this._exportSelection=new Set(e.floors.map(t=>t.id))),this.open=!0}close(){this.open=!1}_setMode(t){this._mode=t,this._error=null}_toggleExportFloor(t){const e=new Set(this._exportSelection);e.has(t)?e.delete(t):e.add(t),this._exportSelection=e}_toggleExportAll(){const t=Xt.value;t&&(this._exportSelection.size===t.floors.length?this._exportSelection=new Set:this._exportSelection=new Set(t.floors.map(t=>t.id)))}async _doExport(){if(!this.hass)return;const t=Xt.value;if(t&&0!==this._exportSelection.size){this._exporting=!0,this._error=null;try{const e=[];for(const i of this._exportSelection){const o=await this.hass.callWS({type:"inhabit/floors/export",floor_plan_id:t.id,floor_id:i});e.push(o)}const i=1===e.length?e[0]:{inhabit_version:"1.0",export_type:"floors",exported_at:(new Date).toISOString(),floors:e},o=JSON.stringify(i,null,2),n=new Blob([o],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s;const a=t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),l=1===e.length?(e[0].floor?.name||"floor").toLowerCase().replace(/[^a-z0-9]+/g,"-"):"floors";r.download=`inhabit-${a}-${l}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s),this.close()}catch(t){console.error("Export error:",t),this._error=`Export failed: ${t instanceof Error?t.message:String(t)}`}finally{this._exporting=!1}}}_pickFile(){const t=document.createElement("input");t.type="file",t.accept=".json",t.style.display="none",document.body.appendChild(t),t.addEventListener("change",async()=>{const e=t.files?.[0];if(document.body.removeChild(t),e)try{const t=await e.text(),i=JSON.parse(t);this._parseImportFile(i)}catch{this._error="Could not read file. Make sure it's a valid Inhabit JSON export."}}),t.click()}_parseImportFile(t){if(this._error=null,!t||"object"!=typeof t)return void(this._error="Invalid file format.");const e=t;if("floors"===e.export_type&&Array.isArray(e.floors)){const t=e.floors;return this._importData=t,void(this._importEntries=t.map((t,e)=>this._buildImportEntry(t,e)))}if("floor"===e.export_type)return this._importData=[e],void(this._importEntries=[this._buildImportEntry(e,0)]);this._error="Invalid file: not an Inhabit floor export."}_buildImportEntry(t,e){const i=t.floor,o=[t.lights,t.switches,t.buttons,t.others,t.mmwave_placements].reduce((t,e)=>t+(Array.isArray(e)?e.length:0),0);return{index:e,name:i?.name||`Floor ${e+1}`,level:i?.level??e,roomCount:Array.isArray(i?.rooms)?i.rooms.length:0,wallCount:Array.isArray(i?.edges)?i.edges.length:Array.isArray(i?.walls)?i.walls.length:0,placementCount:o,sensorConfigCount:Array.isArray(t.sensor_configs)?t.sensor_configs.length:0,selected:!0}}_toggleImportFloor(t){this._importEntries=this._importEntries.map(e=>e.index===t?{...e,selected:!e.selected}:e)}_toggleImportAll(){const t=this._importEntries.every(t=>t.selected);this._importEntries=this._importEntries.map(e=>({...e,selected:!t}))}async _doImport(){if(!this.hass)return;const t=Xt.value;if(!t)return;const e=this._importEntries.filter(t=>t.selected);if(0!==e.length){this._importing=!0,this._error=null;try{let i=null;const o=[];for(const n of e){const e=this._importData[n.index],s=await this.hass.callWS({type:"inhabit/floors/import",floor_plan_id:t.id,data:e});o.push(s),i=s}const n={...t,floors:[...t.floors,...o]};this.dispatchEvent(new CustomEvent("floors-imported",{detail:{floorPlan:n,switchTo:i},bubbles:!0,composed:!0})),this.close()}catch(t){console.error("Import error:",t),this._error=`Import failed: ${t instanceof Error?t.message:String(t)}`}finally{this._importing=!1}}}_onOverlayClick(t){t.target.classList.contains("overlay")&&this.close()}render(){if(!this.open)return Z;const t=Xt.value,e=t?.floors||[];return H`
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

          ${this._error?H`<div class="error-msg" style="margin: 0 16px 8px;">${this._error}</div>`:Z}

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
                  ${t.wallCount} wall${1!==t.wallCount?"s":""}${t.placementCount>0?`, ${t.placementCount} placement${1!==t.placementCount?"s":""}`:""}${t.sensorConfigCount>0?`, ${t.sensorConfigCount} sensor config${1!==t.sensorConfigCount?"s":""}`:""}
                </div>
              </div>
            </label>
          `)}
      </div>
    `}}t([gt({attribute:!1})],Yi.prototype,"hass",void 0),t([gt({type:Boolean,reflect:!0})],Yi.prototype,"open",void 0),t([ut()],Yi.prototype,"_mode",void 0),t([ut()],Yi.prototype,"_exportSelection",void 0),t([ut()],Yi.prototype,"_importEntries",void 0),t([ut()],Yi.prototype,"_importData",void 0),t([ut()],Yi.prototype,"_importing",void 0),t([ut()],Yi.prototype,"_exporting",void 0),t([ut()],Yi.prototype,"_error",void 0),customElements.get("fpb-import-export-dialog")||customElements.define("fpb-import-export-dialog",Yi);class Ki extends dt{constructor(){super(...arguments),this.targetId="",this.targetName="",this.targetType="room",this._config=null,this._occupancyState=null,this._loading=!0,this._activePicker=null}static{this.styles=r`
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
      border-radius: 16px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
      gap: 8px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .close-btn {
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

    .close-btn:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .panel-body {
      padding: 16px 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }

    .toggle-row label {
      font-size: 14px;
    }

    .toggle-row .sublabel {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .slider-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .slider-row label span {
      color: var(--secondary-text-color);
    }

    .slider-row input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
    }

    .sensor-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sensor-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 8px;
      font-size: 13px;
    }

    .sensor-item .entity-id {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sensor-item .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 16px;
      transition: color 0.15s;
    }

    .sensor-item .remove-btn:hover {
      color: var(--error-color, #f44336);
    }

    .add-btn {
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
      align-self: flex-start;
    }

    .add-btn:hover {
      opacity: 0.9;
    }

    .action-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      box-sizing: border-box;
    }

    .status-section {
      padding: 12px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .state-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
    }

    .state-badge.vacant {
      background: rgba(76, 175, 80, 0.15);
      color: #2e7d32;
    }

    .state-badge.occupied {
      background: rgba(244, 67, 54, 0.15);
      color: #c62828;
    }

    .state-badge.checking {
      background: rgba(255, 152, 0, 0.15);
      color: #e65100;
    }

    .confidence-bar {
      height: 6px;
      background: var(--divider-color, #e0e0e0);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s;
      background: var(--primary-color);
    }

    .contributing-sensors {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    ha-switch {
      --mdc-theme-secondary: var(--primary-color);
    }
  `}connectedCallback(){super.connectedCallback(),this._loadConfig().then(()=>this._startPolling())}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}updated(t){t.has("targetId")&&this.targetId&&(this._stopPolling(),this._loadConfig().then(()=>this._startPolling()))}_startPolling(){this._pollTimer&&clearInterval(this._pollTimer),this._pollTimer=window.setInterval(()=>this._loadOccupancyState(),2e3)}_stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}async _loadConfig(){if(this.hass&&this.targetId){this._loading=!0;try{const t=await this.hass.callWS({type:"inhabit/sensor_config/get",room_id:this.targetId});this._config=t}catch(t){console.error("Failed to load config:",t),this._config=null}await this._loadOccupancyState(),this._loading=!1}}async _loadOccupancyState(){if(this.hass)try{const t=await this.hass.callWS({type:"inhabit/occupancy_states"});this._occupancyState=t[this.targetId]??null}catch(t){console.error("Failed to load config:",t)}}async _updateConfig(t){if(this.hass&&this._config)try{const e=await this.hass.callWS({type:"inhabit/sensor_config/update",room_id:this.targetId,...t});this._config=e}catch(t){console.error("Failed to update sensor config:",t)}}async _addSensors(t,e){if(!this._config||0===e.length)return;const i=`${t}_sensors`,o=this._config[i],n=new Set(o.map(t=>t.entity_id)),s=e.filter(t=>t&&!n.has(t)).map(e=>({entity_id:e,sensor_type:t,weight:1,inverted:!1}));0!==s.length&&await this._updateConfig({[i]:[...o,...s]})}async _removeSensor(t,e){if(!this._config)return;const i=`${t}_sensors`,o=this._config[i].filter(t=>t.entity_id!==e);await this._updateConfig({[i]:o})}_getEntityName(t){return this.hass?.states[t]?String(this.hass.states[t].attributes?.friendly_name??t):t}_getAllBoundEntityIds(){if(!this._config)return[];const t=[];for(const e of this._config.motion_sensors??[])t.push(e.entity_id);for(const e of this._config.occupancy_sensors??[])t.push(e.entity_id);for(const e of this._config.door_sensors??[])t.push(e.entity_id);return this._config.override_trigger_entity&&t.push(this._config.override_trigger_entity),t}_renderSensorSection(t,e,i){const o="motion"===e?"mdi:motion-sensor":"mdi:door";return H`
      <div class="section">
        <div class="section-title">${t}</div>
        <div class="sensor-list">
          ${i.map(t=>H`
            <div class="sensor-item">
              <ha-icon icon=${o} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${this._getEntityName(t.entity_id)}</span>
              <button class="remove-btn" @click=${()=>this._removeSensor(e,t.entity_id)}><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
            </div>
          `)}
        </div>
        <button class="add-btn" @click=${()=>{this._activePicker=e}}>
          Add ${e} sensor
        </button>
        ${this._activePicker===e?H`
          <fpb-entity-picker
            .hass=${this.hass}
            .domains=${["binary_sensor"]}
            .exclude=${this._getAllBoundEntityIds()}
            .multi=${!0}
            title="Add ${t}"
            placeholder="Search ${e} sensors..."
            @entities-confirmed=${t=>{this._addSensors(e,t.detail.entityIds),this._activePicker=null}}
            @picker-closed=${()=>{this._activePicker=null}}
          ></fpb-entity-picker>
        `:Z}
      </div>
    `}_renderStatus(){const t=this._occupancyState;if(!t)return Z;const e=t.state,i=t.state.charAt(0).toUpperCase()+t.state.slice(1),o=Math.round(100*t.confidence);return H`
      <div class="section">
        <div class="section-title">Live Status</div>
        <div class="status-section">
          <div>
            <span class="state-badge ${e}">${i}</span>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--secondary-text-color);">Confidence: ${o}%</label>
            <div class="confidence-bar">
              <div class="confidence-bar-fill" style="width: ${o}%;"></div>
            </div>
          </div>
          ${t.contributing_sensors.length>0?H`
            <div class="contributing-sensors">
              Contributing: ${t.contributing_sensors.join(", ")}
            </div>
          `:Z}
        </div>
      </div>
    `}render(){const t=(this._config?.door_sensors??[]).length>0;return H`
      <div class="panel-header">
        <h3>${this.targetName} Occupancy</h3>
        <button class="close-btn" @click=${()=>this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading?H`<ha-circular-progress active></ha-circular-progress>`:this._config?H`
          <!-- Enable toggle -->
          <div class="toggle-row">
            <div>
              <label>Occupancy Sensor</label>
              <div class="sublabel">Creates a binary_sensor entity</div>
            </div>
            <ha-switch
              .checked=${this._config.enabled}
              @change=${t=>this._updateConfig({enabled:t.target.checked})}
            ></ha-switch>
          </div>

          ${this._config.enabled?H`
            <!-- Spatial presence toggle -->
            <div class="toggle-row">
              <div>
                <label>Presence sensors affect this ${this.targetType}</label>
                <div class="sublabel">Spatial targets inside drive occupancy</div>
              </div>
              <ha-switch
                .checked=${this._config.presence_affects}
                @change=${t=>this._updateConfig({presence_affects:t.target.checked})}
              ></ha-switch>
            </div>

            ${this._renderStatus()}

            <!-- Timing -->
            <div class="section">
              <div class="section-title">Timing</div>

              <div class="slider-row">
                <label>Motion Timeout <span>${this._config.motion_timeout}s</span></label>
                <input type="range" min="10" max="600" step="10"
                  .value=${String(this._config.motion_timeout)}
                  @change=${t=>this._updateConfig({motion_timeout:Number(t.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Checking Timeout <span>${this._config.checking_timeout}s</span></label>
                <input type="range" min="5" max="120" step="5"
                  .value=${String(this._config.checking_timeout)}
                  @change=${t=>this._updateConfig({checking_timeout:Number(t.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Presence Timeout <span>${this._config.presence_timeout}s</span></label>
                <input type="range" min="30" max="900" step="30"
                  .value=${String(this._config.presence_timeout)}
                  @change=${t=>this._updateConfig({presence_timeout:Number(t.target.value)})}
                />
              </div>
            </div>

            <!-- Sensor Bindings -->
            ${this._renderSensorSection("Motion Sensors","motion",this._config.motion_sensors)}
            ${this._renderSensorSection("Door Sensors","door",this._config.door_sensors)}

            <!-- Door Logic -->
            ${t?H`<div class="section">
              <div class="section-title">Door Logic</div>

              <div class="toggle-row">
                <div>
                  <label>Door blocks vacancy</label>
                  <div class="sublabel">Closed door prevents VACANT</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_blocks_vacancy}
                  @change=${t=>this._updateConfig({door_blocks_vacancy:t.target.checked})}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div>
                  <label>Door open resets checking</label>
                  <div class="sublabel">Opening door restarts CHECKING timer</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_open_resets_checking}
                  @change=${t=>this._updateConfig({door_open_resets_checking:t.target.checked})}
                ></ha-switch>
              </div>
            </div>`:Z}

            <!-- Override Trigger -->
            <div class="section">
              <div class="section-title">Override Trigger</div>
              ${this._config.override_trigger_entity?H`
                <div class="sensor-item">
                  <ha-icon icon="mdi:gesture-tap-button" style="--mdc-icon-size: 18px;"></ha-icon>
                  <span class="entity-id">
                    ${this._getEntityName(this._config.override_trigger_entity)}
                    ${this._config.override_trigger_action?H` <span style="color: var(--secondary-text-color)">(${this._config.override_trigger_action})</span>`:Z}
                  </span>
                  <button class="remove-btn" @click=${()=>{this._updateConfig({override_trigger_entity:"",override_trigger_action:""})}}><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 12px; color: var(--secondary-text-color);">Action (optional)</label>
                  <input
                    class="action-input"
                    type="text"
                    placeholder="e.g. on_press, single, toggle"
                    .value=${this._config.override_trigger_action??""}
                    @change=${t=>this._updateConfig({override_trigger_action:t.target.value.trim()})}
                  />
                </div>
              `:H`
                <button class="add-btn" @click=${()=>{this._activePicker="override"}}>
                  Select entity
                </button>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Pick a button, switch, or event entity to toggle occupancy
                </div>
                ${"override"===this._activePicker?H`
                  <fpb-entity-picker
                    .hass=${this.hass}
                    .domains=${["button","input_button","event","switch","input_boolean"]}
                    .exclude=${this._getAllBoundEntityIds()}
                    title="Select Override Trigger"
                    placeholder="Search buttons, switches, events..."
                    @entities-confirmed=${t=>{this._updateConfig({override_trigger_entity:t.detail.entityIds[0]}),this._activePicker=null}}
                    @picker-closed=${()=>{this._activePicker=null}}
                  ></fpb-entity-picker>
                `:Z}
              `}
            </div>

            <!-- Thresholds -->
            <div class="section">
              <div class="section-title">Thresholds</div>

              <div class="slider-row">
                <label>Occupied Threshold <span>${(100*this._config.occupied_threshold).toFixed(0)}%</span></label>
                <input type="range" min="0.1" max="1.0" step="0.05"
                  .value=${String(this._config.occupied_threshold)}
                  @change=${t=>this._updateConfig({occupied_threshold:Number(t.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Vacant Threshold <span>${(100*this._config.vacant_threshold).toFixed(0)}%</span></label>
                <input type="range" min="0.0" max="0.5" step="0.05"
                  .value=${String(this._config.vacant_threshold)}
                  @change=${t=>this._updateConfig({vacant_threshold:Number(t.target.value)})}
                />
              </div>
            </div>
          `:Z}
        `:H`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `}
      </div>
    `}}t([gt({attribute:!1})],Ki.prototype,"hass",void 0),t([gt({type:String})],Ki.prototype,"targetId",void 0),t([gt({type:String})],Ki.prototype,"targetName",void 0),t([gt({type:String})],Ki.prototype,"targetType",void 0),t([ut()],Ki.prototype,"_config",void 0),t([ut()],Ki.prototype,"_occupancyState",void 0),t([ut()],Ki.prototype,"_loading",void 0),t([ut()],Ki.prototype,"_activePicker",void 0),customElements.define("fpb-occupancy-panel",Ki);class Gi extends dt{constructor(){super(...arguments),this.placementId="",this._placement=null,this._loading=!0}static{this.styles=r`
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color);
      border-radius: 50%;
    }

    .close-btn:hover {
      background: var(--secondary-background-color);
    }

    .panel-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }

    .slider-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .slider-row label span {
      color: var(--secondary-text-color);
    }

    .slider-row input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
    }

    .delete-btn {
      padding: 8px 16px;
      background: var(--error-color, #f44336);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }
  `}connectedCallback(){super.connectedCallback(),this._loadPlacement()}updated(t){t.has("placementId")&&this.placementId&&this._loadPlacement()}async _loadPlacement(){if(!this.hass||!this.placementId)return;this._loading=!0;const t=ge.value.find(t=>t.id===this.placementId);this._placement=t??null,this._loading=!1}async _update(t){if(this.hass&&this._placement)try{const e=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...t});this._placement=e,ge.value=ge.value.map(t=>t.id===e.id?e:t)}catch(t){console.error("Failed to update mmWave placement:",t)}}async _deletePlacement(){if(this.hass&&this._placement)try{await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),ge.value=ge.value.filter(t=>t.id!==this.placementId),this.dispatchEvent(new CustomEvent("close-panel"))}catch(t){console.error("Failed to delete mmWave placement:",t)}}render(){return H`
      <div class="panel-header">
        <h3>mmWave Sensor</h3>
        <button class="close-btn" @click=${()=>this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading?H`<ha-circular-progress active></ha-circular-progress>`:this._placement?H`
          <!-- Angle, FOV, Range -->
          <div class="section">
            <div class="section-title">Sensor Settings</div>

            <div class="slider-row">
              <label>Facing Angle <span>${this._placement.angle.toFixed(0)}deg</span></label>
              <input type="range" min="0" max="360" step="1"
                .value=${String(this._placement.angle)}
                @change=${t=>this._update({angle:Number(t.target.value)})}
              />
            </div>

            <div class="slider-row">
              <label>Field of View <span>${this._placement.field_of_view.toFixed(0)}deg</span></label>
              <input type="range" min="30" max="180" step="5"
                .value=${String(this._placement.field_of_view)}
                @change=${t=>this._update({field_of_view:Number(t.target.value)})}
              />
            </div>

            <div class="slider-row">
              <label>Detection Range <span>${this._placement.detection_range.toFixed(0)}cm</span></label>
              <input type="range" min="50" max="1200" step="25"
                .value=${String(this._placement.detection_range)}
                @change=${t=>this._update({detection_range:Number(t.target.value)})}
              />
            </div>
          </div>

          <!-- Delete -->
          <div class="section">
            <button class="delete-btn" @click=${this._deletePlacement}>Delete Sensor</button>
          </div>
        `:H`<p>Placement not found.</p>`}
      </div>
    `}}t([gt({attribute:!1})],Gi.prototype,"hass",void 0),t([gt({type:String})],Gi.prototype,"placementId",void 0),t([ut()],Gi.prototype,"_placement",void 0),t([ut()],Gi.prototype,"_loading",void 0),customElements.define("fpb-mmwave-panel",Gi);class Ji extends dt{constructor(){super(...arguments),this.placementId="",this.deviceType="light",this._rebinding=!1,this._editingTargetIndex=null,this._editingTargetAxis=null,this._selectedCalibrationTarget=0,this._calibrating=!1,this._calibrationStatus="",this._calibrationSampleCount=0,this._calibrationDraftPlacementId=null,this._calibrationDraftPoints=[],this._calibrationPointHandler=t=>{this._handleCalibrationPoint(t)}}static{this.styles=r`
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
      border-radius: 16px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .panel-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.01em;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 8px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 20px;
      transition: color 0.15s, background 0.15s;
    }

    .close-btn:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .panel-body {
      padding: 16px 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }

    .issue-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255, 179, 0, 0.12);
      border: 1px solid rgba(255, 179, 0, 0.45);
    }

    .issue-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--primary-text-color);
      font-size: 12px;
      line-height: 1.35;
    }

    .issue-item ha-icon {
      color: #f9a825;
      flex: 0 0 auto;
      --mdc-icon-size: 16px;
    }

    .entity-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--primary-background-color);
      border-radius: 8px;
      font-size: 13px;
    }

    .entity-row .entity-id {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rebind-btn {
      min-height: 32px;
      padding: 4px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
    }

    .rebind-btn:hover {
      background: var(--secondary-background-color);
    }

    .slider-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .slider-row label span {
      color: var(--secondary-text-color);
    }

    .slider-row input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
    }

    .delete-btn {
      min-height: 36px;
      padding: 8px 16px;
      background: var(--error-color, #f44336);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }

    .delete-btn:hover {
      opacity: 0.9;
    }

    .target-card {
      background: var(--primary-background-color, #fafafa);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .target-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    .target-card-header .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 6px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 16px;
      transition: color 0.15s;
    }

    .target-card-header .remove-btn:hover {
      color: var(--error-color, #f44336);
    }

    .target-axis-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      font-size: 13px;
    }

    .target-axis-row .axis-label {
      font-weight: 600;
      color: var(--secondary-text-color);
      min-width: 14px;
    }

    .target-axis-row .entity-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .target-axis-row .entity-name.empty {
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .add-target-btn {
      min-height: 36px;
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
      align-self: flex-start;
    }

    .add-target-btn:hover {
      opacity: 0.9;
    }

    .calibration-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .calibration-row select {
      flex: 1;
      min-width: 0;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .secondary-btn {
      min-height: 36px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .primary-btn {
      min-height: 36px;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .primary-btn:disabled,
    .secondary-btn:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .calibration-status {
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
    }

    .calibration-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .calibration-points {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .calibration-point {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      font-size: 12px;
    }

    .calibration-point-main {
      flex: 1;
      min-width: 0;
    }

    .calibration-point-title {
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .calibration-point-meta {
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .calibration-point-remove {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      --mdc-icon-size: 16px;
    }

    .calibration-point-remove:hover {
      color: var(--error-color, #f44336);
      background: var(--card-background-color, #fff);
    }

    .metric {
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .metric strong {
      display: block;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 600;
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        border-radius: 20px 20px 0 0;
      }

      .panel-header {
        padding: 14px 16px 10px;
      }

      .panel-body {
        max-height: calc(76vh - 56px);
        overflow-y: auto;
        padding: 14px 16px calc(18px + env(safe-area-inset-bottom));
      }

      .close-btn,
      .rebind-btn,
      .delete-btn,
      .add-target-btn,
      .primary-btn,
      .secondary-btn,
      .calibration-point-remove,
      .target-card-header .remove-btn {
        min-height: 44px;
      }

      .close-btn,
      .calibration-point-remove,
      .target-card-header .remove-btn {
        min-width: 44px;
      }

      .entity-row,
      .target-axis-row,
      .calibration-point {
        min-height: 44px;
      }

      .calibration-row {
        align-items: stretch;
      }

      .calibration-row select {
        min-height: 44px;
      }
    }
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("inhabit-mmwave-calibration-point",this._calibrationPointHandler)}disconnectedCallback(){window.removeEventListener("inhabit-mmwave-calibration-point",this._calibrationPointHandler),pe.value?.placementId===this.placementId&&(pe.value=null),super.disconnectedCallback()}_getPlacement(){return"light"===this.deviceType?ne.value.find(t=>t.id===this.placementId)??null:"switch"===this.deviceType?se.value.find(t=>t.id===this.placementId)??null:"button"===this.deviceType?re.value.find(t=>t.id===this.placementId)??null:"other"===this.deviceType?ae.value.find(t=>t.id===this.placementId)??null:ge.value.find(t=>t.id===this.placementId)??null}_getPickerDomains(){return"other"===this.deviceType?[]:[this.deviceType]}_getPickerExcludeDomains(){return"other"===this.deviceType?["light","switch","button"]:[]}_getPlacementIssues(t){const e=this.hass?.states??{};return"mmwave"===this.deviceType?xe(t,e):ve(t,e)}_renderIssues(t){return 0===t.length?Z:H`
      <div class="issue-list" role="status">
        ${t.map(t=>H`
            <div class="issue-item">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <span>${t.message}</span>
            </div>
          `)}
      </div>
    `}_getExcludedEntityIds(){return"light"===this.deviceType?ne.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):"switch"===this.deviceType?se.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):"button"===this.deviceType?re.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):ae.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id)}async _rebindEntity(t){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/update",light_id:this.placementId,entity_id:t}),ne.value=ne.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/update",switch_id:this.placementId,entity_id:t}),se.value=se.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"button"===this.deviceType?(await this.hass.callWS({type:"inhabit/buttons/update",button_id:this.placementId,entity_id:t}),re.value=re.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"other"===this.deviceType&&(await this.hass.callWS({type:"inhabit/others/update",other_id:this.placementId,entity_id:t}),ae.value=ae.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)),this._rebinding=!1,this.requestUpdate()}catch(t){console.error("Failed to rebind entity:",t)}}async _updateMmwave(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...t});ge.value=ge.value.map(t=>t.id===e.id?e:t),this.requestUpdate()}catch(t){console.error("Failed to update mmWave placement:",t)}}async _deletePlacement(){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/remove",light_id:this.placementId}),ne.value=ne.value.filter(t=>t.id!==this.placementId)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/remove",switch_id:this.placementId}),se.value=se.value.filter(t=>t.id!==this.placementId)):"button"===this.deviceType?(await this.hass.callWS({type:"inhabit/buttons/remove",button_id:this.placementId}),re.value=re.value.filter(t=>t.id!==this.placementId)):"other"===this.deviceType?(await this.hass.callWS({type:"inhabit/others/remove",other_id:this.placementId}),ae.value=ae.value.filter(t=>t.id!==this.placementId)):(await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),ge.value=ge.value.filter(t=>t.id!==this.placementId)),Jt.value={type:"none",ids:[]},he.value=null}catch(t){console.error("Failed to delete placement:",t)}}_close(){he.value=null}_getIcon(){return"light"===this.deviceType?"mdi:lightbulb":"switch"===this.deviceType?"mdi:toggle-switch":"button"===this.deviceType?"mdi:gesture-tap-button":"other"===this.deviceType?"mdi:devices":"mdi:access-point"}_getTitle(){return"light"===this.deviceType?"Light":"switch"===this.deviceType?"Switch":"button"===this.deviceType?"Button":"other"===this.deviceType?"Other Device":"mmWave Sensor"}render(){const t=this._getPlacement();if(!t)return H`
        <div class="panel-header">
          <h3>${this._getTitle()}</h3>
          <button class="close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="panel-body"><p>Placement not found.</p></div>
      `;const e="mmwave"!==this.deviceType&&"entity_id"in t?t.entity_id:void 0,i=e&&this.hass?.states[e]?this.hass.states[e].attributes?.friendly_name??e:e??"No entity",o=this._getPlacementIssues(t);return H`
      <div class="panel-header">
        <h3>
          <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 20px;"></ha-icon>
          ${this._getTitle()}
        </h3>
        <button class="close-btn" @click=${this._close}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._renderIssues(o)}
        <!-- Entity binding (not shown for mmwave) -->
        ${"mmwave"!==this.deviceType?H`
          <div class="section">
            <div class="section-title">Entity</div>
            <div class="entity-row">
              <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${i}</span>
              <button class="rebind-btn" @click=${()=>{this._rebinding=!0}}>Change</button>
            </div>
            ${this._rebinding?H`
              <fpb-entity-picker
                .hass=${this.hass}
                .domains=${this._getPickerDomains()}
                .excludeDomains=${this._getPickerExcludeDomains()}
                .exclude=${this._getExcludedEntityIds()}
                title="Select ${this._getTitle()} Entity"
                placeholder="Search entities..."
                @entities-confirmed=${t=>{this._rebindEntity(t.detail.entityIds[0])}}
                @picker-closed=${()=>{this._rebinding=!1}}
              ></fpb-entity-picker>
            `:Z}
          </div>
        `:Z}

        ${"mmwave"===this.deviceType?this._renderMmwaveSettings(t):null}

        <!-- Delete -->
        <div class="section">
          <button class="delete-btn" @click=${this._deletePlacement}>
            Delete ${this._getTitle()}
          </button>
        </div>
      </div>
    `}_renderMmwaveSettings(t){return H`
      <div class="section">
        <div class="section-title">Sensor Settings</div>

        <div class="slider-row">
          <label>Facing Angle <span>${t.angle.toFixed(0)}&deg;</span></label>
          <input type="range" min="0" max="360" step="1"
            .value=${String(t.angle)}
            @input=${e=>{const i=Number(e.target.value);ge.value=ge.value.map(e=>e.id===t.id?{...e,angle:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({angle:Number(t.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Field of View <span>${t.field_of_view.toFixed(0)}&deg;</span></label>
          <input type="range" min="30" max="180" step="5"
            .value=${String(t.field_of_view)}
            @input=${e=>{const i=Number(e.target.value);ge.value=ge.value.map(e=>e.id===t.id?{...e,field_of_view:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({field_of_view:Number(t.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Detection Range <span>${t.detection_range.toFixed(0)}cm</span></label>
          <input type="range" min="50" max="1200" step="25"
            .value=${String(t.detection_range)}
            @input=${e=>{const i=Number(e.target.value);ge.value=ge.value.map(e=>e.id===t.id?{...e,detection_range:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({detection_range:Number(t.target.value)})}
          />
        </div>
      </div>

      ${this._renderTrackingTargets(t)}
      ${this._renderCalibration(t)}
    `}_renderTrackingTargets(t){const e=t.targets??[],i=t=>t?this.hass?.states[t]?.attributes?.friendly_name??t:null;return H`
      <div class="section">
        <div class="section-title">Tracking Targets</div>

        ${e.map((e,o)=>H`
          <div class="target-card">
            <div class="target-card-header">
              <span>Target ${o+1}</span>
              <button class="remove-btn" @click=${()=>this._removeTarget(t,o)}>
                <ha-icon icon="mdi:trash-can-outline"></ha-icon>
              </button>
            </div>
            <div class="target-axis-row">
              <span class="axis-label">X</span>
              <span class="entity-name ${e.x_entity_id?"":"empty"}">${i(e.x_entity_id)??"Not set"}</span>
              <button class="rebind-btn" @click=${()=>{this._editingTargetIndex=o,this._editingTargetAxis="x"}}>Change</button>
            </div>
            <div class="target-axis-row">
              <span class="axis-label">Y</span>
              <span class="entity-name ${e.y_entity_id?"":"empty"}">${i(e.y_entity_id)??"Not set"}</span>
              <button class="rebind-btn" @click=${()=>{this._editingTargetIndex=o,this._editingTargetAxis="y"}}>Change</button>
            </div>
          </div>

          ${this._editingTargetIndex===o&&null!==this._editingTargetAxis?H`
            <fpb-entity-picker
              .hass=${this.hass}
              .numericOnly=${!0}
              title="Select ${this._editingTargetAxis.toUpperCase()} Entity for Target ${o+1}"
              placeholder="Search numeric entities..."
              @entities-confirmed=${e=>{this._updateTargetEntity(t,o,this._editingTargetAxis,e.detail.entityIds[0])}}
              @picker-closed=${()=>{this._editingTargetIndex=null,this._editingTargetAxis=null}}
            ></fpb-entity-picker>
          `:Z}
        `)}

        <button class="add-target-btn" @click=${()=>this._addTarget(t)}>
          Add target
        </button>
      </div>
    `}async _addTarget(t){const e=[...t.targets??[],{x_entity_id:"",y_entity_id:""}];await this._updateMmwave({targets:e})}async _removeTarget(t,e){const i=(t.targets??[]).filter((t,i)=>i!==e);await this._updateMmwave({targets:i})}async _updateTargetEntity(t,e,i,o){const n=[...t.targets??[]];n[e]={...n[e],["x"===i?"x_entity_id":"y_entity_id"]:o},this._editingTargetIndex=null,this._editingTargetAxis=null,await this._updateMmwave({targets:n})}_renderCalibration(t){const e=t.targets??[],i=this._selectedCalibrationTarget<e.length?this._selectedCalibrationTarget:0,o=e[i],n=Boolean(o?.x_entity_id&&o?.y_entity_id),s=t.calibration,r=this._getCalibrationDraftPoints(t),a=s?.points?.length??(s?.enabled?1:0),l=s?.world_transform;return H`
      <div class="section">
        <div class="section-title">Calibration</div>
        <div class="calibration-row">
          <select
            .value=${String(i)}
            ?disabled=${this._calibrating||0===e.length}
            @change=${t=>{this._selectedCalibrationTarget=Number(t.target.value)}}
          >
            ${e.map((t,e)=>H`
                <option value=${String(e)}>Target ${e+1}</option>
              `)}
          </select>
          <button
            class="primary-btn"
            ?disabled=${!n||this._calibrating}
            @click=${()=>this._armCalibration(t,i)}
          >
            Capture point
          </button>
        </div>

        ${r.length>0?H`
              <div class="calibration-points">
                ${r.map((t,e)=>H`
                    <div class="calibration-point">
                      <div class="calibration-point-main">
                        <div class="calibration-point-title">
                          Point ${e+1} · Target ${t.target_index+1}
                        </div>
                        <div class="calibration-point-meta">
                          Map ${t.map_point.x.toFixed(1)}, ${t.map_point.y.toFixed(1)}
                          · Raw ${t.raw_mean.x.toFixed(1)}, ${t.raw_mean.y.toFixed(1)}
                          · ${t.sample_count} samples
                        </div>
                      </div>
                      <button
                        class="calibration-point-remove"
                        title="Remove point"
                        ?disabled=${this._calibrating}
                        @click=${()=>this._removeCalibrationPoint(e)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `)}
              </div>
              <button
                class="primary-btn"
                ?disabled=${this._calibrating}
                @click=${()=>this._saveCalibration(t)}
              >
                Save calibration
              </button>
            `:H`
              <div class="calibration-status">
                Capture one or more known target points.
              </div>
            `}

        ${this._calibrationStatus?H`
              <div class="calibration-status">
                ${this._calibrationStatus}
                ${this._calibrationSampleCount?H` (${this._calibrationSampleCount} samples)`:Z}
              </div>
            `:Z}

        ${s?.enabled?H`
              <div class="calibration-metrics">
                <div class="metric">
                  <strong>${a}</strong>
                  Points
                </div>
                <div class="metric">
                  <strong>${s.sample_count}</strong>
                  Samples
                </div>
                <div class="metric">
                  <strong>${s.jitter_radius.toFixed(2)}</strong>
                  Jitter radius
                </div>
                <div class="metric">
                  <strong>${s.raw_bias.x.toFixed(1)}</strong>
                  X offset
                </div>
                <div class="metric">
                  <strong>${s.raw_bias.y.toFixed(1)}</strong>
                  Y offset
                </div>
                ${l?H`
                      <div class="metric">
                        <strong>${l.residual_error.toFixed(2)}</strong>
                        Fit error
                      </div>
                    `:Z}
              </div>
              <div class="calibration-status">
                ${s.calibrated_at?new Date(s.calibrated_at).toLocaleString():"Calibration saved"}
              </div>
              <button
                class="secondary-btn"
                ?disabled=${this._calibrating}
                @click=${this._clearCalibration}
              >
                Clear calibration
              </button>
            `:H`
              ${r.length>0?Z:H`
                <div class="calibration-status">
                  No calibration saved.
                </div>
              `}
            `}
      </div>
    `}_armCalibration(t,e){const i=t.targets?.[e];i?.x_entity_id&&i.y_entity_id&&(this._calibrating=!0,this._calibrationSampleCount=0,this._calibrationStatus="Click the target location on the map",pe.value={placementId:t.id,targetIndex:e,points:this._getCalibrationDraftPoints(t).map(t=>t.map_point),sampleCount:0,sampleGoal:25,sampleProgress:0,status:"Tap target point"})}async _handleCalibrationPoint(t){const e=t.detail;if("mmwave"!==this.deviceType||e.placementId!==this.placementId||void 0===e.targetIndex||!e.point)return;const i=this._getPlacement();i&&(pe.value={placementId:i.id,targetIndex:e.targetIndex,points:this._getCalibrationDraftPoints(i).map(t=>t.map_point),activePoint:e.point,sampleCount:0,sampleGoal:25,sampleProgress:0,status:"Sampling",sampling:!0},await this._sampleAndAddCalibrationPoint(i,e.targetIndex,e.point))}async _sampleAndAddCalibrationPoint(t,e,i){if(!this.hass)return;const o=t.targets?.[e];if(!o?.x_entity_id||!o.y_entity_id)return this._calibrating=!1,this._calibrationStatus="Target needs both X and Y entities",void(pe.value=null);const n=[];this._calibrationStatus="Sampling target",this._calibrationSampleCount=0;for(let s=0;s<25;s++){const r=this._readTargetSample(o.x_entity_id,o.y_entity_id);r&&(n.push(r),this._calibrationSampleCount=n.length),pe.value={placementId:t.id,targetIndex:e,points:this._getCalibrationDraftPoints(t).map(t=>t.map_point),activePoint:i,sampleCount:n.length,sampleGoal:25,sampleProgress:(s+1)/25,status:"Sampling",sampling:!0},await new Promise(t=>window.setTimeout(t,200))}if(n.length<10)return this._calibrating=!1,this._calibrationStatus="Calibration needs at least 10 valid samples",void(pe.value={placementId:t.id,targetIndex:e,points:this._getCalibrationDraftPoints(t).map(t=>t.map_point),activePoint:i,sampleCount:n.length,sampleGoal:25,sampleProgress:1,status:"Needs 10 samples"});const s=this._meanSamples(n),r=this._stddevSamples(n,s),a=[...this._getCalibrationDraftPoints(t),{target_index:e,map_point:i,raw_mean:s,raw_stddev:r,sample_count:n.length}];this._calibrationDraftPlacementId=t.id,this._calibrationDraftPoints=a,this._calibrating=!1,this._calibrationStatus=`Point ${a.length} captured`,pe.value={placementId:t.id,targetIndex:e,points:a.map(t=>t.map_point),activePoint:i,sampleCount:n.length,sampleGoal:25,sampleProgress:1,status:"Captured"},window.setTimeout(()=>{const i=pe.value;i?.placementId===t.id&&i.targetIndex===e&&"Captured"===i.status&&(pe.value=null)},900),this.requestUpdate()}_readTargetSample(t,e){const i=this.hass?.states[t],o=this.hass?.states[e];if(!i||!o)return null;const n=Number.parseFloat(i.state),s=Number.parseFloat(o.state);return Number.isFinite(n)&&Number.isFinite(s)?0===n&&0===s?null:{x:n,y:s}:null}async _clearCalibration(){if(this.hass&&"mmwave"===this.deviceType){this._calibrationStatus="Clearing calibration";try{const t=await this.hass.callWS({type:"inhabit/mmwave/clear_calibration",placement_id:this.placementId});ge.value=ge.value.map(e=>e.id===t.id?t:e),this._calibrationDraftPlacementId=this.placementId,this._calibrationDraftPoints=[],this._calibrationStatus="Calibration cleared"}catch(t){console.error("Failed to clear mmWave calibration:",t),this._calibrationStatus="Clear calibration failed"}}}_getCalibrationDraftPoints(t){if(this._calibrationDraftPlacementId===t.id)return this._calibrationDraftPoints;const e=this._pointsFromCalibration(t);return this._calibrationDraftPlacementId=t.id,this._calibrationDraftPoints=e,e}_pointsFromCalibration(t){const e=t.calibration;return e?.enabled?e.points?.length?e.points.map(t=>({...t})):[{target_index:e.target_index,map_point:e.map_point,raw_mean:e.raw_mean,raw_stddev:e.raw_stddev,raw_bias:e.raw_bias,sample_count:e.sample_count}]:[]}_removeCalibrationPoint(t){this._calibrationDraftPlacementId&&(this._calibrationDraftPoints=this._calibrationDraftPoints.filter((e,i)=>i!==t),this._calibrationStatus=this._calibrationDraftPoints.length>0?"Point removed. Save calibration to apply.":"No calibration points in draft")}async _saveCalibration(t){if(!this.hass||"mmwave"!==this.deviceType)return;const e=this._getCalibrationDraftPoints(t);if(0!==e.length){this._calibrating=!0,this._calibrationStatus="Saving calibration";try{const i=await this.hass.callWS({type:"inhabit/mmwave/calibrate",placement_id:t.id,points:e});ge.value=ge.value.map(t=>t.id===i.id?i:t),this._calibrationDraftPlacementId=i.id,this._calibrationDraftPoints=this._pointsFromCalibration(i),this._calibrationStatus="Calibration saved"}catch(t){console.error("Failed to calibrate mmWave placement:",t),this._calibrationStatus="Calibration failed"}finally{this._calibrating=!1,this.requestUpdate()}}else this._calibrationStatus="Capture at least one point"}_meanSamples(t){return{x:t.reduce((t,e)=>t+e.x,0)/t.length,y:t.reduce((t,e)=>t+e.y,0)/t.length}}_stddevSamples(t,e){return{x:Math.sqrt(t.reduce((t,i)=>t+(i.x-e.x)**2,0)/t.length),y:Math.sqrt(t.reduce((t,i)=>t+(i.y-e.y)**2,0)/t.length)}}}t([gt({attribute:!1})],Ji.prototype,"hass",void 0),t([gt({type:String})],Ji.prototype,"placementId",void 0),t([gt({type:String})],Ji.prototype,"deviceType",void 0),t([ut()],Ji.prototype,"_rebinding",void 0),t([ut()],Ji.prototype,"_editingTargetIndex",void 0),t([ut()],Ji.prototype,"_editingTargetAxis",void 0),t([ut()],Ji.prototype,"_selectedCalibrationTarget",void 0),t([ut()],Ji.prototype,"_calibrating",void 0),t([ut()],Ji.prototype,"_calibrationStatus",void 0),t([ut()],Ji.prototype,"_calibrationSampleCount",void 0),t([ut()],Ji.prototype,"_calibrationDraftPlacementId",void 0),t([ut()],Ji.prototype,"_calibrationDraftPoints",void 0),customElements.define("fpb-device-panel",Ji);class Qi extends dt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1,this._haAreas=[],this._focusedRoomId=null,this._occupancyPanelTarget=null,this._devicePanelTarget=null,this._editorMode=!1,this._calibrationCaptureActive=!1,this._cleanupEffects=[]}get _isAdmin(){return this.hass?.user?.is_admin??!1}static{this.styles=r`
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
      flex-shrink: 0;
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      min-height: 0;
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
      min-height: 32px;
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

    .floating-panel {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 300px;
      max-height: calc(100% - 32px);
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      scrollbar-width: thin;
    }

    .viewer-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      height: var(--header-height, 48px);
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .viewer-toolbar h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      flex: 1;
    }

    .floor-select {
      padding: 4px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .edit-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 36px;
      padding: 4px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }

    .edit-toggle:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .edit-toggle.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color, #03a9f4);
    }

    .calibration-hidden-panel {
      display: none;
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        --toolbar-height: 52px;
      }

      .main-area {
        position: relative;
      }

      .container:not(.calibration-capture) .canvas-container {
        padding-bottom: calc(148px + env(safe-area-inset-bottom));
        box-sizing: border-box;
      }

      .viewer-toolbar {
        height: auto;
        min-height: 52px;
        padding: 8px 12px;
        gap: 8px;
      }

      .edit-toggle {
        min-width: 44px;
        min-height: 44px;
        justify-content: center;
        border-radius: 13px;
      }

      .floor-select {
        min-height: 40px;
      }

      .room-chips-bar {
        padding: 8px 10px;
      }

      .room-chip {
        min-height: 40px;
        border-radius: 20px;
        padding: 6px 14px;
      }

      .floating-panel {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: min(76vh, 620px);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.22);
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 300;
      }
    }

  `}connectedCallback(){var t;super.connectedCallback(),Xt.value=null,Yt.value=null,Kt.value="walls",Gt.value="select",Jt.value={type:"none",ids:[]},Qt.value={x:0,y:0,width:1e3,height:800},te.value=10,ee.value=!0,ie.value=!0,oe.value=structuredClone(Vt),ne.value=[],se.value=[],re.value=[],ae.value=[],le.value=new Map,de.value=null,ce.value=null,he.value=null,pe.value=null,ge.value=[],ue.value=[],fe.value=!1,Zt._reloadFloorData=null,this._applyMode(),t=()=>this._reloadCurrentFloor(),Zt._reloadFloorData=t,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(Nt(()=>{this._focusedRoomId=de.value}),Nt(()=>{this._occupancyPanelTarget=ce.value}),Nt(()=>{this._devicePanelTarget=he.value}),Nt(()=>{this._calibrationCaptureActive=null!==pe.value}),Nt(()=>{Yt.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback();for(const t of this._cleanupEffects)t();this._cleanupEffects=[]}_applyMode(){this._editorMode?(Kt.value="walls",qt()):(Kt.value="viewing",Gt.value="select",Jt.value={type:"none",ids:[]},ie.value=!1,ce.value=null,he.value=null)}_toggleEditorMode(){this._isAdmin&&(this._editorMode=!this._editorMode,this._applyMode())}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}async _reloadCurrentFloor(){if(!this.hass)return;const t=Xt.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const i=e.find(e=>e.id===t.id);if(i){Xt.value=i;const t=Yt.value?.id;if(t){const e=i.floors.find(e=>e.id===t);e?Yt.value=e:i.floors.length>0&&(Yt.value=i.floors[0])}else i.floors.length>0&&(Yt.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(t){console.error("Error reloading floor data:",t)}}_detectFloorConflicts(t){const e=new Map;for(const i of t.floors){const t=wi(i.nodes,i.edges);t.length>0&&(e.set(i.id,t),console.warn(`[inhabit] Detected ${t.length} constraint conflict(s) on floor "${i.id}":`,t.map(t=>`${t.edgeId} (${t.type})`)))}le.value=e}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Xt.value=t[0],t[0].floors.length>0&&(Yt.value=t[0].floors[0],te.value=t[0].grid_size),this._detectFloorConflicts(t[0]),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t instanceof Error?t.message:t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(!this.hass)return;const e=await Promise.allSettled([this.hass.callWS({type:"inhabit/lights/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/switches/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/buttons/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/others/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/mmwave/list",floor_plan_id:t})]),i=["lights","switches","buttons","others","mmwave"],o=[ne,se,re,ae,ge];for(let t=0;t<e.length;t++){const n=e[t];"fulfilled"===n.status?o[t].value=n.value:console.error(`Error loading ${i[t]} placements:`,n.reason)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let i=0;i<t;i++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${i+1}`,level:i});e.floors.push(t)}this._floorPlans=[e],Xt.value=e,Yt.value=e.floors[0],te.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t instanceof Error?t.message:t}`)}}async _addFloor(){if(!this.hass)return;const t=Xt.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),o={...t,floors:[...t.floors,i]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?o:e),Xt.value=o,Yt.value=i}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t instanceof Error?t.message:t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=Xt.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const i=e.floors.filter(e=>e.id!==t),o={...e,floors:i};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?o:t),Xt.value=o,Yt.value?.id===t&&(qt(),Yt.value=i.length>0?i[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t instanceof Error?t.message:t}`)}}async _renameFloor(t,e){if(!this.hass)return;const i=Xt.value;if(i)try{await this.hass.callWS({type:"inhabit/floors/update",floor_plan_id:i.id,floor_id:t,name:e});const o=i.floors.map(i=>i.id===t?{...i,name:e}:i),n={...i,floors:o};this._floorPlans=this._floorPlans.map(t=>t.id===i.id?n:t),Xt.value=n,Yt.value?.id===t&&(Yt.value={...Yt.value,name:e})}catch(t){console.error("Error renaming floor:",t)}}_openImportExport(){const t=this.shadowRoot?.querySelector("fpb-import-export-dialog");t?.show()}async _handleFloorsImported(t){const{floorPlan:e,switchTo:i}=t.detail;this._floorPlans=this._floorPlans.map(t=>t.id===e.id?e:t),Xt.value=e,i&&(qt(),Yt.value=i),await this._loadDevicePlacements(e.id)}_handleFloorSelect(t){const e=Xt.value;if(e){const i=e.floors.find(e=>e.id===t);i&&(Yt.value?.id!==i.id&&(qt(),de.value=null),Yt.value=i)}}_handleFloorChange(t){const e=t.target;this._handleFloorSelect(e.value)}_handleRoomChipClick(t){null===t?(de.value=null,ce.value=null):de.value===t?de.value=null:de.value=t}_renderRoomChips(){const t=Yt.value;if(!t||0===t.rooms.length)return null;const e=Xt.value?.unit,i=t=>{switch(e){case"cm":return t/1e4;case"m":default:return t;case"in":return 64516e-8*t;case"ft":return.092903*t}},o=[...t.rooms].sort((t,e)=>{const o=i(Math.abs($e(t.polygon))),n=i(Math.abs($e(e.polygon)));return o===n?t.name.localeCompare(e.name):n-o});return H`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${o.map(t=>{const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id):null,i=e?.icon||"mdi:floor-plan",o=e?.name??t.name;return H`
            <button
              class="room-chip ${this._focusedRoomId===t.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(t.id)}
            >
              <ha-icon icon=${i} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${o}</span>
            </button>
          `})}
      </div>
    `}_renderViewerToolbar(){const t=Xt.value,e=t?.floors??[],i=Yt.value?.id;return H`
      <div class="viewer-toolbar">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        ${e.length>1?H`
              <select
                class="floor-select"
                .value=${i??""}
                @change=${this._handleFloorChange}
              >
                ${e.map(t=>H`<option value=${t.id} ?selected=${t.id===i}>
                      ${t.name}
                    </option>`)}
              </select>
            `:null}
        <span style="flex:1"></span>
        ${this._isAdmin?H`
              <button
                class="edit-toggle ${this._editorMode?"active":""}"
                @click=${this._toggleEditorMode}
                title=${this._editorMode?"Exit editor":"Edit floor plan"}
              >
                <ha-icon icon=${this._editorMode?"mdi:close":"mdi:pencil"} style="--mdc-icon-size: 18px;"></ha-icon>
                <span>${this._editorMode?"Done":"Edit"}</span>
              </button>
            `:null}
      </div>
    `}render(){return this._loading?H`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plan...</p>
        </div>
      `:this._error?H`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?this._isAdmin?H`
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
          <div class="empty-state">
            <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
            <h2>No Floor Plans</h2>
            <p>Ask an administrator to create a floor plan.</p>
          </div>
        `:this._editorMode?H`
        <div class="container ${this._calibrationCaptureActive?"calibration-capture":""}">
          <div class="main-area">
            ${this._calibrationCaptureActive?null:H`
              <fpb-toolbar
                .hass=${this.hass}
                .floorPlans=${this._floorPlans}
                @floor-select=${t=>this._handleFloorSelect(t.detail.id)}
                @add-floor=${this._addFloor}
                @delete-floor=${t=>this._deleteFloor(t.detail.id)}
                @rename-floor=${t=>this._renameFloor(t.detail.id,t.detail.name)}
                @open-import-export=${this._openImportExport}
                @exit-editor=${this._toggleEditorMode}
              ></fpb-toolbar>
            `}

            ${this._calibrationCaptureActive?null:this._renderRoomChips()}

            <div class="canvas-container">
              <fpb-canvas .hass=${this.hass}></fpb-canvas>
              ${this._occupancyPanelTarget?H`
                <fpb-occupancy-panel
                  class="floating-panel"
                  .hass=${this.hass}
                  .targetId=${this._occupancyPanelTarget.id}
                  .targetName=${this._occupancyPanelTarget.name}
                  .targetType=${this._occupancyPanelTarget.type}
                  @close-panel=${()=>{ce.value=null,de.value=null}}
                ></fpb-occupancy-panel>
              `:null}
              ${this._devicePanelTarget?H`
                <fpb-device-panel
                  class=${this._calibrationCaptureActive?"calibration-hidden-panel":"floating-panel"}
                  .hass=${this.hass}
                  .placementId=${this._devicePanelTarget.id}
                  .deviceType=${this._devicePanelTarget.type}
                ></fpb-device-panel>
              `:null}
            </div>
          </div>
        </div>
        <fpb-import-export-dialog
          .hass=${this.hass}
          @floors-imported=${this._handleFloorsImported}
        ></fpb-import-export-dialog>
      `:H`
      ${this._renderViewerToolbar()}
      ${this._renderRoomChips()}
      <div class="canvas-container">
        <fpb-canvas .hass=${this.hass}></fpb-canvas>
      </div>
    `}}t([gt({attribute:!1})],Qi.prototype,"hass",void 0),t([gt({type:Boolean})],Qi.prototype,"narrow",void 0),t([ut()],Qi.prototype,"_floorPlans",void 0),t([ut()],Qi.prototype,"_loading",void 0),t([ut()],Qi.prototype,"_error",void 0),t([ut()],Qi.prototype,"_floorCount",void 0),t([ut()],Qi.prototype,"_haAreas",void 0),t([ut()],Qi.prototype,"_focusedRoomId",void 0),t([ut()],Qi.prototype,"_occupancyPanelTarget",void 0),t([ut()],Qi.prototype,"_devicePanelTarget",void 0),t([ut()],Qi.prototype,"_editorMode",void 0),t([ut()],Qi.prototype,"_calibrationCaptureActive",void 0),customElements.define("ha-floorplan-panel",Qi);export{Qi as HaFloorplanPanel};
