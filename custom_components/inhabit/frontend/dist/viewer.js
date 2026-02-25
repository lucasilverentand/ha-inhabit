function t(t,e,i,o){var n,s=arguments.length,a=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(a=(s<3?n(a):s>3?n(e,i,a):n(e,i))||a);return s>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new s(i,t,o)},r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:g,getPrototypeOf:p}=Object,u=globalThis,_=u.trustedTypes,f=_?_.emptyScript:"",y=u.reactiveElementPolyfillSupport,v=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const s=o?.call(this);n?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...g(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=o;const s=n.fromAttribute(e,t.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const s=this.constructor;if(!1===o&&(n=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??x)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[v("elementProperties")]=new Map,$[v("finalized")]=new Map,y?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,k=t=>t,E=b.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+S,A=`<${I}>`,z=document,C=()=>z.createComment(""),L=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,N="[ \t\n\f\r]",W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,T=/>/g,B=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,F=/"/g,Z=/^(?:script|style|textarea|title)$/i,H=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),U=H(1),V=H(2),q=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),K=new WeakMap,Y=z.createTreeWalker(z,129);function X(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}class G{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,s=0;const a=t.length-1,r=this.parts,[l,d]=((t,e)=>{const i=t.length-1,o=[];let n,s=2===e?"<svg>":3===e?"<math>":"",a=W;for(let e=0;e<i;e++){const i=t[e];let r,l,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===W?"!--"===l[1]?a=R:void 0!==l[1]?a=T:void 0!==l[2]?(Z.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=B):void 0!==l[3]&&(a=B):a===B?">"===l[0]?(a=n??W,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,r=l[1],a=void 0===l[3]?B:'"'===l[3]?F:O):a===F||a===O?a=B:a===R||a===T?a=W:(a=B,n=void 0);const h=a===B&&t[e+1].startsWith("/>")?" ":"";s+=a===W?i+A:d>=0?(o.push(r),i.slice(0,d)+M+i.slice(d)+S+h):i+S+(-2===d?e:h)}return[X(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=G.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=Y.nextNode())&&r.length<a;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(M)){const e=d[s++],i=o.getAttribute(t).split(S),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:n,name:a[2],strings:i,ctor:"."===a[1]?it:"?"===a[1]?ot:"@"===a[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(S)&&(r.push({type:6,index:n}),o.removeAttribute(t));if(Z.test(o.tagName)){const t=o.textContent.split(S),e=t.length-1;if(e>0){o.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],C()),Y.nextNode(),r.push({type:2,index:++n});o.append(t[e],C())}}}else if(8===o.nodeType)if(o.data===I)r.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(S,t+1));)r.push({type:7,index:n}),t+=S.length-1}n++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){if(e===q)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=L(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=J(t,n._$AS(t,e.values),n,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??z).importNode(e,!0);Y.currentNode=o;let n=Y.nextNode(),s=0,a=0,r=i[0];for(;void 0!==r;){if(s===r.index){let e;2===r.type?e=new tt(n,n.nextSibling,this,t):1===r.type?e=new r.ctor(n,r.name,r.strings,this,t):6===r.type&&(e=new st(n,this,t)),this._$AV.push(e),r=i[++a]}s!==r?.index&&(n=Y.nextNode(),s++)}return Y.currentNode=z,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),L(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==j&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new G(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(C()),this.O(C()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}_$AI(t,e=this,i,o){const n=this.strings;let s=!1;if(void 0===n)t=J(this,t,e,0),s=!L(t)||t!==this._$AH&&t!==q,s&&(this._$AH=t);else{const o=t;let a,r;for(t=n[0],a=0;a<n.length-1;a++)r=J(this,o[i+a],e,a),r===q&&(r=this._$AH[a]),s||=!L(r)||r!==this._$AH[a],r===j?t=j:t!==j&&(t+=(r??"")+n[a+1]),this._$AH[a]=r}s&&!o&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==j)}}class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??j)===q)return;const i=this._$AH,o=t===j&&i!==j||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==j&&(i===j||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const at=b.litHtmlPolyfillSupport;at?.(G,tt),(b.litHtmlVersions??=[]).push("3.3.2");const rt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(C(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};lt._$litElement$=!0,lt.finalized=!0,rt.litElementHydrateSupport?.({LitElement:lt});const dt=rt.litElementPolyfillSupport;dt?.({LitElement:lt}),(rt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:x},ht=(t=ct,e,i)=>{const{kind:o,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,n,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];e.call(this,i),this.requestUpdate(o,n,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};function gt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pt(t){return gt({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ut=Symbol.for("preact-signals");function _t(){if(mt>1)return void mt--;let t,e=!1;for(;void 0!==yt;){let i=yt;for(yt=void 0,xt++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&Et(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if(xt=0,mt--,e)throw t}let ft,yt;function vt(t){const e=ft;ft=void 0;try{return t()}finally{ft=e}}let mt=0,xt=0,wt=0;function $t(t){if(void 0===ft)return;let e=t.n;return void 0===e||e.t!==ft?(e={i:0,S:t,p:ft.s,n:void 0,t:ft,e:void 0,x:void 0,r:e},void 0!==ft.s&&(ft.s.n=e),ft.s=e,t.n=e,32&ft.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=ft.s,e.n=void 0,ft.s.n=e,ft.s=e),e):void 0}function bt(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function kt(t,e){return new bt(t,e)}function Et(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Pt(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Mt(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function St(t,e){bt.call(this,void 0),this.x=t,this.s=void 0,this.g=wt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function It(t,e){return new St(t,e)}function At(t){const e=t.u;if(t.u=void 0,"function"==typeof e){mt++;const i=ft;ft=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,zt(t),e}finally{ft=i,_t()}}}function zt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,At(t)}function Ct(t){if(ft!==this)throw new Error("Out-of-order effect");Mt(this),ft=t,this.f&=-2,8&this.f&&zt(this),_t()}function Lt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Dt(t,e){const i=new Lt(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}bt.prototype.brand=ut,bt.prototype.h=function(){return!0},bt.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:vt(()=>{var t;null==(t=this.W)||t.call(this)}))},bt.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&vt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},bt.prototype.subscribe=function(t){return Dt(()=>{const e=this.value,i=ft;ft=void 0;try{t(e)}finally{ft=i}},{name:"sub"})},bt.prototype.valueOf=function(){return this.value},bt.prototype.toString=function(){return this.value+""},bt.prototype.toJSON=function(){return this.value},bt.prototype.peek=function(){const t=ft;ft=void 0;try{return this.value}finally{ft=t}},Object.defineProperty(bt.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(xt>100)throw new Error("Cycle detected");this.v=t,this.i++,wt++,mt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{_t()}}}}),St.prototype=new bt,St.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===wt)return!0;if(this.g=wt,this.f|=1,this.i>0&&!Et(this))return this.f&=-2,!0;const t=ft;try{Pt(this),ft=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return ft=t,Mt(this),this.f&=-2,!0},St.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}bt.prototype.S.call(this,t)},St.prototype.U=function(t){if(void 0!==this.t&&(bt.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},St.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(St.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Lt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Lt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,At(this),Pt(this),mt++;const t=ft;return ft=this,Ct.bind(this,t)},Lt.prototype.N=function(){2&this.f||(this.f|=2,this.o=yt,yt=this)},Lt.prototype.d=function(){this.f|=8,1&this.f||zt(this)},Lt.prototype.dispose=function(){this.d()},window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:kt(null),currentFloor:kt(null),canvasMode:kt("walls"),activeTool:kt("select"),selection:kt({type:"none",ids:[]}),viewBox:kt({x:0,y:0,width:1e3,height:800}),gridSize:kt(10),snapToGrid:kt(!0),showGrid:kt(!0),layers:kt([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),lightPlacements:kt([]),switchPlacements:kt([]),buttonPlacements:kt([]),constraintConflicts:kt(new Map),focusedRoomId:kt(null),occupancyPanelTarget:kt(null),devicePanelTarget:kt(null),mmwavePlacements:kt([]),simulatedTargets:kt([]),simHitboxEnabled:kt(!1),_reloadFloorData:null});const Nt=window.__inhabit_signals,Wt=Nt.currentFloorPlan,Rt=Nt.currentFloor,Tt=Nt.canvasMode,Bt=Nt.activeTool,Ot=Nt.selection,Ft=Nt.viewBox,Zt=Nt.gridSize,Ht=Nt.snapToGrid,Ut=Nt.showGrid,Vt=Nt.layers,qt=Nt.lightPlacements,jt=Nt.switchPlacements,Kt=Nt.buttonPlacements,Yt=Nt.constraintConflicts,Xt=Nt.focusedRoomId,Gt=Nt.occupancyPanelTarget,Jt=Nt.devicePanelTarget,Qt=Nt.mmwavePlacements,te=Nt.simulatedTargets,ee=Nt.simHitboxEnabled;async function ie(){Nt._reloadFloorData&&await Nt._reloadFloorData()}function oe(t){const e=t.vertices;if(0===e.length)return"";const i=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return i.join(" ")+" Z"}function ne(t,e){const i=e.x-t.x,o=e.y-t.y;return Math.sqrt(i*i+o*o)}function se(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function ae(t){const e=t.vertices;if(e.length<3)return 0;let i=0;const o=e.length;for(let t=0;t<o;t++){const n=(t+1)%o;i+=e[t].x*e[n].y,i-=e[n].x*e[t].y}return i/2}function re(t){if(t.length<2)return{anchor:t[0]||{x:0,y:0},dir:{x:1,y:0}};let e=0,i=t[0],o=t[1];for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const a=ne(t[n],t[s]);a>e&&(e=a,i=t[n],o=t[s])}if(e<1e-9)return{anchor:i,dir:{x:1,y:0}};return{anchor:i,dir:{x:(o.x-i.x)/e,y:(o.y-i.y)/e}}}function le(t,e,i){const o=t.x-e.x,n=t.y-e.y,s=o*i.x+n*i.y;return{x:e.x+s*i.x,y:e.y+s*i.y}}const de=.05,ce=.2,he="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),ge="%c[constraint]",pe="color:#8b5cf6;font-weight:bold",ue="color:#888",_e="color:#ef4444;font-weight:bold",fe="color:#22c55e;font-weight:bold";function ye(t){return`(${t.x.toFixed(1)},${t.y.toFixed(1)})`}function ve(t,e){const i=e.get(t.start_node),o=e.get(t.end_node),n=[];"free"!==t.direction&&n.push(t.direction),t.length_locked&&n.push("len🔒"),t.angle_group&&n.push(`ang:${t.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",a=i&&o?ne(i,o).toFixed(1):"?";return`${t.id.slice(0,8)}… (${a}cm${s})`}function me(t){return t.slice(0,8)+"…"}function xe(t,e){const i=new Map,o=new Map,n=new Map;for(const e of t)i.set(e.id,e);for(const t of e)o.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:i,edges:o,nodeToEdges:n}}function we(t){return"free"!==t.direction||t.length_locked}function $e(t){const e=new Map;for(const[i,o]of t.nodes)e.set(i,{x:o.x,y:o.y});return e}function be(t,e,i,o,n){let s={x:o.x,y:o.y};if("horizontal"===t.direction?s={x:s.x,y:i.y}:"vertical"===t.direction&&(s={x:i.x,y:s.y}),t.length_locked){const e=ne(n.nodes.get(t.start_node),n.nodes.get(t.end_node)),o=s.x-i.x,a=s.y-i.y,r=Math.sqrt(o*o+a*a);if(r>0&&e>0){const t=e/r;s={x:i.x+o*t,y:i.y+a*t}}}return s}function ke(t,e,i,o,n){const s=o.has(t.start_node),a=o.has(t.end_node);if(s&&a)return{idealStart:e,idealEnd:i};if(s){return{idealStart:e,idealEnd:be(t,t.start_node,e,i,n)}}if(a){return{idealStart:be(t,t.end_node,i,e,n),idealEnd:i}}return function(t,e,i,o){const n=ne(o.nodes.get(t.start_node),o.nodes.get(t.end_node));let s={x:e.x,y:e.y},a={x:i.x,y:i.y};if("horizontal"===t.direction){const t=(s.y+a.y)/2;s={x:s.x,y:t},a={x:a.x,y:t}}else if("vertical"===t.direction){const t=(s.x+a.x)/2;s={x:t,y:s.y},a={x:t,y:a.y}}if(t.length_locked){const t=(s.x+a.x)/2,e=(s.y+a.y)/2,i=a.x-s.x,o=a.y-s.y,r=Math.sqrt(i*i+o*o);if(r>0&&n>0){const l=n/2/(r/2);s={x:t-i/2*l,y:e-o/2*l},a={x:t+i/2*l,y:e+o/2*l}}}return{idealStart:s,idealEnd:a}}(t,e,i,n)}function Ee(t,e){let i=0;const o=[],n=new Map;for(const[s,a]of t.edges){if(!we(a))continue;const r=e.get(a.start_node),l=e.get(a.end_node);if(!r||!l)continue;let d=0;if("horizontal"===a.direction?d=Math.max(d,Math.abs(r.y-l.y)):"vertical"===a.direction&&(d=Math.max(d,Math.abs(r.x-l.x))),a.length_locked){const e=ne(t.nodes.get(a.start_node),t.nodes.get(a.end_node)),i=ne(r,l);d=Math.max(d,Math.abs(i-e))}n.set(s,d),d>ce&&o.push(s),d>i&&(i=d)}const s=Me(t,e);for(const[,a]of s){let s=0;for(const t of a.nodeIds){const i=e.get(t);if(!i)continue;const o=ne(i,le(i,a.anchor,a.dir));s=Math.max(s,o)}for(const[e,i]of t.edges)if(i.collinear_group&&a.nodeIds.has(i.start_node)){const t=n.get(e)??0;n.set(e,Math.max(t,s)),s>ce&&(o.includes(e)||o.push(e));break}i=Math.max(i,s)}const a=Se(t);for(const[,s]of a){const a=e.get(s.sharedNodeId);if(!a)continue;let r=0;for(let i=0;i<s.edgeIds.length;i++){const o=t.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=e.get(n);if(!l)continue;let d=Math.atan2(l.y-a.y,l.x-a.x)-s.originalAngles[i];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=ne(a,l);for(let o=i+1;o<s.edgeIds.length;o++){const i=t.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=e.get(n);if(!l)continue;let h=Math.atan2(l.y-a.y,l.x-a.x)-s.originalAngles[o];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let g=d-h;for(;g>Math.PI;)g-=2*Math.PI;for(;g<-Math.PI;)g+=2*Math.PI;const p=(c+ne(a,l))/2;r=Math.max(r,Math.abs(g)*p)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,r)),r>ce&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,r))}const r=Ae(t);for(const[,s]of r){const a=[];for(const i of s.edgeIds){const o=t.edges.get(i),n=e.get(o.start_node),s=e.get(o.end_node);n&&s?a.push(ne(n,s)):a.push(0)}let r=0;for(const t of a)r=Math.max(r,Math.abs(t-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,r)),r>ce&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,r))}return{maxViolation:i,violatingEdgeIds:o,magnitudes:n}}function Pe(t,e,i,o){const n=function(t,e){const i=[],o=new Set,n=new Set,s=[];for(const t of e)s.push(t),n.add(t);for(;s.length>0;){const e=s.shift(),a=t.nodeToEdges.get(e)||[];for(const{edgeId:r}of a){if(o.has(r))continue;o.add(r);const a=t.edges.get(r);if(!a)continue;i.push(a);const l=a.start_node===e?a.end_node:a.start_node;n.has(l)||(n.add(l),s.push(l))}}return i}(t,e),s=n.filter(we),a=Me(t,i),r=Se(t),l=Ae(t);let d=0,c=0;he&&(console.groupCollapsed(ge+" solveIterative: %c%d constrained edges, %d pinned nodes",pe,ue,s.length,e.size),console.log("  Pinned nodes:",[...e].map(me).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(e=>ve(e,t.nodes)).join(" | ")||"(none)"),o&&o.size>0&&console.log("  Pre-existing violations:",[...o.entries()].map(([e,i])=>{const o=t.edges.get(e);return(o?ve(o,t.nodes):e.slice(0,8)+"…")+` (${i.toFixed(2)})`}).join(" | ")));for(let o=0;o<100;o++){d=0,c=o+1;const s=0===o?new Set(e):e;for(const a of n){if(!we(a))continue;const n=i.get(a.start_node),r=i.get(a.end_node);if(!n||!r)continue;const{idealStart:l,idealEnd:c}=ke(a,n,r,s,t);if(!e.has(a.start_node)){const t=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,t),i.set(a.start_node,l)}if(!e.has(a.end_node)){const t=Math.max(Math.abs(c.x-r.x),Math.abs(c.y-r.y));d=Math.max(d,t),i.set(a.end_node,c)}0===o&&(s.add(a.start_node),s.add(a.end_node))}for(const[,t]of a)for(const o of t.nodeIds){if(e.has(o))continue;const n=i.get(o);if(!n)continue;const s=le(n,t.anchor,t.dir),a=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));a>de&&(d=Math.max(d,a),i.set(o,s))}const h=Ie(t,r,e,i);d=Math.max(d,h);const g=ze(t,l,e,i);if(d=Math.max(d,g),d<de)break}const h=[];for(const[e,o]of i){const i=t.nodes.get(e);(Math.abs(o.x-i.x)>de||Math.abs(o.y-i.y)>de)&&h.push({nodeId:e,x:o.x,y:o.y})}if(d<de)he&&console.log(ge+" %cConverged%c in %d iteration(s), %d node(s) moved",pe,fe,"",c,h.length);else{const{violatingEdgeIds:e,maxViolation:n,magnitudes:s}=Ee(t,i),a=[];for(const t of e)if(o){const e=o.get(t);if(void 0===e)a.push(t);else{(s.get(t)??0)>e+de&&a.push(t)}}else a.push(t);if(a.length>0)return he&&(console.log(`${ge} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,pe,_e,""),console.log("  All violating edges:",e.map(e=>{const i=t.edges.get(e);return i?ve(i,t.nodes):e.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",a.map(e=>{const o=t.edges.get(e);if(!o)return e.slice(0,8)+"…";const n=i.get(o.start_node),s=i.get(o.end_node),a=n&&s?` now ${ye(n)}→${ye(s)}`:"";return ve(o,t.nodes)+a}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:a};he&&console.log(`${ge} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,pe,"color:#f59e0b;font-weight:bold","")}return he&&console.groupEnd(),{updates:h,blocked:!1}}function Me(t,e){const i=new Map,o=new Map;for(const[,e]of t.edges){if(!e.collinear_group)continue;o.has(e.collinear_group)||o.set(e.collinear_group,new Set);const t=o.get(e.collinear_group);t.add(e.start_node),t.add(e.end_node)}for(const[t,n]of o){const o=[];for(const t of n){const i=e.get(t);i&&o.push(i)}if(o.length<2)continue;const{anchor:s,dir:a}=re(o);i.set(t,{nodeIds:n,anchor:s,dir:a})}return i}function Se(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.angle_group&&(i.has(e.angle_group)||i.set(e.angle_group,[]),i.get(e.angle_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;const i=n.map(e=>t.edges.get(e)),s=new Map;for(const t of i)s.set(t.start_node,(s.get(t.start_node)??0)+1),s.set(t.end_node,(s.get(t.end_node)??0)+1);let a=null;for(const[t,e]of s)if(e===n.length){a=t;break}if(!a)continue;const r=t.nodes.get(a);if(!r)continue;const l=[];let d=!0;for(const e of i){const i=e.start_node===a?e.end_node:e.start_node,o=t.nodes.get(i);if(!o){d=!1;break}l.push(Math.atan2(o.y-r.y,o.x-r.x))}d&&e.set(o,{edgeIds:n,sharedNodeId:a,originalAngles:l})}return e}function Ie(t,e,i,o){let n=0;for(const[,s]of e){const e=o.get(s.sharedNodeId);if(!e)continue;const a=s.edgeIds.length,r=[],l=[],d=[];let c=!0;for(let i=0;i<a;i++){const n=t.edges.get(s.edgeIds[i]),a=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=o.get(a);if(!h){c=!1;break}r.push(a),l.push(h),d.push(Math.atan2(h.y-e.y,h.x-e.x))}if(!c)continue;const h=[];for(let t=0;t<a;t++){let e=d[t]-s.originalAngles[t];for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;h.push(e)}const g=r.map(t=>i.has(t)),p=g.filter(Boolean).length;if(p===a)continue;let u=0,_=0;if(p>0)for(let t=0;t<a;t++)g[t]&&(u+=Math.sin(h[t]),_+=Math.cos(h[t]));else for(let t=0;t<a;t++)u+=Math.sin(h[t]),_+=Math.cos(h[t]);const f=Math.atan2(u,_);for(let t=0;t<a;t++){if(g[t])continue;const i=s.originalAngles[t]+f,a=ne(e,l[t]),d={x:e.x+Math.cos(i)*a,y:e.y+Math.sin(i)*a},c=Math.max(Math.abs(d.x-l[t].x),Math.abs(d.y-l[t].y));n=Math.max(n,c),o.set(r[t],d)}}return n}function Ae(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.link_group&&(i.has(e.link_group)||i.set(e.link_group,[]),i.get(e.link_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;let i=0;for(const e of n){const o=t.edges.get(e);i+=ne(t.nodes.get(o.start_node),t.nodes.get(o.end_node))}e.set(o,{edgeIds:n,targetLength:i/n.length})}return e}function ze(t,e,i,o){let n=0;for(const[,s]of e)for(const e of s.edgeIds){const a=t.edges.get(e),r=o.get(a.start_node),l=o.get(a.end_node);if(!r||!l)continue;const d=ne(r,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=de)continue;const c=i.has(a.start_node),h=i.has(a.end_node);if(c&&h)continue;const g=l.x-r.x,p=l.y-r.y,u=s.targetLength/d;if(c){const t={x:r.x+g*u,y:r.y+p*u},e=Math.max(Math.abs(t.x-l.x),Math.abs(t.y-l.y));n=Math.max(n,e),o.set(a.end_node,t)}else if(h){const t={x:l.x-g*u,y:l.y-p*u},e=Math.max(Math.abs(t.x-r.x),Math.abs(t.y-r.y));n=Math.max(n,e),o.set(a.start_node,t)}else{const t=(r.x+l.x)/2,e=(r.y+l.y)/2,i=s.targetLength/2/(d/2),c={x:t-g/2*i,y:e-p/2*i},h={x:t+g/2*i,y:e+p/2*i},u=Math.max(Math.abs(c.x-r.x),Math.abs(c.y-r.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),o.set(a.start_node,c),o.set(a.end_node,h)}}return n}function Ce(t,e,i,o){let n=i,s=o;const a=function(t,e){const i=t.nodeToEdges.get(e);if(!i)return null;for(const{edgeId:e}of i){const i=t.edges.get(e);if(i?.collinear_group)return i.collinear_group}return null}(t,e);if(a){const e=function(t,e){const i=new Set;for(const[,o]of t.edges)o.collinear_group===e&&(i.add(o.start_node),i.add(o.end_node));return i}(t,a),r=[];for(const i of e){const e=t.nodes.get(i);e&&r.push({x:e.x,y:e.y})}if(r.length>=2){const{anchor:t,dir:e}=re(r),a=le({x:i,y:o},t,e);n=a.x,s=a.y}}const r=$e(t),{magnitudes:l}=Ee(t,r),d=$e(t);d.set(e,{x:n,y:s});const c=new Set([e]);for(const[i,o]of t.nodes)o.pinned&&i!==e&&c.add(i);const h=Pe(t,c,d,l),g=h.updates.some(t=>t.nodeId===e);if(!g){const i=t.nodes.get(e);i.x===n&&i.y===s||h.updates.unshift({nodeId:e,x:n,y:s})}const p=h.updates.find(t=>t.nodeId===e);if(p&&(p.x=n,p.y=s),h.updates=h.updates.filter(i=>i.nodeId===e||!t.nodes.get(i.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:e,magnitudes:i}=Ee(t,d),o=[];for(const t of e){const e=l.get(t);if(void 0===e)o.push(t);else{(i.get(t)??0)>e+de&&o.push(t)}}o.length>0&&(h.blocked=!0,h.blockedBy=o)}return h}function Le(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};if(he&&console.log(ge+" solveEdgeLengthChange: %c%s → %scm",pe,ue,ve(o,t.nodes),i.toFixed(1)),o.length_locked)return he&&console.log(ge+" %c→ BLOCKED: edge is length-locked",pe,_e),{updates:[],blocked:!0,blockedBy:[o.id]};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===ne(n,s))return{updates:[],blocked:!1};const a=(n.x+s.x)/2,r=(n.y+s.y)/2,l=function(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return Math.atan2(o.y-i.y,o.x-i.x)}(o,t.nodes),d=i/2,c={x:a-Math.cos(l)*d,y:r-Math.sin(l)*d},h={x:a+Math.cos(l)*d,y:r+Math.sin(l)*d},g=$e(t);g.set(o.start_node,c),g.set(o.end_node,h);const p=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&p.add(e);const u=Pe(t,p,g);return u.updates.some(t=>t.nodeId===o.start_node)||u.updates.unshift({nodeId:o.start_node,x:c.x,y:c.y}),u.updates.some(t=>t.nodeId===o.end_node)||u.updates.push({nodeId:o.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function De(t){const e=new Map;for(const i of t)e.set(i.nodeId,{x:i.x,y:i.y});return e}function Ne(t,e,i,o,n){const s=Ce(xe(t,e),i,o,n);return{positions:De(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function We(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);he&&(console.group(ge+" solveConstraintSnap: %csnap %s → %s",pe,ue,ve(o,t.nodes),i),console.log(`  Nodes: ${me(o.start_node)} ${ye(n)} → ${me(o.end_node)} ${ye(s)}`));const a=function(t,e,i){if("free"===e)return null;const o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,a=(o.y+n.y)/2,r=ne(o,n)/2;if("horizontal"===e){if(Math.round(o.y)===Math.round(n.y))return null;const e=o.x<=n.x;return{nodeUpdates:[{nodeId:t.start_node,x:e?s-r:s+r,y:a},{nodeId:t.end_node,x:e?s+r:s-r,y:a}]}}if("vertical"===e){if(Math.round(o.x)===Math.round(n.x))return null;const e=o.y<=n.y;return{nodeUpdates:[{nodeId:t.start_node,x:s,y:e?a-r:a+r},{nodeId:t.end_node,x:s,y:e?a+r:a-r}]}}return null}(o,i,t.nodes);if(!a)return he&&(console.log(ge+" %cAlready satisfies %s — no-op",pe,fe,i),console.groupEnd()),{updates:[],blocked:!1};const r=$e(t),{magnitudes:l}=Ee(t,r),d=a.nodeUpdates.find(t=>t.nodeId===o.start_node),c=a.nodeUpdates.find(t=>t.nodeId===o.end_node);he&&console.log(`  Snap target: ${me(o.start_node)} ${ye(d)} → ${me(o.end_node)} ${ye(c)}`);const h=$e(t);h.set(o.start_node,{x:d.x,y:d.y}),h.set(o.end_node,{x:c.x,y:c.y});const g=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&g.add(e);const p=Pe(t,g,h,l);return p.updates.some(t=>t.nodeId===o.start_node)||p.updates.unshift({nodeId:o.start_node,x:d.x,y:d.y}),p.updates.some(t=>t.nodeId===o.end_node)||p.updates.push({nodeId:o.end_node,x:c.x,y:c.y}),p.updates=p.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),he&&(p.blocked?console.log(ge+" %c→ SNAP BLOCKED by: %s",pe,_e,(p.blockedBy||[]).map(e=>{const i=t.edges.get(e);return i?ve(i,t.nodes):e.slice(0,8)+"…"}).join(" | ")):console.log(ge+" %c→ Snap OK%c, %d node(s) to update",pe,fe,"",p.updates.length),console.groupEnd()),p}function Re(t){const e=new Map;for(const i of t)e.set(i.id,i);return e}function Te(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return i&&o?{...t,startPos:{x:i.x,y:i.y},endPos:{x:o.x,y:o.y}}:null}function Be(t){const e=Re(t.nodes),i=[];for(const o of t.edges){const t=Te(o,e);t&&i.push(t)}return i}function Oe(t,e){return e.filter(e=>e.start_node===t||e.end_node===t)}function Fe(t,e,i){let o=null,n=i;for(const i of e){const e=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);e<n&&(n=e,o=i)}return o}function Ze(t){let e=0;const i=t.length;for(let o=0;o<i;o++){const n=(o+1)%i;e+=t[o].x*t[n].y,e-=t[n].x*t[o].y}return e/2}function He(t){const e=t.length;if(e<3){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}let i=0,o=0,n=0;for(let s=0;s<e;s++){const a=(s+1)%e,r=t[s].x*t[a].y-t[a].x*t[s].y;i+=r,o+=(t[s].x+t[a].x)*r,n+=(t[s].y+t[a].y)*r}if(i/=2,Math.abs(i)<1e-6){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}const s=1/(6*i);return{x:o*s,y:n*s}}const Ue=kt([]),Ve=kt([]),qe=kt(!1);function je(t){Ue.value=[...Ue.value.slice(-99),t],Ve.value=[]}It(()=>Ue.value.length>0&&!qe.value),It(()=>Ve.value.length>0&&!qe.value);const Ke=85*Math.PI/180;function Ye(t,e,i,o,n,s){const a=n*Math.PI/180,r=s?1:-1,l=Math.cos(a),d=r*Math.sin(a),c=i-t,h=o-e,g=t+l*c-d*h,p=e+d*c+l*h,u=g-t,_=p-e,f=r*(4/3)*Math.tan(a/4);return{ox:g,oy:p,cp1x:i-f*h,cp1y:o+f*c,cp2x:g+f*_,cp2y:p-f*u}}const Xe=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function Ge(t){let e=0;for(let i=0;i<t.length;i++)e=(e<<5)-e+t.charCodeAt(i);return Xe[Math.abs(e)%Xe.length]}class Je extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._spaceHeld=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._iconCache=new Map,this._iconLoaders=new Map,this._stateIconCache=new Map,this._stateIconLoaders=new Map,this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._entitySearch="",this._openingPreview=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,this._zoneEditor=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave=null,this._draggingSimTarget=null,this._simMoveThrottle=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=a`
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

    svg.mode-viewing .door,
    svg.mode-viewing .window {
      fill: none;
      stroke: var(--primary-text-color, #333);
    }

    svg.mode-viewing .window-pane,
    svg.mode-viewing .window-closed-segment {
      fill: none;
      stroke: var(--primary-text-color, #333);
    }

    svg.mode-viewing .door-swing,
    svg.mode-viewing .swing-wedge,
    svg.mode-viewing .window-swing-wedge,
    svg.mode-viewing .door-leaf-panel,
    svg.mode-viewing .window-leaf-panel,
    svg.mode-viewing .hinge-dot,
    svg.mode-viewing .hinge-glow,
    svg.mode-viewing .sliding-arrow {
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

    /* --- Zone / Furniture styles --- */
    .zone-shape {
      transition: fill-opacity 0.2s ease;
      pointer-events: none;
    }

    svg.mode-viewing .zone-shape {
      fill: none;
      fill-opacity: 0;
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
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(Dt(()=>{this._viewBox=Ft.value}),Dt(()=>{const t=Tt.value,e=this._canvasMode;this._canvasMode=t,"occupancy"===e&&"occupancy"!==t&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Dt(()=>{!ee.value&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Dt(()=>{const t=Rt.value;t&&t.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=t.id,requestAnimationFrame(()=>this._fitToFloor(t)))}),Dt(()=>{const t=Xt.value,e=this._focusedRoomId;this._focusedRoomId=t,t&&"__reset__"!==t?requestAnimationFrame(()=>this._animateToRoom(t)):null!==e&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas(),this._onSpaceDown=t=>{"Space"!==t.code||t.repeat||t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.preventDefault(),this._spaceHeld=!0)},this._onSpaceUp=t=>{"Space"===t.code&&(this._spaceHeld=!1,this._isPanning&&(this._isPanning=!1))},window.addEventListener("keydown",this._onSpaceDown),window.addEventListener("keyup",this._onSpaceUp),this._resizeObserver=new ResizeObserver(()=>{const t=Rt.value;t&&this._fitToFloor(t)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),null!==this._swingRaf&&(cancelAnimationFrame(this._swingRaf),this._swingRaf=null),null!==this._blinkTimer&&(clearTimeout(this._blinkTimer),this._blinkTimer=null),this._onSpaceDown&&window.removeEventListener("keydown",this._onSpaceDown),this._onSpaceUp&&window.removeEventListener("keyup",this._onSpaceUp),this._spaceHeld=!1,this._resizeObserver?.disconnect(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault(),this._cancelViewBoxAnimation();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,n=this._viewBox.height*e;if(o<100||o>1e4)return;const s={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:n};Ft.value=s,this._viewBox=s}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Bt.value,o=this._getSnappedPoint(e,"light"===i||"switch"===i||"button"===i||"mmwave"===i||"wall"===i||"zone"===i),n=this._canvasMode;if(this._pendingDevice&&"light"!==Bt.value&&"switch"!==Bt.value&&"button"!==Bt.value&&(this._pendingDevice=null),1===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if(this._spaceHeld&&0===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===n&&0===t.button){if(this._handleSelectClick(e,t.shiftKey))return;return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId)}if("occupancy"===n&&ee.value&&(0===t.button||2===t.button)){const i=te.value,o=this._viewBox,n=.015*Math.max(o.width,o.height),s=i.find(t=>{const i=t.position.x-e.x,o=t.position.y-e.y;return Math.sqrt(i*i+o*o)<n});if(2===t.button&&s)return void this._removeSimulatedTarget(s.id);if(0===t.button&&s)return this._draggingSimTarget={targetId:s.id,pointerId:t.pointerId},void this._svg?.setPointerCapture(t.pointerId);if(0===t.button)return void this._addSimulatedTarget(e)}if(0===t.button)if("select"===i){const i=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null;if(this._handleSelectClick(e,t.shiftKey)){if("zone"===Ot.value.type&&1===Ot.value.ids.length){const i=Rt.value,o=i?.zones?.find(t=>t.id===Ot.value.ids[0]);o?.polygon?.vertices&&(this._draggingZone={zone:o,startPoint:e,originalVertices:o.polygon.vertices.map(t=>({x:t.x,y:t.y})),hasMoved:!1,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId))}else if(("light"===Ot.value.type||"switch"===Ot.value.type||"button"===Ot.value.type||"mmwave"===Ot.value.type)&&1===Ot.value.ids.length){const i=Ot.value.type,o=Ot.value.ids[0];let n=null;n="light"===i?qt.value.find(t=>t.id===o)?.position??null:"switch"===i?jt.value.find(t=>t.id===o)?.position??null:"button"===i?Kt.value.find(t=>t.id===o)?.position??null:Qt.value.find(t=>t.id===o)?.position??null,n&&(this._draggingPlacement={type:i,id:o,startPoint:e,originalPosition:{...n},hasMoved:!1,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId))}}else i&&(Ot.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId)}else if("wall"===i){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:o;this._handleWallClick(e,t.shiftKey)}else"light"===i||"switch"===i||"button"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(o)):"mmwave"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._placeMmwave(o)):"door"===i||"window"===i?this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(i)):"zone"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._handleZonePolyClick(this._cursorPos)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._entitySearch=""}async _placeOpening(t){if(!this.hass||!this._openingPreview)return;const e=Rt.value,i=Wt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,{edgeId:a,t:r,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,g="door"===t?80:100,p=t,u={...l},_={...d},f=c,y={...h};try{const e=await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:a,position:r,new_type:p,width:g,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await ie(),await this._syncRoomsWithEdges();const i=e.edges.map(t=>t.id);je({type:"opening_place",description:`Place ${t}`,undo:async()=>{for(const t of i)try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:t})}catch{}await o.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:_,thickness:f}),await ie(),await this._syncRoomsWithEdges()},redo:async()=>{const e=Rt.value;if(!e)return;const i=Be(e).find(t=>{if("wall"!==t.type)return!1;const e=this._getClosestPointOnSegment(y,t.startPos,t.endPos);return Math.sqrt((e.x-y.x)**2+(e.y-y.y)**2)<5});i&&await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:i.id,position:r,new_type:p,width:g,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await ie(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error placing opening:",t)}}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Bt.value;let o=this._getSnappedPoint(e,"light"===i||"switch"===i||"button"===i||"mmwave"===i||"wall"===i||"zone"===i);if(t.shiftKey&&"wall"===i&&this._wallStartPoint){o=Math.abs(o.x-this._wallStartPoint.x)>=Math.abs(o.y-this._wallStartPoint.y)?{x:o.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:o.y}}if("zone"===i&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints[this._zonePolyPoints.length-1],e=Math.abs(o.x-t.x),i=Math.abs(o.y-t.y),n=15;i<n&&e>n?o={x:o.x,y:t.y}:e<n&&i>n&&(o={x:t.x,y:o.y})}if(this._cursorPos=o,this._draggingSimTarget)return this._moveSimulatedTargetLocal(this._draggingSimTarget.targetId,e),void this._throttledMoveSimTarget(this._draggingSimTarget.targetId,e);if(this._draggingZone){const t=e.x-this._draggingZone.startPoint.x,i=e.y-this._draggingZone.startPoint.y;if(!this._draggingZone.hasMoved&&(Math.abs(t)>3||Math.abs(i)>3)&&(this._draggingZone.hasMoved=!0),this._draggingZone.hasMoved){const e=this._draggingZone.zone;if(e.polygon?.vertices){const o={x:this._draggingZone.originalVertices[0].x+t,y:this._draggingZone.originalVertices[0].y+i},n=Ht.value?se(o,Zt.value):o,s=n.x-o.x,a=n.y-o.y;for(let o=0;o<e.polygon.vertices.length;o++)e.polygon.vertices[o]={x:this._draggingZone.originalVertices[o].x+t+s,y:this._draggingZone.originalVertices[o].y+i+a}}this.requestUpdate()}return}if(this._draggingPlacement){const t=e.x-this._draggingPlacement.startPoint.x,i=e.y-this._draggingPlacement.startPoint.y;if(!this._draggingPlacement.hasMoved&&(Math.abs(t)>3||Math.abs(i)>3)&&(this._draggingPlacement.hasMoved=!0),this._draggingPlacement.hasMoved){const e={x:this._draggingPlacement.originalPosition.x+t,y:this._draggingPlacement.originalPosition.y+i},o=Ht.value?se(e,Zt.value):e,n=this._draggingPlacement;"light"===n.type?qt.value=qt.value.map(t=>t.id===n.id?{...t,position:o}:t):"switch"===n.type?jt.value=jt.value.map(t=>t.id===n.id?{...t,position:o}:t):"button"===n.type?Kt.value=Kt.value.map(t=>t.id===n.id?{...t,position:o}:t):Qt.value=Qt.value.map(t=>t.id===n.id?{...t,position:o}:t),this.requestUpdate()}return}if(this._rotatingMmwave)this._handleMmwaveRotationMove(e);else{if(this._draggingZoneVertex){let t=this._getSnappedPoint(e,!0);const i=this._draggingZoneVertex.zone;if(i.polygon?.vertices){const e=i.polygon.vertices,o=this._draggingZoneVertex.vertexIndex,n=e.length,s=e[(o-1+n)%n],a=e[(o+1)%n],r=15;for(const e of[s,a])Math.abs(t.x-e.x)<r&&(t={x:e.x,y:t.y}),Math.abs(t.y-e.y)<r&&(t={x:t.x,y:e.y});e[o]={x:t.x,y:t.y}}return void this.requestUpdate()}if(this._draggingNode){const i=t.clientX-this._draggingNode.startX,o=t.clientY-this._draggingNode.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};return this._panStart={x:t.clientX,y:t.clientY},Ft.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||"walls"!==this._canvasMode||this._checkNodeHover(e),"zone"===i&&this._zonePolyPoints.length>0&&this.requestUpdate(),"door"!==i&&"window"!==i||this._updateOpeningPreview(e)}}_checkNodeHover(t){const e=Rt.value;if(!e)return void(this._hoveredNode=null);const i=Fe(t,e.nodes,15);this._hoveredNode=i}_updateOpeningPreview(t){const e=Rt.value;if(!e)return void(this._openingPreview=null);const i=Be(e);let o=null,n=30,s=t,a=0;for(const e of i){if("wall"!==e.type)continue;const i=this._getClosestPointOnSegment(t,e.startPos,e.endPos),r=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);if(r<n){n=r,o=e,s=i;const t=e.endPos.x-e.startPos.x,l=e.endPos.y-e.startPos.y,d=t*t+l*l;a=d>0?((i.x-e.startPos.x)*t+(i.y-e.startPos.y)*l)/d:0}}this._openingPreview=o?{edgeId:o.id,position:s,startPos:o.startPos,endPos:o.endPos,thickness:o.thickness,t:a}:null,this.requestUpdate()}_handlePointerUp(t){if(this._draggingSimTarget){const e=this._screenToSvg({x:t.clientX,y:t.clientY});return this._sendSimTargetMove(this._draggingSimTarget.targetId,e),this._svg?.releasePointerCapture(t.pointerId),this._draggingSimTarget=null,void(this._simMoveThrottle&&(clearTimeout(this._simMoveThrottle),this._simMoveThrottle=null))}if(this._rotatingMmwave)return this._finishMmwaveRotation(),void this._svg?.releasePointerCapture(t.pointerId);if(this._draggingPlacement)return this._draggingPlacement.hasMoved&&this._finishPlacementDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingPlacement=null);if(this._draggingZone){if(this._draggingZone.hasMoved)this._finishZoneDrag();else if("occupancy"===this._canvasMode){const t=this._draggingZone.zone,e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name;Gt.value={id:t.id,name:e,type:"zone"},Xt.value=t.id}else{const t=this._draggingZone.zone;this._zoneEditor={zone:t,editName:t.name,editColor:t.color,editAreaId:t.ha_area_id??null}}return this._svg?.releasePointerCapture(t.pointerId),void(this._draggingZone=null)}return this._draggingZoneVertex?(this._finishZoneVertexDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingZoneVertex=null)):this._draggingNode?(this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId)):void(this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId)))}async _handleDblClick(t){if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Rt.value,o=Wt.value;if(!i||!o||!this.hass)return;const n=Fe(e,i.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Be(i);for(const t of s){if(this._pointToSegmentDistance(e,t.startPos,t.endPos)<t.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:o.id,floor_id:i.id,edge_id:t.id,point:{x:e.x,y:e.y}}),await ie(),await this._syncRoomsWithEdges()}catch(t){console.error("Failed to split edge:",t)}return}}}async _handleContextMenu(t){if("occupancy"===this._canvasMode&&ee.value)return void t.preventDefault();if("walls"!==this._canvasMode)return;t.preventDefault();const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Rt.value,o=Wt.value;if(!i||!o||!this.hass)return;const n=Fe(e,i.nodes,15);if(!n)return;if(2===Oe(n.id,i.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:o.id,floor_id:i.id,node_id:n.id}),await ie(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Ot.value={type:"none",ids:[]},this._edgeEditor=null}catch(t){console.error("Failed to dissolve node:",t)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Bt.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=Rt.value,e=Wt.value;if(!t||!e)return void(this._draggingNode=null);const i=this._cursorPos,o=this._draggingNode.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingNode=null);const n=Ce(xe(t.nodes,t.edges),this._draggingNode.node.id,i.x,i.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await ie()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=function(t,e,i=.5){const o=new Map;for(const e of t)o.set(e.id,e);const n=[];for(const t of e){const e=o.get(t.start_node),s=o.get(t.end_node);e&&s&&ne(e,s)<=i&&n.push(t.id)}return n}(t.nodes,t.edges);if(0!==i.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",i.length,i.map(t=>t.slice(0,8)+"…").join(", "));try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o});await ie(),await this._syncRoomsWithEdges()}catch(t){console.error("Error removing degenerate edges:",t)}}}_handleKeyDown(t){if("Escape"===t.key){if(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave){const t=this._rotatingMmwave;Qt.value=Qt.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e),this._rotatingMmwave=null}this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,Ot.value={type:"none",ids:[]},Jt.value=null,Bt.value="select"}else"Backspace"!==t.key&&"Delete"!==t.key||!this._zoneEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||"light"!==Ot.value.type&&"switch"!==Ot.value.type&&"mmwave"!==Ot.value.type?"r"===t.key&&"mmwave"===Ot.value.type?(t.preventDefault(),this._rotateMmwave(t.shiftKey?-15:15)):"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),async function(){const t=Ve.value;if(0===t.length||qe.value)return;const e=t[t.length-1];qe.value=!0;try{await e.redo()}finally{qe.value=!1}Ve.value=t.slice(0,-1),Ue.value=[...Ue.value,e]}()):(t.preventDefault(),async function(){const t=Ue.value;if(0===t.length||qe.value)return;const e=t[t.length-1];qe.value=!0;try{await e.undo()}finally{qe.value=!1}Ue.value=t.slice(0,-1),Ve.value=[...Ve.value,e]}()):(t.preventDefault(),this._deleteSelectedPlacement()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete()):(t.preventDefault(),this._handleZoneDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._edgeEditor.edge,o=parseFloat(this._editingLength);if(isNaN(o)||o<=0)return;const n=Math.abs(o-this._edgeEditor.length)>=.01,s=this._editingDirection!==i.direction,a=this._editingLengthLocked!==i.length_locked,r="door"===i.type||"window"===i.type,l=r&&this._editingOpeningParts!==(i.opening_parts??"single"),d=r&&this._editingOpeningType!==(i.opening_type??"swing"),c=r&&this._editingSwingDirection!==(i.swing_direction??"left"),h=r&&(this._editingEntityId??null)!==(i.entity_id??null),g=s||a||l||d||c||h;try{if(s){if(!await this._applyDirection(i,this._editingDirection))return}if(n&&await this._updateEdgeLength(i,o),g){const o=Rt.value;if(o&&a){const t={};s&&(t.direction=this._editingDirection),a&&(t.length_locked=this._editingLengthLocked);const e=function(t,e,i,o){if(he){const t=Object.entries(o).map(([t,e])=>`${t}=${e}`).join(", ");console.group(ge+" checkConstraintsFeasible: %cedge %s → {%s}",pe,ue,i.slice(0,8)+"…",t)}const n=xe(t,e),s=$e(n),{magnitudes:a}=Ee(n,s),r=e.map(t=>t.id!==i?t:{...t,...void 0!==o.direction&&{direction:o.direction},...void 0!==o.length_locked&&{length_locked:o.length_locked},...void 0!==o.angle_group&&{angle_group:o.angle_group??void 0}}),l=xe(t,r),d=$e(l),c=new Set;for(const[t,e]of l.nodes)e.pinned&&c.add(t);const h=Pe(l,c,d,a);return h.blocked?(he&&(console.log(ge+" %c→ NOT FEASIBLE%c — blocked by: %s",pe,_e,"",(h.blockedBy||[]).map(t=>{const e=l.edges.get(t);return e?ve(e,l.nodes):t.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(he&&(console.log(ge+" %c→ Feasible",pe,fe),console.groupEnd()),{feasible:!0})}(o.nodes,o.edges,i.id,t);if(!e.feasible)return void(e.blockedBy&&this._blinkEdges(e.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id};s&&(n.direction=this._editingDirection),a&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await ie()}}catch(t){console.error("Error applying edge changes:",t)}this._edgeEditor=null,Ot.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Ot.value={type:"none",ids:[]}}async _setDoorOpensToSide(t,e){if(!this.hass)return;if("a"===t)return;const i=Rt.value,o=Wt.value;if(!i||!o)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:o.id,floor_id:i.id,edge_id:e.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await ie();const t=Rt.value;if(t){const i=t.edges.find(t=>t.id===e.id);i&&this._updateEdgeEditorForSelection([i.id])}}catch(t){console.error("Error flipping door side:",t)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this.hass,o=e.id,n=t.id,s=this._edgeEditor.edge,a=Re(t.nodes),r=a.get(s.start_node),l=a.get(s.end_node),d={start:r?{x:r.x,y:r.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await ie(),await this._syncRoomsWithEdges(),je({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await i.callWS({type:"inhabit/edges/add",floor_plan_id:o,floor_id:n,...d});c.id=t.edge.id,await ie(),await this._syncRoomsWithEdges()},redo:async()=>{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await ie(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,Ot.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,i){if(!this.hass)return;const o=Rt.value,n=Wt.value;if(!o||!n)return;const s=this.hass,a=n.id,r=o.id,l=new Map;for(const e of t){const t=o.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await i(),await this._syncRoomsWithEdges();const d=Rt.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:a,floor_id:r,updates:e}),await ie(),await this._syncRoomsWithEdges()};je({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const i=Rt.value,o=Wt.value;if(!i||!o)return;const n=i.edges.map(e=>e.id===t.id?{...e,length_locked:!1}:e),s=Le(xe(i.nodes,n),t.id,e);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await ie()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(t){const e=Rt.value;if(e){const i=this._draggingNode?.node.id,o=Fe(t,i?e.nodes.filter(t=>t.id!==i):e.nodes,15);if(o)return{x:o.x,y:o.y};if(i){const o=new Set(Oe(i,e.edges).map(t=>`${t.start_node}-${t.end_node}`)),n=Be(e);let s=null,a=15;for(const e of n){const i=`${e.start_node}-${e.end_node}`;if(o.has(i))continue;const n=this._getClosestPointOnSegment(t,e.startPos,e.endPos),r=Math.sqrt((t.x-n.x)**2+(t.y-n.y)**2);r<a&&(a=r,s=n)}if(s)return s}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const i=Rt.value;if(!i)return Ht.value?se(t,Zt.value):t;const o=Fe(t,i.nodes,15);if(o)return{x:o.x,y:o.y};if(e){const e=Be(i);let o=null,n=15;for(const i of e){const e=this._getClosestPointOnSegment(t,i.startPos,i.endPos),s=Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));s<n&&(n=s,o=e)}if(o)return o}return Ht.value?se(t,Zt.value):t}_getClosestPointOnSegment(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return e;const a=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s));return{x:e.x+a*o,y:e.y+a*n}}_handleSelectClick(t,e=!1){const i=Rt.value;if(!i)return!1;const o=this._canvasMode;if("walls"===o){const o=Be(i);for(const i of o){if(this._pointToSegmentDistance(t,i.startPos,i.endPos)<i.thickness/2+5){if(e&&"edge"===Ot.value.type){const t=[...Ot.value.ids],e=t.indexOf(i.id);return e>=0?t.splice(e,1):t.push(i.id),Ot.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return Ot.value={type:"edge",ids:[i.id]},this._updateEdgeEditorForSelection([i.id]),!0}}}if("placement"===o||"viewing"===o){for(const e of qt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Ot.value={type:"light",ids:[e.id]},"placement"===o?Jt.value={id:e.id,type:"light"}:this._openEntityDetails(e.entity_id),!0}for(const e of jt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Ot.value={type:"switch",ids:[e.id]},"placement"===o?Jt.value={id:e.id,type:"switch"}:this._openEntityDetails(e.entity_id),!0}for(const e of Kt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Ot.value={type:"button",ids:[e.id]},"placement"===o?Jt.value={id:e.id,type:"button"}:this._openEntityDetails(e.entity_id),!0}for(const e of Qt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Ot.value={type:"mmwave",ids:[e.id]},"placement"===o?Jt.value={id:e.id,type:"mmwave"}:e.entity_id&&this._openEntityDetails(e.entity_id),!0}}if(("furniture"===o||"occupancy"===o)&&i.zones){const e=[...i.zones];for(const i of e)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices)){if("occupancy"===o){Ot.value={type:"zone",ids:[i.id]};const t=i.ha_area_id?this._haAreas.find(t=>t.area_id===i.ha_area_id)?.name??i.name:i.name;return Gt.value={id:i.id,name:t,type:"zone"},Xt.value=i.id,!0}return Ot.value={type:"zone",ids:[i.id]},!0}}if("walls"===o||"occupancy"===o)for(const e of i.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){Ot.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return"occupancy"===o?(Gt.value={id:e.id,name:t,type:"room"},Xt.value=e.id):this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null},!0}return Ot.value={type:"none",ids:[]},Jt.value=null,!1}_updateEdgeEditorForSelection(t){const e=Rt.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const i=Re(e.nodes);if(1===t.length){const o=e.edges.find(e=>e.id===t[0]);if(o){const t=i.get(o.start_node),e=i.get(o.end_node);if(t&&e){const i=this._calculateWallLength(t,e);this._edgeEditor={edge:o,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:i},this._editingLength=Math.round(i).toString(),this._editingLengthLocked=o.length_locked,this._editingDirection=o.direction,this._editingOpeningParts=o.opening_parts??"single",this._editingOpeningType=o.opening_type??"swing",this._editingSwingDirection=o.swing_direction??"left",this._editingEntityId=o.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const o=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t),n=[];for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&n.push({x:e.x,y:e.y}),o&&n.push({x:o.x,y:o.y})}const s=function(t,e=2){if(t.length<2)return!0;if(2===t.length)return!0;let i=0,o=t[0],n=t[1];for(let e=0;e<t.length;e++)for(let s=e+1;s<t.length;s++){const a=ne(t[e],t[s]);a>i&&(i=a,o=t[e],n=t[s])}if(i<1e-9)return!0;const s=n.x-o.x,a=n.y-o.y,r=Math.sqrt(s*s+a*a);for(const i of t)if(Math.abs((i.x-o.x)*a-(i.y-o.y)*s)/r>e)return!1;return!0}(n);let a;if(s){a=0;for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&o&&(a+=this._calculateWallLength(e,o))}this._editingTotalLength=Math.round(a).toString()}this._multiEdgeEditor={edges:o,collinear:s,totalLength:a},this._edgeEditor=null}_pointToSegmentDistance(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const a=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s)),r=e.x+a*o,l=e.y+a*n;return Math.sqrt(Math.pow(t.x-r,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let i="free";if(e){i=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,i);const o=Rt.value,n=o?.nodes.some(e=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1);this._wallChainStart&&Math.abs(t.x-this._wallChainStart.x)<1&&Math.abs(t.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Bt.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=t}else this._wallStartPoint=t,this._wallChainStart=t}async _completeWall(t,e,i="free"){if(!this.hass)return;const o=Rt.value,n=Wt.value;if(!o||!n)return;const s=this.hass,a=n.id,r=o.id,l={id:""};try{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:a,floor_id:r,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await ie(),await this._syncRoomsWithEdges(),je({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:a,floor_id:r,edge_id:l.id}),await ie(),await this._syncRoomsWithEdges()},redo:async()=>{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:a,floor_id:r,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await ie(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.inverse();return{x:i.a*t.x+i.c*t.y+i.e,y:i.b*t.x+i.d*t.y+i.f}}const i=this._svg.getBoundingClientRect(),o=this._viewBox.width/i.width,n=this._viewBox.height/i.height;return{x:this._viewBox.x+(t.x-i.left)*o,y:this._viewBox.y+(t.y-i.top)*n}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(t){const e=Rt.value;if(!e)return;const i=e.rooms.find(e=>e.id===t)??e.zones?.find(e=>e.id===t);if(!i||!i.polygon?.vertices?.length)return;const o=i.polygon.vertices.map(t=>t.x),n=i.polygon.vertices.map(t=>t.y),s=Math.min(...o),a=Math.max(...o),r=Math.min(...n),l=Math.max(...n),d=a-s,c=l-r,h=Gt.value?.3:.15;let g=d+2*(Math.max(d,50)*h),p=c+2*(Math.max(c,50)*h);const u=this._svg?.getBoundingClientRect(),_=u&&u.width>0&&u.height>0?u.width/u.height:1.25;g/p>_?p=g/_:g=p*_;const f=(s+a)/2,y=(r+l)/2;let v=0;if(!!Gt.value&&u&&u.width>0){v=316/u.width*g/2}this._animateViewBox({x:f-g/2+v,y:y-p/2,width:g,height:p},400)}_animateToFloor(){const t=Rt.value;if(!t)return;const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of jt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Kt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),a=Math.max(...i),r=n-o,l=a-s;let d=r+2*(.1*Math.max(r,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),g=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>g?c=d/g:d=c*g;const p=(o+n)/2,u=(s+a)/2;this._animateViewBox({x:p-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(t,e){this._cancelViewBoxAnimation();const i={...this._viewBox},o=performance.now(),n=s=>{const a=s-o,r=Math.min(a/e,1),l=1-Math.pow(1-r,3),d={x:i.x+(t.x-i.x)*l,y:i.y+(t.y-i.y)*l,width:i.width+(t.width-i.width)*l,height:i.height+(t.height-i.height)*l};this._viewBox=d,Ft.value=d,this._viewBoxAnimation=r<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(t){const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of jt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Kt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),a=Math.max(...i),r=n-o,l=a-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=r+2*(.1*Math.max(r,50)),g=l+2*(.1*Math.max(l,50));h/g>c?g=h/c:h=g*c;const p={x:(o+n)/2-h/2,y:(s+a)/2-g/2,width:h,height:g};Ft.value=p,this._viewBox=p}async _addSimulatedTarget(t){if(!this.hass)return;const e=Wt.value,i=Rt.value;if(e&&i)try{const o=await this.hass.callWS({type:"inhabit/simulate/target/add",floor_plan_id:e.id,floor_id:i.id,position:{x:t.x,y:t.y},hitbox:ee.value});te.value=[...te.value,o]}catch(t){console.error("Failed to add simulated target:",t)}}async _removeSimulatedTarget(t){if(this.hass)try{await this.hass.callWS({type:"inhabit/simulate/target/remove",target_id:t}),te.value=te.value.filter(e=>e.id!==t)}catch(t){console.error("Failed to remove simulated target:",t)}}_moveSimulatedTargetLocal(t,e){const i=Rt.value,o=te.value,n=o.findIndex(e=>e.id===t);if(-1===n)return;const s=ee.value&&i?this._getRegionAtPoint(e,i):null,a={...o[n],position:{x:e.x,y:e.y},region_id:s?.id??null,region_name:s?.name??null},r=[...o];r[n]=a,te.value=r}_throttledMoveSimTarget(t,e){this._simMoveThrottle||(this._simMoveThrottle=setTimeout(()=>{this._simMoveThrottle=null,this._sendSimTargetMove(t,e)},66))}async _sendSimTargetMove(t,e){if(this.hass)try{const i=await this.hass.callWS({type:"inhabit/simulate/target/move",target_id:t,position:{x:e.x,y:e.y},hitbox:ee.value}),o=te.value,n=o.findIndex(e=>e.id===t);if(-1!==n){const t=[...o];t[n]=i,te.value=t}}catch{}}_getRegionAtPoint(t,e){if(e.zones)for(const i of e.zones)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};for(const i of e.rooms)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};return null}_renderSimulationLayer(t){const e=te.value,i=ee.value,o=new Set;if(i)for(const t of e)t.region_id&&o.add(t.region_id);const n=this._viewBox,s=Math.max(n.width,n.height)/100,a=.55*s,r=2.8*a,l=1.1*s,d=a+.8*l;return V`
      <defs>
        <filter id="sim-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="${.1*s}" stdDeviation="${.15*s}" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g class="simulation-layer">
        <!-- Room/zone occupation highlights -->
        ${t.rooms.map(t=>o.has(t.id)?V`
          <path d="${oe(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}
        ${(t.zones||[]).map(t=>o.has(t.id)?V`
          <path d="${oe(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}

        <!-- Target markers -->
        ${e.map(t=>{const e=!!t.region_id,i=e?"#4caf50":"#78909c";return V`
            <g class="sim-target" style="cursor: grab;">
              <!-- Pulse ring for detected targets -->
              ${e?V`
                <circle cx="${t.position.x}" cy="${t.position.y}" r="${r}"
                        fill="none" stroke="${i}" stroke-width="${.06*s}"
                        opacity="0.3"/>
              `:null}
              <!-- Dot -->
              <circle cx="${t.position.x}" cy="${t.position.y}" r="${a}"
                      fill="${i}"
                      filter="url(#sim-shadow)"/>
              ${t.region_name?V`
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
    `}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[n],a=e[s];o.y>t.y!=a.y>t.y&&t.x<(a.x-o.x)*(t.y-o.y)/(a.y-o.y)+o.x&&(i=!i)}return i}_pointInOrNearPolygon(t,e,i){if(this._pointInPolygon(t,e))return!0;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[s].x,a=e[s].y,r=e[n].x-o,l=e[n].y-a,d=r*r+l*l;if(0===d){if(Math.hypot(t.x-o,t.y-a)<=i)return!0;continue}const c=Math.max(0,Math.min(1,((t.x-o)*r+(t.y-a)*l)/d)),h=o+c*r,g=a+c*l;if(Math.hypot(t.x-h,t.y-g)<=i)return!0}return!1}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=function(t,e){if(0===e.length)return[];const i=new Map;for(const e of t)i.set(e.id,e);const o=new Map,n=(t,e)=>{const n=i.get(t),s=i.get(e);if(!n||!s)return;if(t===e)return;const a=Math.atan2(s.y-n.y,s.x-n.x);o.has(t)||o.set(t,[]),o.get(t).push({targetId:e,angle:a})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of o)t.sort((t,e)=>t.angle-e.angle);const s=new Set,a=[],r=(t,e)=>`${t}->${e}`;for(const[t,e]of o)for(const n of e){const e=r(t,n.targetId);if(s.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=r(d,c);if(s.has(e)){h=!1;break}s.add(e),l.push(d);const a=i.get(d),g=i.get(c),p=Math.atan2(a.y-g.y,a.x-g.x),u=o.get(c);if(!u||0===u.length){h=!1;break}let _=null;for(const t of u)if(t.angle>p){_=t;break}if(_||(_=u[0]),d=c,c=_.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&a.push(l.map(t=>{const e=i.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of a){const e=Ze(t),i=Math.abs(e);if(i<100)continue;if(e>0)continue;const o=He(t);l.push({vertices:t,area:i,centroid:o})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}(t.nodes,t.edges),o=[...t.rooms],n=new Set;let s=this._getNextRoomNumber(o)-1;for(const a of i){let i=null,r=0;for(const t of o){if(n.has(t.id))continue;const e=t.polygon.vertices,o=a.vertices,s=this._getPolygonCenter(e);if(!s)continue;const l=a.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;e.length===o.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>r&&(r=c,i=t)}if(i){n.add(i.id);if(this._verticesChanged(i.polygon.vertices,a.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,polygon:{vertices:a.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${s}`,polygon:{vertices:a.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of o)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await ie()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let i=0;i<t.length;i++)if(Math.abs(t[i].x-e[i].x)>1||Math.abs(t[i].y-e[i].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const i of t){const t=i.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}_getAssignedHaAreaIds(t){const e=new Set,i=Wt.value;if(!i)return e;for(const o of i.floors){for(const i of o.rooms)i.id!==t?.roomId&&i.ha_area_id&&e.add(i.ha_area_id);for(const i of o.zones)i.id!==t?.zoneId&&i.ha_area_id&&e.add(i.ha_area_id)}return e}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const{room:i,editName:o,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,name:o,color:n,ha_area_id:s}),await ie()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,Ot.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Ot.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await ie()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,Ot.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;const t=this._getAssignedHaAreaIds({roomId:this._roomEditor.room.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._roomEditor?.editAreaId);return U`
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
            ${e.map(t=>U`
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
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(t=>U`
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
    `}_renderEdgeChains(t,e,i=null){const o=Be(t);let n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:t.startPos,endPos:t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}));if(this._draggingNode){const{positions:e,blocked:i,blockedBy:s}=Ne(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);i?s&&this._blinkEdges(s):n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:e.get(t.start_node)??t.startPos,endPos:e.get(t.end_node)??t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}))}const s=function(t){const e=t.filter(t=>"wall"===t.type);if(0===e.length)return[];const i=new Set,o=[];for(const t of e){if(i.has(t.id))continue;const n=[t];i.add(t.id);let s=t.end_node,a=!0;for(;a;){a=!1;for(const t of e)if(!i.has(t.id)){if(t.start_node===s){n.push(t),i.add(t.id),s=t.end_node,a=!0;break}if(t.end_node===s){n.push({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),i.add(t.id),s=t.start_node,a=!0;break}}}let r=t.start_node;for(a=!0;a;){a=!1;for(const t of e)if(!i.has(t.id)){if(t.end_node===r){n.unshift(t),i.add(t.id),r=t.start_node,a=!0;break}if(t.start_node===r){n.unshift({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),i.add(t.id),r=t.end_node,a=!0;break}}}o.push(n)}return o}(n),a="edge"===e.type?n.filter(t=>e.ids.includes(t.id)):[],r=Yt.value.get(t.id),l=r?new Set(r.map(t=>t.edgeId)):new Set,d=n.filter(t=>"door"===t.type||"window"===t.type),c=[];for(const t of s)if(i){let e=[],o=!1;for(const n of t){const t=i.has(n.id);0===e.length?(e.push(n),o=t):t===o?e.push(n):(c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"}),e=[n],o=t)}e.length>0&&c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"})}else c.push({edges:t,dimClass:""});return V`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(t=>V`
        <path class="wall ${t.dimClass}"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,i=[t[0].start];for(const e of t)i.push(e.end);const o=i.length>2&&Math.abs(i[0].x-i[i.length-1].x)<1&&Math.abs(i[0].y-i[i.length-1].y)<1,n=[],s=[];for(let t=0;t<i.length;t++){const a=i[t];let r,l=null,d=null;if(t>0||o){const e=i[t>0?t-1:i.length-2],o=a.x-e.x,n=a.y-e.y,s=Math.sqrt(o*o+n*n);s>0&&(l={x:o/s,y:n/s})}if(t<i.length-1||o){const e=i[t<i.length-1?t+1:1],o=e.x-a.x,n=e.y-a.y,s=Math.sqrt(o*o+n*n);s>0&&(d={x:o/s,y:n/s})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},i=t.x+e.x,o=t.y+e.y,n=Math.sqrt(i*i+o*o);if(n<.01)r=t;else{r={x:i/n,y:o/n};const e=t.x*r.x+t.y*r.y;if(Math.abs(e)>.1){const t=1/e,i=Math.min(Math.abs(t),3)*Math.sign(t);r={x:r.x*i,y:r.y*i}}}}else r=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:a.x+r.x*e,y:a.y+r.y*e}),s.push({x:a.x-r.x*e,y:a.y-r.y*e})}const a=Math.min(.8*e,4);let r=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)if(t<n.length-1&&n.length>2){const e=n[t-1],i=n[t],o=n[t+1],s=i.x-e.x,l=i.y-e.y,d=Math.sqrt(s*s+l*l),c=o.x-i.x,h=o.y-i.y,g=Math.sqrt(c*c+h*h),p=Math.min(a,d/2),u=Math.min(a,g/2);if(d>0&&g>0){const t=i.x-s/d*p,e=i.y-l/d*p,o=i.x+c/g*u,n=i.y+h/g*u;r+=` L${t},${e} Q${i.x},${i.y} ${o},${n}`}else r+=` L${i.x},${i.y}`}else r+=` L${n[t].x},${n[t].y}`;const l=[...s].reverse();if(o){r+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let t=s.length-2;t>=0;t--){const e=s.length-1-t;if(e>0&&e<s.length-1){const e=s[t+1],i=s[t],o=s[t-1],n=i.x-e.x,l=i.y-e.y,d=Math.sqrt(n*n+l*l),c=o.x-i.x,h=o.y-i.y,g=Math.sqrt(c*c+h*h),p=Math.min(a,d/2),u=Math.min(a,g/2);if(d>0&&g>0){const t=i.x-n/d*p,e=i.y-l/d*p,o=i.x+c/g*u,s=i.y+h/g*u;r+=` L${t},${e} Q${i.x},${i.y} ${o},${s}`}else r+=` L${i.x},${i.y}`}else r+=` L${s[t].x},${s[t].y}`}}else for(let t=0;t<l.length;t++)if(t>0&&t<l.length-1&&l.length>2){const e=l[t-1],i=l[t],o=l[t+1],n=i.x-e.x,s=i.y-e.y,d=Math.sqrt(n*n+s*s),c=o.x-i.x,h=o.y-i.y,g=Math.sqrt(c*c+h*h),p=Math.min(a,d/2),u=Math.min(a,g/2);if(d>0&&g>0){const t=i.x-n/d*p,e=i.y-s/d*p,o=i.x+c/g*u,a=i.y+h/g*u;r+=` L${t},${e} Q${i.x},${i.y} ${o},${a}`}else r+=` L${i.x},${i.y}`}else r+=` L${l[t].x},${l[t].y}`;return r+=" Z",r}(t.edges.map(t=>({start:t.startPos,end:t.endPos,thickness:t.thickness})))}"/>
      `)}

      <!-- Door and window openings -->
      ${d.map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness}),o=!!i&&i.has(t.id),n=i?o?"edges-focused":"edges-dimmed":"";let s=0;if(t.entity_id&&this.hass?.states[t.entity_id]){const e=this.hass.states[t.entity_id],i=e.state;if("on"===i||"open"===i){const i="door"===t.type?Ke:Math.PI/2,o=e.attributes.current_position;s=void 0!==o&&o>=0&&o<=100?o/100*i:i}}const a=this._swingAngles.get(t.id)??0;let r=a;const l=s-a;Math.abs(l)>.001?(r=a+.15*l,this._swingAngles.set(t.id,r),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):r!==s&&(r=s,this._swingAngles.set(t.id,s));const d=t.endPos.x-t.startPos.x,c=t.endPos.y-t.startPos.y,h=Math.sqrt(d*d+c*c);if(0===h)return null;const g=d/h,p=c/h,u=-p,_=g,f=t.opening_parts??"single",y=t.opening_type??"swing",v="window"===t.type?"window":"door";if("swing"===y){const e=.5*t.thickness,i=.7*t.thickness,o=1.5,s=(t,o)=>{const n=t.x,s=t.y,a=n+g*o*e,r=s+p*o*e;return`M${n-u*i},${s-_*i}\n                    L${n+u*i},${s+_*i}\n                    L${a+u*i},${r+_*i}\n                    L${a-u*i},${r-_*i} Z`},a=e+o,l={x:t.startPos.x+g*a,y:t.startPos.y+p*a},d={x:t.endPos.x-g*a,y:t.endPos.y-p*a},c=t.swing_direction??"left",y="right"===c?t.endPos:t.startPos,m="right"===c?-1:1,x=y.x+g*m*e+u*(t.thickness/2),w=y.y+p*m*e+_*(t.thickness/2);if("door"===v){const e=t.thickness/2,i=y.x+u*e,o=y.y+_*e,a="right"===c?t.startPos:t.endPos,g=a.x+u*e,p=a.y+_*e,f=Ye(i,o,g,p,85,"left"===c),v=`M${i},${o} L${g},${p} C${f.cp1x},${f.cp1y} ${f.cp2x},${f.cp2y} ${f.ox},${f.oy} Z`,m=Math.cos(r),$=Math.sin(r),b="left"===c?1:-1,k=t=>{const e=t.x-x,i=t.y-w;return{x:x+m*e-b*$*i,y:w+b*$*e+m*i}},E=k(l),P=k(d),M=this._singleEdgePath({start:E,end:P,thickness:t.thickness});return V`
              <g class="${n}">
                ${this._fadedWedge(t.id,v,i,o,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${g},${p} C${f.cp1x},${f.cp1y} ${f.cp2x},${f.cp2y} ${f.ox},${f.oy}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="door-closed-segment" d="${M}"/>
                <circle class="metal-hinge" cx="${x}" cy="${w}" r="2.5"/>
              </g>
            `}const $=t.thickness/2,b=y.x+u*$,k=y.y+_*$,E="right"===c?t.startPos:t.endPos,P=E.x+u*$,M=E.y+_*$,S=b+u*h,I=k+_*h,A=.5522847498,z=P+A*(S-b),C=M+A*(I-k),L=S+A*(P-b),D=I+A*(M-k),N=`M${P},${M} C${z},${C} ${L},${D} ${S},${I}`,W=`M${b},${k} L${P},${M} C${z},${C} ${L},${D} ${S},${I} Z`;if("double"===f){const i=(l.x+d.x)/2,a=(l.y+d.y)/2,c=.5*o,f=(t.startPos.x+t.endPos.x)/2,y=(t.startPos.y+t.endPos.y)/2,v=h/2,m=t.startPos.x+u*$,x=t.startPos.y+_*$,w=t.endPos.x+u*$,b=t.endPos.y+_*$,k=f+u*$,E=y+_*$,P=m+u*v,M=x+_*v,S=w+u*v,I=b+_*v,z=k+A*(P-m),C=E+A*(M-x),L=P+A*(k-m),D=M+A*(E-x),N=k+A*(S-w),W=E+A*(I-b),R=S+A*(k-w),T=I+A*(E-b),B=`M${m},${x} L${k},${E} C${z},${C} ${L},${D} ${P},${M} Z`,O=`M${w},${b} L${k},${E} C${N},${W} ${R},${T} ${S},${I} Z`,F=Math.cos(r),Z=Math.sin(r),H=(t,e,i,o)=>{const n=t.x-e,s=t.y-i;return{x:e+F*n-o*Z*s,y:i+o*Z*n+F*s}},U=t.startPos.x+g*e+u*(t.thickness/2),q=t.startPos.y+p*e+_*(t.thickness/2),j=t.endPos.x-g*e+u*(t.thickness/2),K=t.endPos.y-p*e+_*(t.thickness/2),Y={x:i-g*c,y:a-p*c},X={x:i+g*c,y:a+p*c},G=this._singleEdgePath({start:H(l,U,q,1),end:H(Y,U,q,1),thickness:t.thickness}),J=this._singleEdgePath({start:H(X,j,K,-1),end:H(d,j,K,-1),thickness:t.thickness});return V`
              <g class="${n}">
                ${this._fadedWedge(`${t.id}-l`,B,m,x,v,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${t.id}-r`,O,w,b,v,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${k},${E} C${z},${C} ${L},${D} ${P},${M}"/>
                <path class="door-swing"
                      d="M${k},${E} C${N},${W} ${R},${T} ${S},${I}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="window-closed-segment" d="${G}"/>
                <path class="window-closed-segment" d="${J}"/>
              </g>
            `}const R=Math.cos(r),T=Math.sin(r),B="left"===c?1:-1,O=t=>{const e=t.x-x,i=t.y-w;return{x:x+R*e-B*T*i,y:w+B*T*e+R*i}},F=this._singleEdgePath({start:O(l),end:O(d),thickness:t.thickness});return V`
            <g class="${n}">
              ${this._fadedWedge(t.id,W,b,k,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${N}"/>
              <path class="opening-stop" d="${s(t.startPos,1)}"/>
              <path class="opening-stop" d="${s(t.endPos,-1)}"/>
              <path class="window-closed-segment" d="${F}"/>
            </g>
          `}if("sliding"===y){const i=.3*t.thickness,o=3,s=t.endPos.x+u*i,a=t.endPos.y+_*i,r=t.startPos.x-u*i,l=t.startPos.y-_*i;return V`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
              <line class="door-swing"
                    x1="${t.startPos.x+u*i}" y1="${t.startPos.y+_*i}"
                    x2="${s}" y2="${a}"/>
              <polygon class="sliding-arrow"
                       points="${s},${a} ${s-g*o+u*o*.5},${a-p*o+_*o*.5} ${s-g*o-u*o*.5},${a-p*o-_*o*.5}"/>
              <line class="door-swing"
                    x1="${t.endPos.x-u*i}" y1="${t.endPos.y-_*i}"
                    x2="${r}" y2="${l}"/>
              <polygon class="sliding-arrow"
                       points="${r},${l} ${r+g*o+u*o*.5},${l+p*o+_*o*.5} ${r+g*o-u*o*.5},${l+p*o-_*o*.5}"/>
              ${"window"===v?V`
                <line class="window-pane"
                      x1="${t.startPos.x}" y1="${t.startPos.y}"
                      x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-_*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+_*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-_*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+_*t.thickness/2}"/>
            </g>
          `}if("tilt"===y){const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,s=.25*h;return V`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
              <line class="window-pane"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              <line class="door-swing"
                    x1="${t.startPos.x}" y1="${t.startPos.y}"
                    x2="${i+u*s}" y2="${o+_*s}"/>
              <line class="door-swing"
                    x1="${t.endPos.x}" y1="${t.endPos.y}"
                    x2="${i+u*s}" y2="${o+_*s}"/>
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-_*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+_*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-_*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+_*t.thickness/2}"/>
            </g>
          `}return null})}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${l.size>0?n.filter(t=>l.has(t.id)).map(t=>V`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
        `):null}

      <!-- Selected edge highlights -->
      ${a.map(t=>V`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(t=>{const e=n.find(e=>e.id===t);return e?V`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
        `:null}):null}
    `}_fadedWedge(t,e,i,o,n,s){return V`
      <defs>
        <radialGradient id="wg-${t}" cx="${i}" cy="${o}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path d="${e}" fill="url(#wg-${t})" stroke="none"/>
    `}_singleEdgePath(t){const{start:e,end:i,thickness:o}=t,n=i.x-e.x,s=i.y-e.y,a=Math.sqrt(n*n+s*s);if(0===a)return"";const r=-s/a*(o/2),l=n/a*(o/2);return`M${e.x+r},${e.y+l}\n            L${i.x+r},${i.y+l}\n            L${i.x-r},${i.y-l}\n            L${e.x-r},${e.y-l}\n            Z`}_blinkEdges(t){this._blinkTimer&&clearTimeout(this._blinkTimer);const e=Array.isArray(t)?t:[t];this._blinkingEdgeIds=e;const i=Rt.value;if(i){const t=e.map(t=>{const e=i.edges.find(e=>e.id===t);if(!e)return t.slice(0,8)+"…";const o=i.nodes.find(t=>t.id===e.start_node),n=i.nodes.find(t=>t.id===e.end_node),s=o&&n?Math.sqrt((n.x-o.x)**2+(n.y-o.y)**2).toFixed(1):"?",a=[];return"free"!==e.direction&&a.push(e.direction),e.length_locked&&a.push("len-locked"),e.angle_group&&a.push(`ang:${e.angle_group.slice(0,4)}`),`${t.slice(0,8)}… (${s}cm${a.length?" "+a.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${e.length} blocked edge(s):\n  ${t.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_getRoomEdgeIds(t,e){const i=e.rooms.find(e=>e.id===t);if(!i)return new Set;const o=i.polygon.vertices;if(o.length<2)return new Set;const n=[];for(const t of o){const i=Fe(t,e.nodes,5);i&&n.push(i.id)}if(n.length<2)return new Set;const s=new Map;for(const t of e.edges)s.set(`${t.start_node}|${t.end_node}`,t.id),s.set(`${t.end_node}|${t.start_node}`,t.id);const a=new Set;for(let t=0;t<n.length;t++){const e=n[t],i=n[(t+1)%n.length],o=s.get(`${e}|${i}`);o&&a.add(o)}return a}_renderFloor(){const t=Rt.value;if(!t)return null;const e=Ot.value,i=Vt.value,o=this._focusedRoomId,n=o?this._getRoomEdgeIds(o,t):null,s=i.find(t=>"background"===t.id),a=i.find(t=>"structure"===t.id),r=i.find(t=>"furniture"===t.id),l=i.find(t=>"labels"===t.id),d="furniture"===this._canvasMode&&("zone"===Bt.value||!!this._zoneEditor),c=r?.visible?V`
      <g class="furniture-layer-container" opacity="${r.opacity??1}">
        ${this._renderFurnitureLayer()}
      </g>
    `:null,h=a?.visible?V`
      <g class="structure-layer" opacity="${a.opacity??1}">
        <!-- Edges (rendered as chains for proper corners) -->
        ${this._renderEdgeChains(t,e,n)}
      </g>
    `:null;return V`
      <!-- Background layer -->
      ${s?.visible&&t.background_image?V`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${s.opacity??1}"
               class="${o?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer (rooms) -->
      ${a?.visible?V`
        <g class="structure-layer" opacity="${a.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>V`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""} ${o?t.id===o?"room-focused":"room-dimmed":""}"
                  d="${oe(t.polygon)}"
                  fill="${t.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}
        </g>
      `:null}

      ${d?h:c}
      ${d?c:h}

      <!-- Labels layer -->
      ${l?.visible?V`
        <g class="labels-layer" opacity="${l.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);if(!e)return null;const i=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name,n=!!t.ha_area_id;return V`
              <g class="room-label-group ${o?t.id===o?"label-focused":"label-dimmed":""}" transform="translate(${e.x}, ${e.y})">
                <text class="room-label" x="0" y="0">
                  ${i}
                </text>
                ${n?V`
                  <g class="room-link-icon" transform="translate(${3.8*i.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}
    `}_isDeviceInFocusedRegion(t,e,i,o){if(t===i)return!0;const n=o.zones?.find(t=>t.id===i);if(n?.polygon?.vertices&&this._pointInOrNearPolygon(e,n.polygon.vertices,5))return!0;const s=o.rooms.find(t=>t.id===i);return!(!s||!this._pointInOrNearPolygon(e,s.polygon.vertices,5))}_renderDeviceLayer(t){const e=Vt.value,i=this._focusedRoomId;return e.find(t=>"devices"===t.id)?.visible?V`
      <g class="devices-layer" opacity="${e.find(t=>"devices"===t.id)?.opacity??1}">
        ${qt.value.filter(e=>e.floor_id===t.id).map(e=>V`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderLight(e)}
            </g>
          `)}
        ${jt.value.filter(e=>e.floor_id===t.id).map(e=>V`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderSwitch(e)}
            </g>
          `)}
        ${Kt.value.filter(e=>e.floor_id===t.id).map(e=>V`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderButton(e)}
            </g>
          `)}
        ${this._renderMmwaveLayer(t)}
      </g>
    `:null}_renderDeviceIcon(t,e,i,o,n,s,a,r,l){const d=Ot.value,c=this._getIconData("mdi:devices"),h=l??c,g=h?.viewBox??"0 0 24 24";return V`
      <g class="device-marker ${i?"on":"off"} ${d.type===o&&d.ids.includes(n)?"selected":""}"
         transform="translate(${t}, ${e})">
        <circle r="${14}" fill="${i?a:"#e0e0e0"}" stroke="#333" stroke-width="2"/>
        ${h?.path?V`
          <svg x="${-9}" y="${-9}" width="${18}" height="${18}" viewBox="${g}">
            <path d="${h.path}" fill="${r}"></path>
            ${h.secondaryPath?V`<path d="${h.secondaryPath}" fill="${r}"></path>`:null}
          </svg>
        `:null}
        <text y="${26}" text-anchor="middle" font-size="10" fill="#333">${s}</text>
      </g>
    `}_renderLight(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:lightbulb");return this._renderDeviceIcon(t.position.x,t.position.y,i,"light",t.id,o,"#ffd600",i?"#333":"#616161",n)}_renderSwitch(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:toggle-switch");return this._renderDeviceIcon(t.position.x,t.position.y,i,"switch",t.id,o,"#4caf50",i?"#fff":"#616161",n)}_renderButton(t){const e=this.hass?.states[t.entity_id],i=t.label||e?.attributes.friendly_name||t.entity_id,o=this._getEntityIconData(e,"mdi:gesture-tap-button");return this._renderDeviceIcon(t.position.x,t.position.y,!1,"button",t.id,i,"#2196f3","#616161",o)}_renderMmwaveLayer(t){const e=Qt.value.filter(e=>e.floor_id===t.id);if(0===e.length)return null;const i=Ot.value,o="viewing"!==this._canvasMode;return V`
      <g class="mmwave-layer">
        ${e.map(t=>{const e="mmwave"===i.type&&i.ids.includes(t.id),n=t.field_of_view/2,s=t.detection_range,a=t.position.x,r=t.position.y,l=(t.angle-n)*Math.PI/180,d=(t.angle+n)*Math.PI/180,c=a+s*Math.cos(l),h=r+s*Math.sin(l),g=a+s*Math.cos(d),p=r+s*Math.sin(d),u=t.field_of_view>180?1:0,_=t.angle*Math.PI/180,f=a+30*Math.cos(_),y=r+30*Math.sin(_);return V`
            <g class="mmwave-placement ${e?"selected":""}">
              ${o?V`
                <!-- FOV cone -->
                <path
                  d="M ${a} ${r} L ${c} ${h} A ${s} ${s} 0 ${u} 1 ${g} ${p} Z"
                  fill="rgba(33, 150, 243, 0.1)"
                  stroke="rgba(33, 150, 243, 0.4)"
                  stroke-width="1"
                  stroke-dasharray="4 2"
                />
              `:null}
              <!-- Sensor icon -->
              <circle cx="${a}" cy="${r}" r="8"
                fill="#2196f3" stroke="#fff" stroke-width="2"/>
              <text x="${a}" y="${r+3}" text-anchor="middle"
                font-size="8" fill="#fff" font-weight="bold">R</text>
              ${o&&e?V`
                <!-- Rotation handle -->
                <g class="rotation-handle"
                   data-mmwave-id="${t.id}"
                   @pointerdown=${e=>this._startMmwaveRotation(e,t)}>
                  <line class="rotation-handle-line"
                    x1="${a}" y1="${r}" x2="${f}" y2="${y}" />
                  <circle class="rotation-handle-dot"
                    cx="${f}" cy="${y}" r="4.5" />
                </g>
              `:null}
            </g>
          `})}
      </g>
    `}_renderNodeGuideDots(){const t=Rt.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=t.nodes.filter(t=>e.has(t.id));return 0===i.length?null:V`
      <g class="node-guide-dots">
        ${i.map(t=>V`
          <circle cx="${t.x}" cy="${t.y}" r="4"
            fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        `)}
      </g>
    `}_renderNodeEndpoints(){const t=Rt.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=[];for(const o of t.nodes)o.pinned&&e.has(o.id)&&i.push({node:o,coords:{x:o.x,y:o.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&e.has(this._draggingNode.node.id)){const e=i.findIndex(t=>t.node.id===this._draggingNode.node.id);e>=0&&i.splice(e,1);const{positions:o,blocked:n}=Ne(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:o.get(this._draggingNode.node.id)??this._cursorPos;i.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&e.has(this._hoveredNode.id)&&(i.some(t=>t.node.id===this._hoveredNode.id)||i.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===i.length)return null;return V`
      <g class="wall-endpoints-layer">
        ${i.map(t=>t.isPinned?V`
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
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,{positions:i,blocked:o}=Ne(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y);if(o)return null;const n=Be(t),s=[];for(const t of n){const e=i.get(t.start_node),o=i.get(t.end_node);if(!e&&!o)continue;const n=e??t.startPos,a=o??t.endPos,r=this._calculateWallLength(n,a),l=Math.atan2(a.y-n.y,a.x-n.x);s.push({start:n,end:a,origStart:t.startPos,origEnd:t.endPos,length:r,angle:l,thickness:t.thickness})}const a=[];for(let t=0;t<s.length;t++)for(let i=t+1;i<s.length;i++){const o=Math.abs(s[t].angle-s[i].angle)%Math.PI;Math.abs(o-Math.PI/2)<.02&&a.push({point:e,angle:Math.min(s[t].angle,s[i].angle)})}return V`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:t,origEnd:e,thickness:i})=>{const o=e.x-t.x,n=e.y-t.y,s=Math.sqrt(o*o+n*n);if(0===s)return null;const a=-n/s*(i/2),r=o/s*(i/2);return V`
          <path
            class="wall-original-ghost"
            d="M${t.x+a},${t.y+r}
               L${e.x+a},${e.y+r}
               L${e.x-a},${e.y-r}
               L${t.x-a},${t.y-r}
               Z"
          />
        `})}

      <!-- Edge length labels -->
      ${s.map(({start:t,end:e,length:i})=>{const o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return V`
          <g transform="translate(${o}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${a.map(({point:t,angle:e})=>V`
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
    `}_handleNodePointerDown(t,e){if(2===t.button)return;t.stopPropagation(),t.preventDefault();const i=this._hoveredNode||e;if("wall"===Bt.value){const e={x:i.x,y:i.y};return void this._handleWallClick(e,t.shiftKey)}if(i.pinned)return this._wallStartPoint={x:i.x,y:i.y},Bt.value="wall",void(this._hoveredNode=null);this._draggingNode={node:i,originalCoords:{x:i.x,y:i.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_handleZonePolyClick(t){const e=this._zonePolyPoints;if(e.length>=3){const i=e[0];if(Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2)<15)return this._pendingZonePolygon=[...e],this._zonePolyPoints=[],void this._saveZone("Zone")}this._zonePolyPoints=[...e,t]}async _saveZone(t){if(!this.hass||!this._pendingZonePolygon)return;const e=Rt.value,i=Wt.value;if(e&&i){try{await this.hass.callWS({type:"inhabit/zones/add",floor_plan_id:i.id,floor_id:e.id,name:t,polygon:{vertices:this._pendingZonePolygon.map(t=>({x:t.x,y:t.y}))},color:"#a1c4fd"}),await ie()}catch(t){console.error("Error saving zone:",t)}this._pendingZonePolygon=null}}_renderFurnitureLayer(){const t=Rt.value;if(!t||!t.zones||0===t.zones.length)return null;const e=Ot.value,i=this._focusedRoomId,o=t.zones,n=i?t.rooms.find(t=>t.id===i):null;return V`
      <g class="furniture-layer">
        ${o.map(t=>{if(!t.polygon?.vertices?.length)return null;const o=oe(t.polygon),s="zone"===e.type&&e.ids.includes(t.id),a=this._getPolygonCenter(t.polygon.vertices),r=i&&(t.id===i||t.room_id===i||n&&a&&this._pointInOrNearPolygon(a,n.polygon.vertices,5));return V`
            <g class="${i?r?"":"room-dimmed":""}">
              <path class="zone-shape ${s?"selected":""}"
                    d="${o}"
                    fill="${t.color||"#a1c4fd"}"
                    fill-opacity="0.35"
                    stroke="${t.color||"#a1c4fd"}"
                    stroke-width="1.5"/>
              ${a?V`
                <text class="zone-label" x="${a.x}" y="${a.y}">${t.name}</text>
              `:null}
              ${s&&!this._draggingZone?this._renderZoneVertexHandles(t):null}
            </g>
          `})}
      </g>
    `}_renderZoneVertexHandles(t){const e=t.polygon?.vertices;return e?.length?V`
      ${e.map((e,i)=>V`
        <circle
          class="zone-vertex-handle"
          cx="${e.x}" cy="${e.y}" r="6"
          fill="white" stroke="${t.color||"#2196f3"}" stroke-width="1.5"
          style="cursor: grab"
          @pointerdown=${o=>{o.stopPropagation(),o.preventDefault(),this._draggingZoneVertex={zone:t,vertexIndex:i,originalCoords:{x:e.x,y:e.y},pointerId:o.pointerId},this._svg?.setPointerCapture(o.pointerId)}}
        />
      `)}
    `:null}_renderFurnitureDrawingPreview(){if("zone"===Bt.value&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints,e=this._cursorPos;let i=`M ${t[0].x} ${t[0].y}`;for(let e=1;e<t.length;e++)i+=` L ${t[e].x} ${t[e].y}`;i+=` L ${e.x} ${e.y}`;let o=null;if(t.length>=3){const i=t[0];Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2)<15&&(o=V`<circle cx="${i.x}" cy="${i.y}" r="8" fill="rgba(76, 175, 80, 0.3)" stroke="#4caf50" stroke-width="2"/>`)}return V`
        <g class="furniture-preview">
          <path class="furniture-poly-preview" d="${i}"/>
          ${t.map(t=>V`
            <circle cx="${t.x}" cy="${t.y}" r="4" fill="var(--primary-color, #2196f3)" stroke="white" stroke-width="1.5"/>
          `)}
          ${o}
        </g>
      `}return null}_renderZoneEditor(){if(!this._zoneEditor)return null;const t=this._getAssignedHaAreaIds({zoneId:this._zoneEditor.zone.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._zoneEditor?.editAreaId);return U`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Zone</span>
          <button class="wall-editor-close" @click=${()=>{this._zoneEditor=null,Ot.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Area</span>
          <select class="wall-editor-select"
            .value=${this._zoneEditor.editAreaId??""}
            @change=${t=>{if(!this._zoneEditor)return;const e=t.target.value,i=this._haAreas.find(t=>t.area_id===e);this._zoneEditor={...this._zoneEditor,editAreaId:e||null,editName:i?i.name:this._zoneEditor.editName}}}
          >
            <option value="">None</option>
            ${e.map(t=>U`
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
            @keydown=${t=>{"Enter"===t.key?this._handleZoneEditorSave():"Escape"===t.key&&(this._zoneEditor=null,Ot.value={type:"none",ids:[]})}}
          />
        </div>

        ${this._zoneEditor.zone.polygon?.vertices?.length?U`
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
            ${["#a1c4fd","#c5e1a5","#ffe0b2","#d1c4e9","#ffccbc","#b0bec5","#e0e0e0","#f8bbd0"].map(t=>U`
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
    `}_getZoneBBoxWidth(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.x);return Math.round(Math.max(...t)-Math.min(...t))}_getZoneBBoxHeight(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.y);return Math.round(Math.max(...t)-Math.min(...t))}_handleZoneSizeChange(t,e){if(!this._zoneEditor||!this.hass||e<=0)return;const i=this._zoneEditor.zone,o=i.polygon?.vertices;if(!o?.length)return;const n=o.map(t=>t.x),s=o.map(t=>t.y),a=Math.min(...n),r=Math.max(...n),l=Math.min(...s),d=Math.max(...s),c=(a+r)/2,h=(l+d)/2,g=r-a,p=d-l;if(0===g||0===p)return;const u="width"===t?e/g:1,_="height"===t?e/p:1,f=o.map(t=>({x:c+(t.x-c)*u,y:h+(t.y-h)*_}));for(let t=0;t<o.length;t++)o[t]=f[t];this.requestUpdate();const y=Wt.value;y&&this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:y.id,zone_id:i.id,polygon:{vertices:f.map(t=>({x:t.x,y:t.y}))}}).then(()=>ie()).catch(t=>console.error("Error resizing zone:",t))}async _handleZoneEditorSave(){if(!this._zoneEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id,name:this._zoneEditor.editName,color:this._zoneEditor.editColor,ha_area_id:this._zoneEditor.editAreaId??""}),await ie()}catch(t){console.error("Error updating zone:",t)}this._zoneEditor=null,Ot.value={type:"none",ids:[]}}}async _handleZoneDelete(){if(!this._zoneEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/delete",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id}),await ie()}catch(t){console.error("Error deleting zone:",t)}this._zoneEditor=null,Ot.value={type:"none",ids:[]}}}async _finishZoneDrag(){if(!this._draggingZone||!this.hass)return;const t=Wt.value;if(!t)return;const e=this._draggingZone.zone;if(e.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:e.id,polygon:{vertices:e.polygon.vertices.map(t=>({x:t.x,y:t.y}))}}),await ie()}catch(t){if(console.error("Error moving zone:",t),e.polygon?.vertices&&this._draggingZone.originalVertices)for(let t=0;t<e.polygon.vertices.length;t++)e.polygon.vertices[t]=this._draggingZone.originalVertices[t]}}async _finishZoneVertexDrag(){if(!this._draggingZoneVertex||!this.hass)return;const t=Wt.value;if(!t)return;const e=this._draggingZoneVertex.zone;if(e.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:e.id,polygon:{vertices:e.polygon.vertices.map(t=>({x:t.x,y:t.y}))}}),await ie()}catch(t){console.error("Error moving zone vertex:",t),e.polygon?.vertices&&this._draggingZoneVertex&&(e.polygon.vertices[this._draggingZoneVertex.vertexIndex]=this._draggingZoneVertex.originalCoords)}}_renderDrawingPreview(){if("wall"===Bt.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,i=this._calculateWallLength(t,e),o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),a=s>90||s<-90?s+180:s;return V`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${t.x}" y1="${t.y}"
                x2="${e.x}" y2="${e.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${o}, ${n}) rotate(${a})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const t=Bt.value;if("door"!==t&&"window"!==t)return null;const{position:e,startPos:i,endPos:o,thickness:n}=this._openingPreview,s="door"===t?80:100,a=o.x-i.x,r=o.y-i.y,l=Math.sqrt(a*a+r*r);if(0===l)return null;const d=a/l,c=r/l,h=-c,g=d,p=s/2,u=n/2,_=e.x,f=e.y,y=`M${_-d*p+h*u},${f-c*p+g*u}\n                      L${_+d*p+h*u},${f+c*p+g*u}\n                      L${_+d*p-h*u},${f+c*p-g*u}\n                      L${_-d*p-h*u},${f-c*p-g*u}\n                      Z`;if("window"===t)return V`
        <g class="opening-ghost">
          <path class="window" d="${y}"/>
          <line class="window-pane"
                x1="${_}" y1="${f}"
                x2="${_+h*n}" y2="${f+g*n}"/>
        </g>
      `;const v=_-d*p,m=f-c*p,x=_+d*p,w=f+c*p,$=Ye(v,m,x,w,85,!0),b=$.ox-v,k=$.oy-m,E=Math.sqrt(b*b+k*k),P=E>0?-k/E*1.25:0,M=E>0?b/E*1.25:0,S=`M${v+P},${m+M} L${$.ox+P},${$.oy+M} L${$.ox-P},${$.oy-M} L${v-P},${m-M} Z`,I=`M${v},${m} L${x},${w} C${$.cp1x},${$.cp1y} ${$.cp2x},${$.cp2y} ${$.ox},${$.oy} Z`,A=_-d*p,z=f-c*p,C=_+d*p,L=f+c*p;return V`
      <g class="opening-ghost">
        <path class="door" d="${y}"/>
        <path class="swing-wedge" d="${I}"/>
        <path class="door-leaf-panel" d="${S}"/>
        <path class="door-swing"
              d="M${x},${w} C${$.cp1x},${$.cp1y} ${$.cp2x},${$.cp2y} ${$.ox},${$.oy}"/>
        <line class="door-jamb" x1="${A-h*u}" y1="${z-g*u}" x2="${A+h*u}" y2="${z+g*u}"/>
        <line class="door-jamb" x1="${C-h*u}" y1="${L-g*u}" x2="${C+h*u}" y2="${L+g*u}"/>
        <circle class="hinge-glow" cx="${v}" cy="${m}" r="5"/>
        <circle class="hinge-dot" cx="${v}" cy="${m}" r="3"/>
      </g>
    `}_getPolygonCenter(t){if(0===t.length)return null;if(t.length<3){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}let e=0,i=0,o=0;const n=t.length;for(let s=0;s<n;s++){const a=(s+1)%n,r=t[s].x*t[a].y-t[a].x*t[s].y;e+=r,i+=(t[s].x+t[a].x)*r,o+=(t[s].y+t[a].y)*r}if(e/=2,Math.abs(e)<1e-6){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/n,y:i/n}}const s=1/(6*e);return{x:i*s,y:o*s}}_svgToScreen(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.a*t.x+e.c*t.y+e.e,o=e.b*t.x+e.d*t.y+e.f,n=this._svg.getBoundingClientRect();return{x:i-n.left,y:o-n.top}}const i=this._svg.getBoundingClientRect(),o=i.width/this._viewBox.width,n=i.height/this._viewBox.height;return{x:(t.x-this._viewBox.x)*o,y:(t.y-this._viewBox.y)*n}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const t=this._edgeEditor.edge,e="door"===t.type,i="window"===t.type,o=e||i;return U`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e?"Door Properties":i?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t.link_group?(()=>{const e=Rt.value,i=t.link_group,o=e?e.edges.filter(t=>t.link_group===i).length:0;return U`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ge(i)};">
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

        ${t.collinear_group?(()=>{const e=Rt.value,i=t.collinear_group,o=e?e.edges.filter(t=>t.collinear_group===i).length:0;return U`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ge(i)};">
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

        ${o?(()=>{const e=Rt.value;if(!e)return null;const i=Re(e.nodes),o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,a=(o.y+n.y)/2,r=n.x-o.x,l=n.y-o.y,d=Math.sqrt(r*r+l*l);if(0===d)return null;const c=-l/d,h=r/d,g=t.thickness/2+5,p={x:s+c*g,y:a+h*g},u={x:s-c*g,y:a-h*g},_=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(p,t.polygon.vertices)),f=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(u,t.polygon.vertices)),y=_?.name||(t.is_exterior?"Outside":null),v=f?.name||(t.is_exterior?"Outside":null);return y||v?U`
            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Opens into</span>
              <div class="wall-editor-row" style="gap:6px; font-size:12px; align-items:center;">
                <button
                  class="room-side-btn active"
                  style="background:${_?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("a",t)}
                >${y??"—"}</button>
                <ha-icon icon="mdi:door-open" style="--mdc-icon-size:14px; color:var(--secondary-text-color, #888);"></ha-icon>
                <button
                  class="room-side-btn"
                  style="background:${f?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("b",t)}
                >${v??"—"}</button>
              </div>
            </div>
          `:null})():null}

        ${o?(()=>{const t=e?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],i="swing"===this._editingOpeningType,o="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return U`
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
                ${t.map(t=>U`
                  <button
                    class="constraint-btn ${this._editingOpeningType===t.value?"active":""}"
                    @click=${()=>{this._editingOpeningType=t.value}}
                  >${t.label}</button>
                `)}
              </div>
            </div>

            ${i?U`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===o.length?U`
                    <button class="constraint-btn active">${o[0].label}</button>
                  `:o.map(t=>U`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===t.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=t.value}}
                    >${t.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${o?U`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const t=this.hass?.states[this._editingEntityId],e=t?.attributes.friendly_name||this._editingEntityId,i=t?.attributes.icon||"mdi:radiobox-marked";return U`
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
              `})():this._openingSensorPickerOpen?U`
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
                  ${this._getOpeningSensorEntities().map(t=>U`
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
            `:U`
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
            ${o?null:U`
              <button
                class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
                @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
                title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
              ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
            `}
          </div>
        </div>

        ${t.angle_group?(()=>{const e=Rt.value,i=t.angle_group,o=e?e.edges.filter(t=>t.angle_group===i).length:0;return U`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Ge(i)};">
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

        ${o?null:U`
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
    `}async _applyDirection(t,e){if(!this.hass)return!1;const i=Rt.value,o=Wt.value;if(!i||!o)return!1;const n=i.edges.map(e=>e.id===t.id?{...e,direction:"free",length_locked:!1,angle_group:void 0}:e),s=We(xe(i.nodes,n),t.id,e);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await ie(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const t=this._nodeEditor.node,e=Rt.value,i=e?Oe(t.id,e.edges).length:0;return U`
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
          ${2===i?U`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(o)&&!isNaN(n))try{const s=Ce(xe(t.nodes,t.edges),i.id,o,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await ie(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error updating node position:",t),alert(`Failed to update node: ${t}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=!i.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:[{node_id:i.id,x:i.x,y:i.y,pinned:o}]}),await ie(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error toggling node pin:",t),alert(`Failed to toggle pin: ${t}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(t&&e)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:e.id,floor_id:t.id,node_id:this._nodeEditor.node.id}),await ie(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(t){console.error("Failed to dissolve node:",t),alert(`Failed to dissolve node: ${t}`)}}_refreshNodeEditor(t){const e=Rt.value;if(e){const i=e.nodes.find(e=>e.id===t);i&&(this._nodeEditor={node:i,editX:Math.round(i.x).toString(),editY:Math.round(i.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const t=["binary_sensor","cover"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));const i=Rt.value,o=this._edgeEditor?.edge.id;if(i){const t=new Set(i.edges.filter(t=>t.entity_id&&t.id!==o).map(t=>t.entity_id));e=e.filter(e=>!t.has(e.entity_id))}if(this._openingSensorSearch){const t=this._openingSensorSearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getFilteredEntities(){if(!this.hass)return[];const t=Bt.value,e="light"===t?"light":"switch"===t?"switch":"button"===t?"button":null;if(!e)return[];let i=Object.values(this.hass.states).filter(t=>t.entity_id.startsWith(e+"."));if(this._entitySearch){const t=this._entitySearch.toLowerCase();i=i.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return i.slice(0,30)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return"light"===e?t.attributes.icon||"mdi:lightbulb":"switch"===e?t.attributes.icon||"mdi:toggle-switch":t.attributes.icon||"mdi:devices"}_getEntityIconData(t,e){if(!t)return this._getIconData(e);const i=this.hass,o=i?.entities?.[t.entity_id]?.icon,n=t.attributes.icon;if(o||n)return this._getIconData(o??n??e);const s=this._getStateIconCacheKey(t),a=this._stateIconCache.get(s);return a||(this._queueStateIconLoad(t,s),this._getIconData(e))}_openEntityDetails(t){this.hass&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}_getStateIconCacheKey(t){const e=t.attributes.device_class;return`${t.entity_id}:${t.state}:${e??""}`}_queueStateIconLoad(t,e){if(this._stateIconLoaders.has(e))return;const i=this._loadStateIcon(t,e).catch(e=>{console.warn("Failed to load state icon",t.entity_id,e)}).finally(()=>{this._stateIconLoaders.delete(e)});this._stateIconLoaders.set(e,i)}async _ensureHaStateIconDefined(){if(customElements.get("ha-state-icon"))return;await this._ensureHaIconDefined();const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-state-icon.js","/frontend_es5/ha-state-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-state-icon module",i,t)}if(customElements.get("ha-state-icon"))break}customElements.get("ha-state-icon")&&await customElements.whenDefined("ha-state-icon")}async _loadStateIcon(t,e){if(!this.hass)return;if(await this._ensureHaStateIconDefined(),!customElements.get("ha-state-icon"))return;const i=document.createElement("ha-state-icon");i.hass=this.hass,i.stateObj=t,i.style.display="none";const o=this.isConnected?this:document.body;o?.appendChild(i);try{i.updateComplete&&await i.updateComplete;let t=null;for(let e=0;e<20;e++){const e=i.shadowRoot?.querySelector("ha-svg-icon");if(e?.path){t={path:e.path,secondaryPath:e.secondaryPath,viewBox:e.viewBox};break}const o=i.shadowRoot?.querySelector("ha-icon"),n=o?.shadowRoot?.querySelector("ha-svg-icon");if(n?.path){t={path:n.path,secondaryPath:n.secondaryPath,viewBox:n.viewBox};break}await new Promise(t=>setTimeout(t,50))}t&&(this._stateIconCache.set(e,t),this.requestUpdate())}finally{i.remove()}}_getIconData(t){const e=this._iconCache.get(t);if(e)return e;this._queueIconLoad(t)}_queueIconLoad(t){if(this._iconLoaders.has(t))return;const e=this._loadIcon(t).catch(e=>{console.warn("Failed to load icon",t,e)}).finally(()=>{this._iconLoaders.delete(t)});this._iconLoaders.set(t,e)}async _ensureHaIconDefined(){if(customElements.get("ha-icon"))return;const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-icon.js","/frontend_es5/ha-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-icon module",i,t)}if(customElements.get("ha-icon"))break}customElements.get("ha-icon")&&await customElements.whenDefined("ha-icon")}async _loadIcon(t){if(await this._ensureHaIconDefined(),!customElements.get("ha-icon"))return;const e=document.createElement("ha-icon");e.icon=t,e.style.display="none";const i=this.isConnected?this:document.body;i?.appendChild(e);try{e.updateComplete&&await e.updateComplete;let i=null;for(let t=0;t<10;t++){const t=e.shadowRoot?.querySelector("ha-svg-icon");if(t?.path){i={path:t.path,secondaryPath:t.secondaryPath,viewBox:t.viewBox};break}await new Promise(t=>setTimeout(t,50))}i&&(this._iconCache.set(t,i),this.requestUpdate())}finally{e.remove()}}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=Rt.value,i=Wt.value;if(!e||!i)return;const o=Bt.value,n="light"===o?"inhabit/lights/place":"button"===o?"inhabit/buttons/place":"inhabit/switches/place",s="light"===o?"inhabit/lights/remove":"button"===o?"inhabit/buttons/remove":"inhabit/switches/remove",a="light"===o?"light_id":"button"===o?"button_id":"switch_id",r=this.hass,l=i.id,d=e.id,c={...this._pendingDevice.position},h={id:""};try{const e=await r.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await ie(),je({type:`${o}_place`,description:`Place ${o}`,undo:async()=>{await r.callWS({type:s,[a]:h.id}),await ie()},redo:async()=>{const e=await r.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await ie()}})}catch(t){console.error(`Error placing ${o}:`,t),alert(`Failed to place ${o}: ${t}`)}this._pendingDevice=null}async _placeMmwave(t){if(!this.hass)return;const e=Rt.value,i=Wt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,a={...t},r={id:""};try{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:a,angle:0,field_of_view:120,detection_range:500});r.id=t.id,await ie(),je({type:"mmwave_place",description:"Place mmWave sensor",undo:async()=>{await o.callWS({type:"inhabit/mmwave/delete",placement_id:r.id}),await ie()},redo:async()=>{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:a,angle:0,field_of_view:120,detection_range:500});r.id=t.id,await ie()}})}catch(t){console.error("Error placing mmWave sensor:",t),alert(`Failed to place mmWave sensor: ${t}`)}}async _finishPlacementDrag(){if(!this.hass||!this._draggingPlacement)return;const t=this._draggingPlacement,e=this.hass;if(!Wt.value)return;let i;if(i="light"===t.type?qt.value.find(e=>e.id===t.id)?.position:"switch"===t.type?jt.value.find(e=>e.id===t.id)?.position:"button"===t.type?Kt.value.find(e=>e.id===t.id)?.position:Qt.value.find(e=>e.id===t.id)?.position,!i)return;const o={...i},n={...t.originalPosition};try{"light"===t.type?await e.callWS({type:"inhabit/lights/update",light_id:t.id,position:o}):"switch"===t.type?await e.callWS({type:"inhabit/switches/update",switch_id:t.id,position:o}):"button"===t.type?await e.callWS({type:"inhabit/buttons/update",button_id:t.id,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:t.id,position:o});const i=t.type,s=t.id;je({type:`${i}_move`,description:`Move ${i}`,undo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:n}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:n}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:n}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:n}),await ie()},redo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:o}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:o}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:o}),await ie()}})}catch(e){console.error(`Error moving ${t.type}:`,e),await ie()}}async _deleteSelectedPlacement(){if(!this.hass)return;const t=Ot.value;if(1!==t.ids.length)return;const e=this.hass;if(!Wt.value)return;const i=t.ids[0];try{if("light"===t.type)await e.callWS({type:"inhabit/lights/remove",light_id:i}),qt.value=qt.value.filter(t=>t.id!==i);else if("switch"===t.type)await e.callWS({type:"inhabit/switches/remove",switch_id:i}),jt.value=jt.value.filter(t=>t.id!==i);else if("button"===t.type)await e.callWS({type:"inhabit/buttons/remove",button_id:i}),Kt.value=Kt.value.filter(t=>t.id!==i);else{if("mmwave"!==t.type)return;await e.callWS({type:"inhabit/mmwave/delete",placement_id:i}),Qt.value=Qt.value.filter(t=>t.id!==i)}Ot.value={type:"none",ids:[]}}catch(t){console.error("Error deleting placement:",t)}}async _rotateMmwave(t){if(!this.hass)return;const e=Ot.value;if("mmwave"!==e.type||1!==e.ids.length)return;const i=e.ids[0],o=Qt.value.find(t=>t.id===i);if(!o)return;const n=(o.angle+t+360)%360;try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:i,angle:n}),Qt.value=Qt.value.map(t=>t.id===i?{...t,angle:n}:t)}catch(t){console.error("Error rotating mmWave:",t)}}_startMmwaveRotation(t,e){t.stopPropagation(),t.preventDefault(),this._rotatingMmwave={id:e.id,originalAngle:e.angle,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId)}_handleMmwaveRotationMove(t){if(!this._rotatingMmwave)return;const e=Qt.value.find(t=>t.id===this._rotatingMmwave.id);if(!e)return;const i=t.x-e.position.x,o=t.y-e.position.y;let n=180*Math.atan2(o,i)/Math.PI;n=(n%360+360)%360,n=15*Math.round(n/15),Qt.value=Qt.value.map(t=>t.id===this._rotatingMmwave.id?{...t,angle:n}:t)}async _finishMmwaveRotation(){if(!this._rotatingMmwave||!this.hass)return;const t=this._rotatingMmwave,e=Qt.value.find(e=>e.id===t.id);if(!e)return void(this._rotatingMmwave=null);const i=e.angle;if(i!==t.originalAngle){try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:t.id,angle:i})}catch(e){console.error("Error committing mmWave rotation:",e),Qt.value=Qt.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e)}this._rotatingMmwave=null}else this._rotatingMmwave=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const t=this._svgToScreen(this._pendingDevice.position),e=this._getFilteredEntities();return U`
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
          ${e.map(t=>U`
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
    `}render(){const t=this._canvasMode,e=[this._isPanning?"panning":"",this._spaceHeld?"space-pan":"","select"===Bt.value?"select-tool":"","viewing"===t?"view-mode":"",`mode-${t}`].filter(Boolean).join(" ");return U`
      <svg
        class="${e}"
        viewBox="${i=this._viewBox,`${i.x} ${i.y} ${i.width} ${i.height}`}"
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
        ${"furniture"===t&&"zone"===Bt.value?this._renderNodeGuideDots():null}
        ${Rt.value?this._renderDeviceLayer(Rt.value):null}
        ${"viewing"!==t&&"occupancy"!==t?this._renderDrawingPreview():null}
        ${"furniture"===t?this._renderFurnitureDrawingPreview():null}
        ${"walls"===t?this._renderOpeningPreview():null}
        ${"placement"===t?this._renderDevicePreview():null}
        ${"occupancy"===t&&ee.value&&Rt.value?this._renderSimulationLayer(Rt.value):null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"occupancy"!==t?this._renderZoneEditor():null}
      ${"placement"===t?this._renderEntityPicker():null}
    `;var i}_getVisibleAnnotationEdgeIds(){const t=Ot.value;if("edge"!==t.type||0===t.ids.length)return null;const e=Rt.value;if(!e)return null;const i=new Set(t.ids),o=e.edges.filter(e=>t.ids.includes(e.id)),n=new Set,s=new Set,a=new Set;for(const t of o)t.link_group&&n.add(t.link_group),t.collinear_group&&s.add(t.collinear_group),t.angle_group&&a.add(t.angle_group);for(const t of e.edges)i.has(t.id)||(t.link_group&&n.has(t.link_group)&&i.add(t.id),t.collinear_group&&s.has(t.collinear_group)&&i.add(t.id),t.angle_group&&a.has(t.angle_group)&&i.add(t.id));return i}_renderEdgeAnnotations(){const t=Rt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Be(t);return V`
      <g class="wall-annotations-layer">
        ${i.map(t=>{if(!e.has(t.id))return null;const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,n=this._calculateWallLength(t.startPos,t.endPos),s=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),a=s>90||s<-90?s+180:s,r=[];t.length_locked&&r.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===t.direction&&r.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===t.direction&&r.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),g=-(t.thickness/2+6);return V`
            <g transform="translate(${i}, ${o}) rotate(${a})">
              ${t.link_group?V`
                <circle cx="${h}" cy="${g-1}" r="3.5"
                  fill="${Ge(t.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${t.collinear_group?V`
                <g transform="translate(${h-(t.link_group?10:0)}, ${g-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${Ge(t.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              `:null}
              <text class="wall-annotation-text" x="0" y="${g}">${l}</text>
              ${r.map((t,e)=>V`
                <g transform="translate(${c+e*d}, ${g}) rotate(${-a}) scale(${.35})">
                  <path d="${t}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `})}
      </g>
    `}_renderAngleConstraints(){const t=Rt.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Re(t.nodes),o=new Map;for(const e of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e));for(const[t,i]of o)i.some(t=>e.has(t.id))||o.delete(t);const n=[];for(const[,t]of o){if(2!==t.length)continue;const e=new Set([t[0].start_node,t[0].end_node]),o=new Set([t[1].start_node,t[1].end_node]);let s=null;for(const t of e)if(o.has(t)){s=t;break}if(!s)continue;const a=s,r=i.get(a);if(!r)continue;const l=[];for(const e of t){const t=e.start_node===a?e.end_node:e.start_node,o=i.get(t);o&&l.push(Math.atan2(o.y-r.y,o.x-r.x))}if(l.length<2)continue;l.sort((t,e)=>t-e);const d=l.length;for(let t=0;t<d;t++){const e=l[t],i=l[(t+1)%d],o=(i-e+2*Math.PI)%(2*Math.PI);if(Math.PI-o<.01)continue;const s=e+Math.PI,a=i+Math.PI,c=(a-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:r.x,y:r.y,angle1:a,angle2:a+(2*Math.PI-c)}):n.push({x:r.x,y:r.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return V`
      <g class="angle-constraints-layer">
        ${n.map(t=>{const e=t.angle1,i=t.angle2,o=i-e,n=180*o/Math.PI;if(n>85&&n<95){const n=.7*s,a=t.x+n*Math.cos(e),r=t.y+n*Math.sin(e),l=t.x+n*Math.cos(i),d=t.y+n*Math.sin(i),c=(e+i)/2,h=n/Math.cos(o/2),g=t.x+h*Math.cos(c),p=t.y+h*Math.sin(c);return V`
              <path d="M${a},${r} L${g},${p} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const a=t.x+s*Math.cos(e),r=t.y+s*Math.sin(e),l=t.x+s*Math.cos(i),d=t.y+s*Math.sin(i),c=o>Math.PI?1:0;return V`
            <path d="M${a},${r} A${s},${s} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const t=this._multiEdgeEditor.edges,e=this._multiEdgeEditor.collinear??!1;return U`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Ot.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e?U`
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
            ${(()=>{const e=t.map(t=>t.angle_group).filter(Boolean);if(e.length===t.length&&1===new Set(e).size)return U`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===t.length&&(()=>{const e=new Set([t[0].start_node,t[0].end_node]);return e.has(t[1].start_node)||e.has(t[1].end_node)})()?U`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:U`<button
                class="constraint-btn"
                disabled
                title="${2!==t.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const e=t.map(t=>t.link_group).filter(Boolean);return e.length===t.length&&1===new Set(e).size?U`<button
                  class="constraint-btn active"
                  @click=${()=>this._unlinkEdges()}
                  title="Unlink these walls"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon> Unlink</button>`:U`<button
                class="constraint-btn"
                @click=${()=>this._linkEdges()}
                title="Link these walls so property changes propagate"
              ><ha-icon icon="mdi:link-variant"></ha-icon> Link</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Collinear Link</span>
          <div class="wall-editor-row">
            ${(()=>{const i=t.map(t=>t.collinear_group).filter(Boolean);return i.length===t.length&&1===new Set(i).size?U`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:e?U`<button
                  class="constraint-btn"
                  @click=${()=>this._collinearLinkEdges()}
                  title="Constrain walls to stay on the same line"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Link Collinear</button>`:U`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error angle linking edges:",t)}}async _angleUnlinkEdges(){if(!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error angle unlinking edges:",t)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}}catch(t){console.error("Error linking edges:",t)}}async _unlinkEdges(){if(!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error unlinking edges:",t)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=parseFloat(this._editingTotalLength);if(isNaN(i)||i<=0)return;const o=this._multiEdgeEditor.edges.map(t=>t.id),n=function(t,e,i){const o=new Set,n=[];for(const i of e){const e=t.edges.get(i);if(e){if(e.length_locked)return{updates:[],blocked:!0,blockedBy:[e.id]};n.push(e),o.add(e.start_node),o.add(e.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const e of o){const i=t.nodes.get(e);i&&s.push({x:i.x,y:i.y})}const{anchor:a,dir:r}=re(s),l=new Map;for(const e of o){const i=t.nodes.get(e);if(!i)continue;const o=i.x-a.x,n=i.y-a.y,s=o*r.x+n*r.y;l.set(e,s)}let d=1/0,c=-1/0,h="";for(const[t,e]of l)e<d&&(d=e,h=t),e>c&&(c=e);const g=c-d;if(g<1e-9)return{updates:[],blocked:!1};const p=$e(t),u=new Set;for(const[t,e]of l){if(u.add(t),t===h)continue;const o=d+i/g*(e-d);p.set(t,{x:a.x+o*r.x,y:a.y+o*r.y})}const _=new Set(u);for(const[e,i]of t.nodes)i.pinned&&_.add(e);const f=Pe(t,_,p);for(const e of u){const i=p.get(e),o=t.nodes.get(e);i&&(Math.abs(i.x-o.x)>de||Math.abs(i.y-o.y)>de)&&(f.updates.some(t=>t.nodeId===e)||f.updates.push({nodeId:e,x:i.x,y:i.y}))}return f.blocked=!1,delete f.blockedBy,f}(xe(t.nodes,t.edges),o,i);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await ie();Rt.value&&this._updateEdgeEditorForSelection(o)}catch(t){console.error("Error applying total length:",t)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error collinear linking edges:",t)}}async _collinearUnlinkEdges(){if(!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await ie();const o=Rt.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error collinear unlinking edges:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=Rt.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges;try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id});await ie(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,Ot.value={type:"none",ids:[]}}_renderDevicePreview(){const t=Bt.value;if("light"!==t&&"switch"!==t&&"mmwave"!==t||this._pendingDevice)return null;const e="light"===t?"#ffd600":"switch"===t?"#4caf50":"#2196f3";return V`
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
    `}}t([gt({attribute:!1})],Je.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Je.prototype,"_svg",void 0),t([pt()],Je.prototype,"_viewBox",void 0),t([pt()],Je.prototype,"_isPanning",void 0),t([pt()],Je.prototype,"_spaceHeld",void 0),t([pt()],Je.prototype,"_panStart",void 0),t([pt()],Je.prototype,"_cursorPos",void 0),t([pt()],Je.prototype,"_wallStartPoint",void 0),t([pt()],Je.prototype,"_roomEditor",void 0),t([pt()],Je.prototype,"_haAreas",void 0),t([pt()],Je.prototype,"_hoveredNode",void 0),t([pt()],Je.prototype,"_draggingNode",void 0),t([pt()],Je.prototype,"_nodeEditor",void 0),t([pt()],Je.prototype,"_edgeEditor",void 0),t([pt()],Je.prototype,"_multiEdgeEditor",void 0),t([pt()],Je.prototype,"_editingTotalLength",void 0),t([pt()],Je.prototype,"_editingLength",void 0),t([pt()],Je.prototype,"_editingLengthLocked",void 0),t([pt()],Je.prototype,"_editingDirection",void 0),t([pt()],Je.prototype,"_editingOpeningParts",void 0),t([pt()],Je.prototype,"_editingOpeningType",void 0),t([pt()],Je.prototype,"_editingSwingDirection",void 0),t([pt()],Je.prototype,"_editingEntityId",void 0),t([pt()],Je.prototype,"_openingSensorSearch",void 0),t([pt()],Je.prototype,"_openingSensorPickerOpen",void 0),t([pt()],Je.prototype,"_blinkingEdgeIds",void 0),t([pt()],Je.prototype,"_focusedRoomId",void 0),t([pt()],Je.prototype,"_pendingDevice",void 0),t([pt()],Je.prototype,"_entitySearch",void 0),t([pt()],Je.prototype,"_openingPreview",void 0),t([pt(),pt()],Je.prototype,"_zonePolyPoints",void 0),t([pt()],Je.prototype,"_pendingZonePolygon",void 0),t([pt()],Je.prototype,"_zoneEditor",void 0),t([pt()],Je.prototype,"_draggingZone",void 0),t([pt()],Je.prototype,"_draggingZoneVertex",void 0),t([pt()],Je.prototype,"_draggingPlacement",void 0),t([pt()],Je.prototype,"_rotatingMmwave",void 0),t([pt()],Je.prototype,"_draggingSimTarget",void 0),t([pt()],Je.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",Je);class Qe extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._haAreas=[],this._focusedRoomId=null,this._cleanupEffects=[]}static{this.styles=a`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
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
  `}connectedCallback(){var t;super.connectedCallback(),Wt.value=null,Rt.value=null,Tt.value="walls",Bt.value="select",Ot.value={type:"none",ids:[]},Ft.value={x:0,y:0,width:1e3,height:800},Zt.value=10,Ht.value=!0,Ut.value=!0,Vt.value=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}],qt.value=[],jt.value=[],Kt.value=[],Yt.value=new Map,Xt.value=null,Gt.value=null,Jt.value=null,Qt.value=[],te.value=[],ee.value=!1,Nt._reloadFloorData=null,Tt.value="viewing",Bt.value="select",Ot.value={type:"none",ids:[]},Ut.value=!1,t=()=>this._reloadCurrentFloor(),Nt._reloadFloorData=t,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(Dt(()=>{this._focusedRoomId=Xt.value}),Dt(()=>{Rt.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}updated(t){t.has("hass")&&this.hass&&this.requestUpdate()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Wt.value=t[0],t[0].floors.length>0&&(Rt.value=t[0].floors[0],Zt.value=t[0].grid_size),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _reloadCurrentFloor(){if(!this.hass)return;const t=Wt.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const i=e.find(e=>e.id===t.id);if(i){Wt.value=i;const t=Rt.value?.id;if(t){const e=i.floors.find(e=>e.id===t);e?Rt.value=e:i.floors.length>0&&(Rt.value=i.floors[0])}else i.floors.length>0&&(Rt.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(t){console.error("Error reloading floor data:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const[e,i,o,n]=await Promise.all([this.hass.callWS({type:"inhabit/lights/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/switches/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/buttons/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/mmwave/list",floor_plan_id:t})]);qt.value=e,jt.value=i,Kt.value=o,Qt.value=n}catch(t){console.error("Error loading device placements:",t)}}_handleFloorChange(t){const e=t.target.value,i=Wt.value;if(i){const t=i.floors.find(t=>t.id===e);t&&(Xt.value=null,Rt.value=t)}}_handleRoomChipClick(t){Xt.value===t?Xt.value=null:Xt.value=t}_renderRoomChips(){const t=Rt.value;if(!t||0===t.rooms.length)return null;const e=Wt.value?.unit,i=t=>{switch(e){case"cm":return t/1e4;case"m":default:return t;case"in":return 64516e-8*t;case"ft":return.092903*t}},o=[...t.rooms].sort((t,e)=>{const o=i(Math.abs(ae(t.polygon))),n=i(Math.abs(ae(e.polygon)));return o===n?t.name.localeCompare(e.name):n-o});return U`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${o.map(t=>{const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id):null,i=e?.icon||"mdi:floor-plan",o=e?.name??t.name;return U`
            <button
              class="room-chip ${this._focusedRoomId===t.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(t.id)}
            >
              <ha-icon icon=${i} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${o}</span>
            </button>
          `})}
      </div>
    `}render(){if(this._loading)return U`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plan...</p>
        </div>
      `;if(this._error)return U`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `;if(0===this._floorPlans.length)return U`
        <div class="empty-state">
          <ha-icon
            icon="mdi:floor-plan"
            style="--mdc-icon-size: 64px;"
          ></ha-icon>
          <h2>No Floor Plans</h2>
          <p>
            Use the Floorplan Editor to create and configure your floor plans.
          </p>
        </div>
      `;const t=Wt.value,e=t?.floors??[],i=Rt.value?.id;return U`
      <div class="viewer-toolbar">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        <h1>${t?.name??"Floorplan"}</h1>
        ${e.length>1?U`
              <select
                class="floor-select"
                .value=${i??""}
                @change=${this._handleFloorChange}
              >
                ${e.map(t=>U`<option value=${t.id} ?selected=${t.id===i}>
                      ${t.name}
                    </option>`)}
              </select>
            `:null}
      </div>
      ${this._renderRoomChips()}
      <div class="canvas-container">
        <fpb-canvas .hass=${this.hass}></fpb-canvas>
      </div>
    `}}t([gt({attribute:!1})],Qe.prototype,"hass",void 0),t([gt({type:Boolean})],Qe.prototype,"narrow",void 0),t([pt()],Qe.prototype,"_floorPlans",void 0),t([pt()],Qe.prototype,"_loading",void 0),t([pt()],Qe.prototype,"_error",void 0),t([pt()],Qe.prototype,"_haAreas",void 0),t([pt()],Qe.prototype,"_focusedRoomId",void 0),customElements.define("ha-floorplan-viewer",Qe);export{Qe as HaFloorplanViewer};
