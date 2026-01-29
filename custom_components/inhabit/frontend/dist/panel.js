function t(t,e,i,o){var r,s=arguments.length,n=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(s<3?r(n):s>3?r(e,i,n):r(e,i))||n);return s>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),r=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new s(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,v=globalThis,f=v.trustedTypes,y=f?f.emptyScript:"",g=v.reactiveElementPolyfillSupport,_=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},m=(t,e)=>!l(t,e),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&c(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:r}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const s=o?.call(this);r?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),r=e.litNonce;void 0!==r&&o.setAttribute("nonce",r),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=o;const s=r.fromAttribute(e,t.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(t,e,i,o=!1,r){if(void 0!==t){const s=this.constructor;if(!1===o&&(r=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??m)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:r},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==r||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[_("elementProperties")]=new Map,x[_("finalized")]=new Map,g?.({ReactiveElement:x}),(v.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,k=t=>t,S=w.trustedTypes,P=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,T=`<${C}>`,U=document,M=()=>U.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,R=Array.isArray,z="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,L=/>/g,F=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,N=/"/g,j=/^(?:script|style|textarea|title)$/i,W=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),I=W(1),q=W(2),V=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),G=new WeakMap,X=U.createTreeWalker(U,129);function Y(t,e){if(!R(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}class K{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let r=0,s=0;const n=t.length-1,a=this.parts,[l,c]=((t,e)=>{const i=t.length-1,o=[];let r,s=2===e?"<svg>":3===e?"<math>":"",n=B;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===B?"!--"===l[1]?n=D:void 0!==l[1]?n=L:void 0!==l[2]?(j.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=F):void 0!==l[3]&&(n=F):n===F?">"===l[0]?(n=r??B,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?F:'"'===l[3]?N:H):n===N||n===H?n=F:n===D||n===L?n=B:(n=F,r=void 0);const h=n===F&&t[e+1].startsWith("/>")?" ":"";s+=n===B?i+T:c>=0?(o.push(a),i.slice(0,c)+A+i.slice(c)+E+h):i+E+(-2===c?e:h)}return[Y(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=K.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=X.nextNode())&&a.length<n;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(A)){const e=c[s++],i=o.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?it:"?"===n[1]?ot:"@"===n[1]?rt:et}),o.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),o.removeAttribute(t));if(j.test(o.tagName)){const t=o.textContent.split(E),e=t.length-1;if(e>0){o.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],M()),X.nextNode(),a.push({type:2,index:++r});o.append(t[e],M())}}}else if(8===o.nodeType)if(o.data===C)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=o.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=U.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){if(e===V)return e;let r=void 0!==o?i._$Co?.[o]:i._$Cl;const s=O(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),void 0===s?r=void 0:(r=new s(t),r._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=r:i._$Cl=r),void 0!==r&&(e=J(t,r._$AS(t,e.values),r,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??U).importNode(e,!0);X.currentNode=o;let r=X.nextNode(),s=0,n=0,a=i[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new tt(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new st(r,this,t)),this._$AV.push(e),a=i[++n]}s!==a?.index&&(r=X.nextNode(),s++)}return X.currentNode=U,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),O(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>R(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new K(t)),e}k(t){R(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const r of t)o===e.length?e.push(i=new tt(this.O(M()),this.O(M()),this,this.options)):i=e[o],i._$AI(r),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,o){const r=this.strings;let s=!1;if(void 0===r)t=J(this,t,e,0),s=!O(t)||t!==this._$AH&&t!==V,s&&(this._$AH=t);else{const o=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=J(this,o[i+n],e,n),a===V&&(a=this._$AH[n]),s||=!O(a)||a!==this._$AH[n],a===Z?t=Z:t!==Z&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}s&&!o&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class rt extends et{constructor(t,e,i,o,r){super(t,e,i,o,r),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??Z)===V)return;const i=this._$AH,o=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==Z&&(i===Z||o);o&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const nt=w.litHtmlPolyfillSupport;nt?.(K,tt),(w.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let r=o._$litPart$;if(void 0===r){const t=i?.renderBefore??null;o._$litPart$=r=new tt(e.insertBefore(M(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const ct=at.litElementPolyfillSupport;ct?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:m},pt=(t=ht,e,i)=>{const{kind:o,metadata:r}=i;let s=globalThis.litPropertyMetadata.get(r);if(void 0===s&&globalThis.litPropertyMetadata.set(r,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,r,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const r=this[o];e.call(this,i),this.requestUpdate(o,r,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function vt(t){return ut({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ft=Symbol.for("preact-signals");function yt(){if(mt>1)return void mt--;let t,e=!1;for(;void 0!==_t;){let i=_t;for(_t=void 0,$t++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&Pt(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if($t=0,mt--,e)throw t}let gt,_t;function bt(t){const e=gt;gt=void 0;try{return t()}finally{gt=e}}let mt=0,$t=0,xt=0;function wt(t){if(void 0===gt)return;let e=t.n;return void 0===e||e.t!==gt?(e={i:0,S:t,p:gt.s,n:void 0,t:gt,e:void 0,x:void 0,r:e},void 0!==gt.s&&(gt.s.n=e),gt.s=e,t.n=e,32&gt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=gt.s,e.n=void 0,gt.s.n=e,gt.s=e),e):void 0}function kt(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function St(t,e){return new kt(t,e)}function Pt(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function At(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Et(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function Ct(t,e){kt.call(this,void 0),this.x=t,this.s=void 0,this.g=xt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Tt(t,e){return new Ct(t,e)}function Ut(t){const e=t.u;if(t.u=void 0,"function"==typeof e){mt++;const i=gt;gt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,Mt(t),e}finally{gt=i,yt()}}}function Mt(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Ut(t)}function Ot(t){if(gt!==this)throw new Error("Out-of-order effect");Et(this),gt=t,this.f&=-2,8&this.f&&Mt(this),yt()}function Rt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function zt(t,e){const i=new Rt(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}function Bt(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}kt.prototype.brand=ft,kt.prototype.h=function(){return!0},kt.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:bt(()=>{var t;null==(t=this.W)||t.call(this)}))},kt.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&bt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},kt.prototype.subscribe=function(t){return zt(()=>{const e=this.value,i=gt;gt=void 0;try{t(e)}finally{gt=i}},{name:"sub"})},kt.prototype.valueOf=function(){return this.value},kt.prototype.toString=function(){return this.value+""},kt.prototype.toJSON=function(){return this.value},kt.prototype.peek=function(){const t=gt;gt=void 0;try{return this.value}finally{gt=t}},Object.defineProperty(kt.prototype,"value",{get(){const t=wt(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if($t>100)throw new Error("Cycle detected");this.v=t,this.i++,xt++,mt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{yt()}}}}),Ct.prototype=new kt,Ct.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===xt)return!0;if(this.g=xt,this.f|=1,this.i>0&&!Pt(this))return this.f&=-2,!0;const t=gt;try{At(this),gt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return gt=t,Et(this),this.f&=-2,!0},Ct.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}kt.prototype.S.call(this,t)},Ct.prototype.U=function(t){if(void 0!==this.t&&(kt.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},Ct.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(Ct.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=wt(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Rt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Rt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Ut(this),At(this),mt++;const t=gt;return gt=this,Ot.bind(this,t)},Rt.prototype.N=function(){2&this.f||(this.f|=2,this.o=_t,_t=this)},Rt.prototype.d=function(){this.f|=8,1&this.f||Mt(this)},Rt.prototype.dispose=function(){this.d()};let Dt=class extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._drawingPoints=[],this._cleanupEffects=[]}static{this.styles=n`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--card-background-color, #fff);
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    svg.panning {
      cursor: grabbing;
    }

    svg.select-tool {
      cursor: default;
    }

    .grid-layer {
      pointer-events: none;
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
    }

    .wall.exterior {
      fill: #1a1a1a;
    }

    .door {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
    }

    .door-swing {
      fill: none;
      stroke: var(--secondary-text-color, #666);
      stroke-width: 1;
      stroke-dasharray: 3,3;
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

    .coverage-zone {
      pointer-events: none;
      opacity: 0.3;
    }

    .coverage-zone.motion {
      fill: #4caf50;
    }

    .coverage-zone.presence {
      fill: #2196f3;
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
      fill: rgba(33, 150, 243, 0.2);
      stroke: var(--primary-color, #2196f3);
      stroke-width: 2;
      stroke-dasharray: 5,5;
      pointer-events: none;
    }

    .crosshair {
      stroke: var(--secondary-text-color, #666);
      stroke-width: 1;
      pointer-events: none;
    }
  `}connectedCallback(){super.connectedCallback(),this._cleanupEffects.push(zt(()=>{this._viewBox=Xt.value}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}_handleWheel(t){t.preventDefault();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,r=this._viewBox.height*e;if(o<100||o>1e4)return;const s={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:r};Xt.value=s,this._viewBox=s}_handlePointerDown(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Kt.value?Bt(e,Yt.value):e;if(1===t.button||0===t.button&&t.shiftKey)return this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);const o=Zt.value;"select"===o?this._handleSelectClick(e):"room"===o||"polygon"===o?this._handlePolygonClick(i):"wall"===o&&this._handleWallClick(i)}_handlePointerMove(t){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Kt.value?Bt(e,Yt.value):e;if(this._cursorPos=i,this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};this._panStart={x:t.clientX,y:t.clientY},Xt.value=o,this._viewBox=o}}_handlePointerUp(t){this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId))}_handleKeyDown(t){"Escape"===t.key?(this._drawingPoints=[],Gt.value={type:"none",ids:[]}):"Enter"===t.key&&this._drawingPoints.length>=3&&this._completePolygon()}_handleSelectClick(t){const e=Vt.value;if(!e)return;for(const i of e.rooms)if(this._pointInPolygon(t,i.polygon.vertices))return void(Gt.value={type:"room",ids:[i.id]});const i=te.value.filter(t=>t.floor_id===e.id);for(const e of i){if(Math.sqrt(Math.pow(t.x-e.position.x,2)+Math.pow(t.y-e.position.y,2))<15)return void(Gt.value={type:"device",ids:[e.id]})}Gt.value={type:"none",ids:[]}}_handlePolygonClick(t){if(this._drawingPoints.length>=3){const e=this._drawingPoints[0];if(Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))<15)return void this._completePolygon()}this._drawingPoints=[...this._drawingPoints,t]}_handleWallClick(t){0===this._drawingPoints.length?this._drawingPoints=[t]:(this._completeWall(this._drawingPoints[0],t),this._drawingPoints=[])}async _completePolygon(){if(!this.hass||this._drawingPoints.length<3)return;const t=Vt.value,e=(await Promise.resolve().then(function(){return ie})).currentFloorPlan.value;if(!t||!e)return;const i=prompt("Enter room name:");if(i)try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:i,polygon:{vertices:this._drawingPoints},color:this._getRandomRoomColor()}),this._drawingPoints=[],window.location.reload()}catch(t){console.error("Error creating room:",t),alert(`Failed to create room: ${t}`)}else this._drawingPoints=[]}async _completeWall(t,e){if(!this.hass)return;const i=Vt.value,o=(await Promise.resolve().then(function(){return ie})).currentFloorPlan.value;if(i&&o)try{await this.hass.callWS({type:"inhabit/walls/add",floor_plan_id:o.id,floor_id:i.id,start:t,end:e,thickness:10})}catch(t){console.error("Error creating wall:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getBoundingClientRect(),i=this._viewBox.width/e.width,o=this._viewBox.height/e.height;return{x:this._viewBox.x+(t.x-e.left)*i,y:this._viewBox.y+(t.y-e.top)*o}}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let r=0,s=o-1;r<o;s=r++){const o=e[r],n=e[s];o.y>t.y!=n.y>t.y&&t.x<(n.x-o.x)*(t.y-o.y)/(n.y-o.y)+o.x&&(i=!i)}return i}_getRandomRoomColor(){const t=["#e8e8e8","#fce4ec","#e8f5e9","#e3f2fd","#fff3e0","#f3e5f5","#e0f7fa","#fff8e1"];return t[Math.floor(Math.random()*t.length)]}_renderGrid(){if(!Jt.value)return null;const t=Yt.value,e=10*t;return q`
      <defs>
        <pattern id="minor-grid" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
          <path d="M ${t} 0 L 0 0 0 ${t}" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
        </pattern>
        <pattern id="major-grid" width="${e}" height="${e}" patternUnits="userSpaceOnUse">
          <rect width="${e}" height="${e}" fill="url(#minor-grid)"/>
          <path d="M ${e} 0 L 0 0 0 ${e}" fill="none" stroke="#d0d0d0" stroke-width="1"/>
        </pattern>
      </defs>
      <rect class="grid-layer" x="${this._viewBox.x}" y="${this._viewBox.y}"
            width="${this._viewBox.width}" height="${this._viewBox.height}"
            fill="url(#major-grid)"/>
    `}_renderFloor(){const t=Vt.value;if(!t)return null;const e=Gt.value,i=Qt.value;return q`
      <!-- Background layer -->
      ${i.find(t=>"background"===t.id)?.visible&&t.background_image?q`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${i.find(t=>"background"===t.id)?.opacity??1}"/>
      `:null}

      <!-- Structure layer (walls, doors, windows) -->
      ${i.find(t=>"structure"===t.id)?.visible?q`
        <g class="structure-layer" opacity="${i.find(t=>"structure"===t.id)?.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>q`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""}"
                  d="${function(t){const e=t.vertices;if(0===e.length)return"";const i=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return i.join(" ")+" Z"}(t.polygon)}"
                  fill="${t.color}"
                  stroke="#999"
                  stroke-width="1"/>
          `)}

          <!-- Walls -->
          ${t.walls.map(t=>q`
            <path class="wall ${t.is_exterior?"exterior":""}"
                  d="${function(t,e,i){const o=e.x-t.x,r=e.y-t.y,s=Math.sqrt(o*o+r*r);if(0===s)return"";const n=-r/s*(i/2),a=o/s*(i/2);return`M${t.x+n},${t.y+a}\n          L${e.x+n},${e.y+a}\n          L${e.x-n},${e.y-a}\n          L${t.x-n},${t.y-a}\n          Z`}(t.start,t.end,t.thickness)}"/>
          `)}

          <!-- Doors -->
          ${t.doors.map(e=>{const i=t.walls.find(t=>t.id===e.wall_id);if(!i)return null;const o=e.position,r=i.start.x+(i.end.x-i.start.x)*o,s=i.start.y+(i.end.y-i.start.y)*o;return q`
              <rect class="door" x="${r-e.width/2}" y="${s-5}"
                    width="${e.width}" height="10"/>
            `})}

          <!-- Windows -->
          ${t.windows.map(e=>{const i=t.walls.find(t=>t.id===e.wall_id);if(!i)return null;const o=e.position,r=i.start.x+(i.end.x-i.start.x)*o,s=i.start.y+(i.end.y-i.start.y)*o;return q`
              <rect class="window" x="${r-e.width/2}" y="${s-3}"
                    width="${e.width}" height="6"/>
            `})}
        </g>
      `:null}

      <!-- Labels layer -->
      ${i.find(t=>"labels"===t.id)?.visible?q`
        <g class="labels-layer" opacity="${i.find(t=>"labels"===t.id)?.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);return e?q`
              <text class="room-label" x="${e.x}" y="${e.y}">${t.name}</text>
            `:null})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${i.find(t=>"devices"===t.id)?.visible?q`
        <g class="devices-layer" opacity="${i.find(t=>"devices"===t.id)?.opacity??1}">
          ${te.value.filter(e=>e.floor_id===t.id).map(t=>this._renderDevice(t))}
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
    `}_renderDrawingPreview(){if(0===this._drawingPoints.length)return null;const t=Zt.value;if("room"===t||"polygon"===t){const t=[...this._drawingPoints,this._cursorPos].map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`).join(" ");return q`
        <path class="drawing-preview" d="${t} Z"/>
        ${this._drawingPoints.map(t=>q`
          <circle cx="${t.x}" cy="${t.y}" r="5" fill="var(--primary-color)" stroke="white" stroke-width="2"/>
        `)}
      `}if("wall"===t&&1===this._drawingPoints.length){const t=this._drawingPoints[0];return q`
        <line class="drawing-preview" x1="${t.x}" y1="${t.y}"
              x2="${this._cursorPos.x}" y2="${this._cursorPos.y}"
              stroke="var(--primary-color)" stroke-width="3"/>
      `}return null}_getPolygonCenter(t){if(0===t.length)return null;let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}render(){return I`
      <svg
        class="${this._isPanning?"panning":""} ${"select"===Zt.value?"select-tool":""}"
        viewBox="${t=this._viewBox,`${t.x} ${t.y} ${t.width} ${t.height}`}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderGrid()}
        ${this._renderFloor()}
        ${this._renderDrawingPreview()}
      </svg>
    `;var t}};t([ut({attribute:!1})],Dt.prototype,"hass",void 0),t([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(t){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Dt.prototype,"_svg",void 0),t([vt()],Dt.prototype,"_viewBox",void 0),t([vt()],Dt.prototype,"_isPanning",void 0),t([vt()],Dt.prototype,"_panStart",void 0),t([vt()],Dt.prototype,"_cursorPos",void 0),t([vt()],Dt.prototype,"_drawingPoints",void 0),Dt=t([dt("fpb-canvas")],Dt);const Lt=St([]),Ft=St([]),Ht=Tt(()=>Lt.value.length>0),Nt=Tt(()=>Ft.value.length>0);const jt=[{id:"select",icon:"mdi:cursor-default",label:"Select"},{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"room",icon:"mdi:floor-plan",label:"Room"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"},{id:"rectangle",icon:"mdi:rectangle-outline",label:"Rectangle"},{id:"ellipse",icon:"mdi:ellipse-outline",label:"Ellipse"},{id:"text",icon:"mdi:format-text",label:"Text"},{id:"device",icon:"mdi:devices",label:"Place Device"}];let Wt=class extends lt{constructor(){super(...arguments),this.floorPlans=[]}static{this.styles=n`
    :host {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      background: var(--card-background-color);
    }

    .floor-select {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      cursor: pointer;
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

    .toggle-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }

    .toggle-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 12px;
    }

    .add-button:hover {
      opacity: 0.9;
    }
  `}_handleFloorChange(t){const e=t.target;this.dispatchEvent(new CustomEvent("floor-plan-select",{detail:{id:e.value},bubbles:!0,composed:!0}))}_handleToolSelect(t){Zt.value=t}_handleUndo(){!function(){const t=Lt.value;if(0===t.length)return;const e=t[t.length-1];e.undo(),Lt.value=t.slice(0,-1),Ft.value=[...Ft.value,e]}()}_handleRedo(){!function(){const t=Ft.value;if(0===t.length)return;const e=t[t.length-1];e.redo(),Ft.value=t.slice(0,-1),Lt.value=[...Lt.value,e]}()}_toggleGrid(){Jt.value=!Jt.value}_toggleSnap(){Kt.value=!Kt.value}_handleCreateFloor(){this.dispatchEvent(new CustomEvent("create-floor",{bubbles:!0,composed:!0}))}render(){const t=qt.value,e=Zt.value;return I`
      <!-- Floor Selector (each floor plan = one floor) -->
      <select
        class="floor-select"
        .value=${t?.id||""}
        @change=${this._handleFloorChange}
      >
        ${this.floorPlans.map(t=>I`<option value=${t.id}>${t.name}</option>`)}
      </select>

      <button class="add-button" @click=${this._handleCreateFloor}>
        <ha-icon icon="mdi:plus"></ha-icon>
        Add Floor
      </button>

      <div class="divider"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!Ht.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!Nt.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Drawing Tools -->
      <div class="tool-group">
        ${jt.map(t=>I`
            <button
              class="tool-button ${e===t.id?"active":""}"
              @click=${()=>this._handleToolSelect(t.id)}
              title=${t.label}
            >
              <ha-icon icon=${t.icon}></ha-icon>
            </button>
          `)}
      </div>

      <div class="spacer"></div>

      <!-- View Options -->
      <button
        class="toggle-button ${Jt.value?"active":""}"
        @click=${this._toggleGrid}
      >
        <ha-icon icon="mdi:grid"></ha-icon>
        Grid
      </button>

      <button
        class="toggle-button ${Kt.value?"active":""}"
        @click=${this._toggleSnap}
      >
        <ha-icon icon="mdi:magnet"></ha-icon>
        Snap
      </button>
    `}};t([ut({attribute:!1})],Wt.prototype,"hass",void 0),t([ut({attribute:!1})],Wt.prototype,"floorPlans",void 0),Wt=t([dt("fpb-toolbar")],Wt);let It=class extends lt{constructor(){super(...arguments),this.collapsed=!1,this._activeTab="layers",this._entitySearch="",this._entityFilter="all"}static{this.styles=n`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--card-background-color);
      overflow: hidden;
    }

    .collapse-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      border-bottom: 1px solid var(--divider-color);
    }

    .collapse-button:hover {
      background: var(--secondary-background-color);
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
    }

    :host([collapsed]) .tabs {
      display: none;
    }

    .tab {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .tab:hover {
      background: var(--secondary-background-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    :host([collapsed]) .content {
      display: none;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
    }

    /* Layers panel */
    .layer-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      gap: 8px;
      cursor: pointer;
    }

    .layer-item:hover {
      background: var(--secondary-background-color);
    }

    .layer-item .name {
      flex: 1;
      font-size: 14px;
    }

    .layer-item .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    .layer-item .icon-button:hover {
      background: var(--primary-background-color);
    }

    .layer-item .icon-button.active {
      color: var(--primary-color);
    }

    /* Entities panel */
    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .filter-chip {
      padding: 4px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }

    .filter-chip:hover {
      background: var(--secondary-background-color);
    }

    .filter-chip.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .entity-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      gap: 8px;
      cursor: grab;
      background: var(--primary-background-color);
    }

    .entity-item:hover {
      background: var(--secondary-background-color);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }

    .entity-item.on ha-icon {
      color: var(--state-light-active-color, #ffd600);
    }

    .entity-item .name {
      flex: 1;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-item .state {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    /* Properties panel */
    .property-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .property-row:last-child {
      border-bottom: none;
    }

    .property-label {
      flex: 1;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .property-value {
      font-size: 13px;
      font-weight: 500;
    }

    .property-input {
      width: 100px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .no-selection {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 24px;
    }
  `}_handleTabClick(t){this._activeTab=t}_handleToggle(){this.dispatchEvent(new CustomEvent("toggle-sidebar",{bubbles:!0,composed:!0}))}_toggleLayerVisibility(t){Qt.value=Qt.value.map(e=>e.id===t?{...e,visible:!e.visible}:e)}_toggleLayerLock(t){Qt.value=Qt.value.map(e=>e.id===t?{...e,locked:!e.locked}:e)}_getFilteredEntities(){if(!this.hass)return[];let t=Object.values(this.hass.states);if("all"!==this._entityFilter&&(t=t.filter(t=>t.entity_id.startsWith(this._entityFilter+"."))),this._entitySearch){const e=this._entitySearch.toLowerCase();t=t.filter(t=>t.entity_id.toLowerCase().includes(e)||(t.attributes.friendly_name||"").toLowerCase().includes(e))}return t.slice(0,50)}_getEntityIcon(t){const e=t.entity_id.split(".")[0];return t.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast",lock:"mdi:lock",vacuum:"mdi:robot-vacuum"}[e]||"mdi:devices"}async _handleEntityDragStart(t,e){t.dataTransfer?.setData("text/plain",e.entity_id),t.dataTransfer.effectAllowed="copy"}_renderLayersPanel(){return I`
      <div class="section">
        <div class="section-title">Layers</div>
        ${Qt.value.map(t=>I`
            <div class="layer-item">
              <span class="name">${t.name}</span>
              <button
                class="icon-button ${t.visible?"active":""}"
                @click=${()=>this._toggleLayerVisibility(t.id)}
                title="${t.visible?"Hide":"Show"}"
              >
                <ha-icon
                  icon=${t.visible?"mdi:eye":"mdi:eye-off"}
                ></ha-icon>
              </button>
              <button
                class="icon-button ${t.locked?"active":""}"
                @click=${()=>this._toggleLayerLock(t.id)}
                title="${t.locked?"Unlock":"Lock"}"
              >
                <ha-icon
                  icon=${t.locked?"mdi:lock":"mdi:lock-open"}
                ></ha-icon>
              </button>
            </div>
          `)}
      </div>
    `}_renderEntitiesPanel(){const t=this._getFilteredEntities();return I`
      <div class="section">
        <input
          type="text"
          class="search-input"
          placeholder="Search entities..."
          .value=${this._entitySearch}
          @input=${t=>this._entitySearch=t.target.value}
        />

        <div class="filter-chips">
          ${["all","light","switch","sensor","binary_sensor","climate"].map(t=>I`
              <button
                class="filter-chip ${this._entityFilter===t?"active":""}"
                @click=${()=>this._entityFilter=t}
              >
                ${"all"===t?"All":t}
              </button>
            `)}
        </div>

        <div class="entity-list">
          ${t.map(t=>I`
              <div
                class="entity-item ${"on"===t.state?"on":""}"
                draggable="true"
                @dragstart=${e=>this._handleEntityDragStart(e,t)}
              >
                <ha-icon icon=${this._getEntityIcon(t)}></ha-icon>
                <span class="name">
                  ${t.attributes.friendly_name||t.entity_id}
                </span>
                <span class="state">${t.state}</span>
              </div>
            `)}
        </div>
      </div>
    `}_renderPropertiesPanel(){const t=Gt.value;if("none"===t.type||0===t.ids.length)return I`
        <div class="no-selection">
          <ha-icon icon="mdi:cursor-default-click"></ha-icon>
          <p>Select an element to view properties</p>
        </div>
      `;const e=Vt.value;if("room"===t.type&&e){const i=e.rooms.find(e=>e.id===t.ids[0]);if(i)return I`
          <div class="section">
            <div class="section-title">Room Properties</div>
            <div class="property-row">
              <span class="property-label">Name</span>
              <span class="property-value">${i.name}</span>
            </div>
            <div class="property-row">
              <span class="property-label">Color</span>
              <input
                type="color"
                class="property-input"
                .value=${i.color}
                style="width: 50px; height: 30px;"
              />
            </div>
            <div class="property-row">
              <span class="property-label">Occupancy Sensor</span>
              <span class="property-value">
                ${i.occupancy_sensor_enabled?"Enabled":"Disabled"}
              </span>
            </div>
            <div class="property-row">
              <span class="property-label">Motion Timeout</span>
              <span class="property-value">${i.motion_timeout}s</span>
            </div>
            <div class="property-row">
              <span class="property-label">Checking Timeout</span>
              <span class="property-value">${i.checking_timeout}s</span>
            </div>
          </div>
        `}if("device"===t.type){const e=te.value.find(e=>e.id===t.ids[0]);if(e&&this.hass){const t=this.hass.states[e.entity_id];return I`
          <div class="section">
            <div class="section-title">Device Properties</div>
            <div class="property-row">
              <span class="property-label">Entity</span>
              <span class="property-value">${e.entity_id}</span>
            </div>
            <div class="property-row">
              <span class="property-label">State</span>
              <span class="property-value">${t?.state||"unknown"}</span>
            </div>
            <div class="property-row">
              <span class="property-label">Position</span>
              <span class="property-value">
                ${Math.round(e.position.x)}, ${Math.round(e.position.y)}
              </span>
            </div>
            <div class="property-row">
              <span class="property-label">Rotation</span>
              <input
                type="number"
                class="property-input"
                .value=${e.rotation.toString()}
                min="0"
                max="360"
              />
            </div>
          </div>
        `}}return I`
      <div class="no-selection">
        <p>Unknown selection type</p>
      </div>
    `}render(){return I`
      <button class="collapse-button" @click=${this._handleToggle}>
        <ha-icon
          icon=${this.collapsed?"mdi:chevron-left":"mdi:chevron-right"}
        ></ha-icon>
      </button>

      <div class="tabs">
        <button
          class="tab ${"layers"===this._activeTab?"active":""}"
          @click=${()=>this._handleTabClick("layers")}
        >
          Layers
        </button>
        <button
          class="tab ${"entities"===this._activeTab?"active":""}"
          @click=${()=>this._handleTabClick("entities")}
        >
          Entities
        </button>
        <button
          class="tab ${"properties"===this._activeTab?"active":""}"
          @click=${()=>this._handleTabClick("properties")}
        >
          Properties
        </button>
      </div>

      <div class="content">
        ${"layers"===this._activeTab?this._renderLayersPanel():null}
        ${"entities"===this._activeTab?this._renderEntitiesPanel():null}
        ${"properties"===this._activeTab?this._renderPropertiesPanel():null}
      </div>
    `}};t([ut({attribute:!1})],It.prototype,"hass",void 0),t([ut({type:Boolean})],It.prototype,"collapsed",void 0),t([vt()],It.prototype,"_activeTab",void 0),t([vt()],It.prototype,"_entitySearch",void 0),t([vt()],It.prototype,"_entityFilter",void 0),It=t([dt("fpb-sidebar")],It);const qt=St(null),Vt=St(null),Zt=St("select"),Gt=St({type:"none",ids:[]}),Xt=St({x:0,y:0,width:1e3,height:800}),Yt=St(10),Kt=St(!0),Jt=St(!0),Qt=St([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),te=St([]);class ee extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._sidebarCollapsed=!1}static{this.styles=n`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      --sidebar-width: 300px;
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

    fpb-sidebar {
      width: var(--sidebar-width);
      border-left: 1px solid var(--divider-color);
      overflow-y: auto;
      transition: width 0.2s ease;
    }

    fpb-sidebar.collapsed {
      width: 48px;
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

    .empty-state button {
      margin-top: 16px;
      padding: 12px 24px;
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

    /* Narrow mode adjustments */
    :host([narrow]) fpb-sidebar {
      position: absolute;
      right: 0;
      top: var(--toolbar-height);
      bottom: 0;
      z-index: 10;
      background: var(--card-background-color);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }

    :host([narrow]) fpb-sidebar.collapsed {
      transform: translateX(calc(100% - 48px));
    }
  `}connectedCallback(){super.connectedCallback(),this._loadFloorPlans()}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(qt.value=t[0],t[0].floors.length>0&&(Vt.value=t[0].floors[0],Yt.value=t[0].grid_size),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:t});te.value=e}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _createFloor(){if(!this.hass)return;const t=prompt("Floor name:",`Floor ${this._floorPlans.length+1}`);if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:t,unit:"cm",grid_size:10}),i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:t,level:this._floorPlans.length});e.floors=[i],this._floorPlans=[...this._floorPlans,e],qt.value=e,Vt.value=i}catch(t){console.error("Error creating floor:",t),alert(`Failed to create floor: ${t}`)}}_handleFloorPlanSelect(t){const e=this._floorPlans.find(e=>e.id===t);e&&(qt.value=e,Vt.value=e.floors[0]||null,this._loadDevicePlacements(e.id))}_handleFloorSelect(t){const e=qt.value;if(e){const i=e.floors.find(e=>e.id===t);i&&(Vt.value=i)}}_toggleSidebar(){this._sidebarCollapsed=!this._sidebarCollapsed}render(){return this._loading?I`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plans...</p>
        </div>
      `:this._error?I`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?I`
        <div class="empty-state">
          <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
          <h2>Welcome to Inhabit</h2>
          <p>
            Create visual floor plans of your home, place devices, and set up
            spatial automations with occupancy detection.
          </p>
          <button @click=${this._createFloor}>Create Floor</button>
        </div>
      `:I`
      <div class="container">
        <div class="main-area">
          <fpb-toolbar
            .hass=${this.hass}
            .floorPlans=${this._floorPlans}
            @floor-plan-select=${t=>this._handleFloorPlanSelect(t.detail.id)}
            @floor-select=${t=>this._handleFloorSelect(t.detail.id)}
            @create-floor=${this._createFloor}
          ></fpb-toolbar>

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>

        <fpb-sidebar
          class=${this._sidebarCollapsed?"collapsed":""}
          .hass=${this.hass}
          .collapsed=${this._sidebarCollapsed}
          @toggle-sidebar=${this._toggleSidebar}
        ></fpb-sidebar>
      </div>
    `}}t([ut({attribute:!1})],ee.prototype,"hass",void 0),t([ut({type:Boolean})],ee.prototype,"narrow",void 0),t([vt()],ee.prototype,"_floorPlans",void 0),t([vt()],ee.prototype,"_loading",void 0),t([vt()],ee.prototype,"_error",void 0),t([vt()],ee.prototype,"_sidebarCollapsed",void 0);var ie=Object.freeze({__proto__:null,HaFloorplanBuilder:ee,activeTool:Zt,currentFloor:Vt,currentFloorPlan:qt,devicePlacements:te,gridSize:Yt,layers:Qt,selection:Gt,showGrid:Jt,snapToGrid:Kt,viewBox:Xt});customElements.define("ha-floorplan-builder",ee);export{ee as HaFloorplanBuilder};
