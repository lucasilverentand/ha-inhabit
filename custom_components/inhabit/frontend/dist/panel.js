function e(e,t,o,i){var n,s=arguments.length,r=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,o,r):n(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,o=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let s=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(o&&void 0===e){const o=void 0!==t&&1===t.length;o&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),o&&n.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const o=1===e.length?e[0]:t.reduce((t,o,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new s(o,e,i)},a=o?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const o of e.cssRules)t+=o.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,f=u.trustedTypes,_=f?f.emptyScript:"",y=u.reactiveElementPolyfillSupport,v=(e,t)=>e,x={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=null!==e;break;case Number:o=null===e?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch(e){o=null}}return o}},m=(e,t)=>!l(e,t),b={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=b){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(e,o,t);void 0!==i&&d(this.prototype,e,i)}}static getPropertyDescriptor(e,t,o){const{get:i,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const s=i?.call(this);n?.call(this,t),this.requestUpdate(e,s,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const o of t)this.createProperty(o,e[o])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,o]of t)this.elementProperties.set(e,o)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const o=this._$Eu(e,t);void 0!==o&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const e of o)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const o=t.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(o)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const o of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=o.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$ET(e,t){const o=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:x).toAttribute(t,o.type);this._$Em=e,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){const o=this.constructor,i=o._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=o.getPropertyOptions(i),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:x;this._$Em=i;const s=n.fromAttribute(t,e.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(e,t,o,i=!1,n){if(void 0!==e){const s=this.constructor;if(!1===i&&(n=this[e]),o??=s.getPropertyOptions(e),!((o.hasChanged??m)(n,t)||o.useDefault&&o.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,o))))return;this.C(e,t,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:o,reflect:i,wrapped:n},s){o&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||o||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,o]of e){const{wrapped:e}=o,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,o,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=e=>e,E=$.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:e=>e}):void 0,M="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+S,A=`<${C}>`,z=document,I=()=>z.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,N="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,R=/>/g,T=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,B=/"/g,Z=/^(?:script|style|textarea|title)$/i,U=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),V=U(1),j=U(2),H=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),K=new WeakMap,Y=z.createTreeWalker(z,129);function X(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(t):t}class G{constructor({strings:e,_$litType$:t},o){let i;this.parts=[];let n=0,s=0;const r=e.length-1,a=this.parts,[l,d]=((e,t)=>{const o=e.length-1,i=[];let n,s=2===t?"<svg>":3===t?"<math>":"",r=F;for(let t=0;t<o;t++){const o=e[t];let a,l,d=-1,c=0;for(;c<o.length&&(r.lastIndex=c,l=r.exec(o),null!==l);)c=r.lastIndex,r===F?"!--"===l[1]?r=O:void 0!==l[1]?r=R:void 0!==l[2]?(Z.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=T):void 0!==l[3]&&(r=T):r===T?">"===l[0]?(r=n??F,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?T:'"'===l[3]?B:W):r===B||r===W?r=T:r===O||r===R?r=F:(r=T,n=void 0);const h=r===T&&e[t+1].startsWith("/>")?" ":"";s+=r===F?o+A:d>=0?(i.push(a),o.slice(0,d)+M+o.slice(d)+S+h):o+S+(-2===d?t:h)}return[X(e,s+(e[o]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=G.createElement(l,o),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=Y.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(M)){const t=d[s++],o=i.getAttribute(e).split(S),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:o,ctor:"."===r[1]?oe:"?"===r[1]?ie:"@"===r[1]?ne:te}),i.removeAttribute(e)}else e.startsWith(S)&&(a.push({type:6,index:n}),i.removeAttribute(e));if(Z.test(i.tagName)){const e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=E?E.emptyScript:"";for(let o=0;o<t;o++)i.append(e[o],I()),Y.nextNode(),a.push({type:2,index:++n});i.append(e[t],I())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(S,e+1));)a.push({type:7,index:n}),e+=S.length-1}n++}}static createElement(e,t){const o=z.createElement("template");return o.innerHTML=e,o}}function J(e,t,o=e,i){if(t===H)return t;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const s=L(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,i)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:o}=this._$AD,i=(e?.creationScope??z).importNode(t,!0);Y.currentNode=i;let n=Y.nextNode(),s=0,r=0,a=o[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new ee(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new se(n,this,e)),this._$AV.push(t),a=o[++r]}s!==a?.index&&(n=Y.nextNode(),s++)}return Y.currentNode=z,i}p(e){let t=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,o,i){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),L(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==H&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:o}=e,i="number"==typeof o?this._$AC(e):(void 0===o.el&&(o.el=G.createElement(X(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Q(i,this),o=e.u(this.options);e.p(t),this.T(o),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new G(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let o,i=0;for(const n of e)i===t.length?t.push(o=new ee(this.O(I()),this.O(I()),this,this.options)):o=t[i],o._$AI(n),i++;i<t.length&&(this._$AR(o&&o._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,i,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=q}_$AI(e,t=this,o,i){const n=this.strings;let s=!1;if(void 0===n)e=J(this,e,t,0),s=!L(e)||e!==this._$AH&&e!==H,s&&(this._$AH=e);else{const i=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=J(this,i[o+r],t,r),a===H&&(a=this._$AH[r]),s||=!L(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!i&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class ie extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class ne extends te{constructor(e,t,o,i,n){super(e,t,o,i,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??q)===H)return;const o=this._$AH,i=e===q&&o!==q||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,n=e!==q&&(o===q||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=$.litHtmlPolyfillSupport;re?.(G,ee),($.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let le=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,o)=>{const i=o?.renderBefore??t;let n=i._$litPart$;if(void 0===n){const e=o?.renderBefore??null;i._$litPart$=n=new ee(t.insertBefore(I(),e),e,void 0,o??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return H}};le._$litElement$=!0,le.finalized=!0,ae.litElementHydrateSupport?.({LitElement:le});const de=ae.litElementPolyfillSupport;de?.({LitElement:le}),(ae.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:m},he=(e=ce,t,o)=>{const{kind:i,metadata:n}=o;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),s.set(o.name,e),"accessor"===i){const{name:i}=o;return{set(o){const n=t.get.call(this);t.set.call(this,o),this.requestUpdate(i,n,e,!0,o)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];t.call(this,o),this.requestUpdate(i,n,e,!0,o)}}throw Error("Unsupported decorator location: "+i)};function pe(e){return(t,o)=>"object"==typeof o?he(e,t,o):((e,t,o)=>{const i=t.hasOwnProperty(o);return t.constructor.createProperty(o,e),i?Object.getOwnPropertyDescriptor(t,o):void 0})(e,t,o)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return pe({...e,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ue=Symbol.for("preact-signals");function fe(){if(xe>1)return void xe--;let e,t=!1;for(;void 0!==ye;){let o=ye;for(ye=void 0,me++;void 0!==o;){const i=o.o;if(o.o=void 0,o.f&=-3,!(8&o.f)&&Ee(o))try{o.c()}catch(o){t||(e=o,t=!0)}o=i}}if(me=0,xe--,t)throw e}let _e,ye;function ve(e){const t=_e;_e=void 0;try{return e()}finally{_e=t}}let xe=0,me=0,be=0;function we(e){if(void 0===_e)return;let t=e.n;return void 0===t||t.t!==_e?(t={i:0,S:e,p:_e.s,n:void 0,t:_e,e:void 0,x:void 0,r:t},void 0!==_e.s&&(_e.s.n=t),_e.s=t,e.n=t,32&_e.f&&e.S(t),t):-1===t.i?(t.i=0,void 0!==t.n&&(t.n.p=t.p,void 0!==t.p&&(t.p.n=t.n),t.p=_e.s,t.n=void 0,_e.s.n=t,_e.s=t),t):void 0}function $e(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.W=null==t?void 0:t.watched,this.Z=null==t?void 0:t.unwatched,this.name=null==t?void 0:t.name}function ke(e,t){return new $e(e,t)}function Ee(e){for(let t=e.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function Pe(e){for(let t=e.s;void 0!==t;t=t.n){const o=t.S.n;if(void 0!==o&&(t.r=o),t.S.n=t,t.i=-1,void 0===t.n){e.s=t;break}}}function Me(e){let t,o=e.s;for(;void 0!==o;){const e=o.p;-1===o.i?(o.S.U(o),void 0!==e&&(e.n=o.n),void 0!==o.n&&(o.n.p=e)):t=o,o.S.n=o.r,void 0!==o.r&&(o.r=void 0),o=e}e.s=t}function Se(e,t){$e.call(this,void 0),this.x=e,this.s=void 0,this.g=be-1,this.f=4,this.W=null==t?void 0:t.watched,this.Z=null==t?void 0:t.unwatched,this.name=null==t?void 0:t.name}function Ce(e,t){return new Se(e,t)}function Ae(e){const t=e.u;if(e.u=void 0,"function"==typeof t){xe++;const o=_e;_e=void 0;try{t()}catch(t){throw e.f&=-2,e.f|=8,ze(e),t}finally{_e=o,fe()}}}function ze(e){for(let t=e.s;void 0!==t;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,Ae(e)}function Ie(e){if(_e!==this)throw new Error("Out-of-order effect");Me(this),_e=e,this.f&=-2,8&this.f&&ze(this),fe()}function Le(e,t){this.x=e,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==t?void 0:t.name}function De(e,t){const o=new Le(e,t);try{o.c()}catch(e){throw o.d(),e}const i=o.d.bind(o);return i[Symbol.dispose]=i,i}$e.prototype.brand=ue,$e.prototype.h=function(){return!0},$e.prototype.S=function(e){const t=this.t;t!==e&&void 0===e.e&&(e.x=t,this.t=e,void 0!==t?t.e=e:ve(()=>{var e;null==(e=this.W)||e.call(this)}))},$e.prototype.U=function(e){if(void 0!==this.t){const t=e.e,o=e.x;void 0!==t&&(t.x=o,e.e=void 0),void 0!==o&&(o.e=t,e.x=void 0),e===this.t&&(this.t=o,void 0===o&&ve(()=>{var e;null==(e=this.Z)||e.call(this)}))}},$e.prototype.subscribe=function(e){return De(()=>{const t=this.value,o=_e;_e=void 0;try{e(t)}finally{_e=o}},{name:"sub"})},$e.prototype.valueOf=function(){return this.value},$e.prototype.toString=function(){return this.value+""},$e.prototype.toJSON=function(){return this.value},$e.prototype.peek=function(){const e=_e;_e=void 0;try{return this.value}finally{_e=e}},Object.defineProperty($e.prototype,"value",{get(){const e=we(this);return void 0!==e&&(e.i=this.i),this.v},set(e){if(e!==this.v){if(me>100)throw new Error("Cycle detected");this.v=e,this.i++,be++,xe++;try{for(let e=this.t;void 0!==e;e=e.x)e.t.N()}finally{fe()}}}}),Se.prototype=new $e,Se.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===be)return!0;if(this.g=be,this.f|=1,this.i>0&&!Ee(this))return this.f&=-2,!0;const e=_e;try{Pe(this),_e=this;const e=this.x();(16&this.f||this.v!==e||0===this.i)&&(this.v=e,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return _e=e,Me(this),this.f&=-2,!0},Se.prototype.S=function(e){if(void 0===this.t){this.f|=36;for(let e=this.s;void 0!==e;e=e.n)e.S.S(e)}$e.prototype.S.call(this,e)},Se.prototype.U=function(e){if(void 0!==this.t&&($e.prototype.U.call(this,e),void 0===this.t)){this.f&=-33;for(let e=this.s;void 0!==e;e=e.n)e.S.U(e)}},Se.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let e=this.t;void 0!==e;e=e.x)e.t.N()}},Object.defineProperty(Se.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const e=we(this);if(this.h(),void 0!==e&&(e.i=this.i),16&this.f)throw this.v;return this.v}}),Le.prototype.c=function(){const e=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const e=this.x();"function"==typeof e&&(this.u=e)}finally{e()}},Le.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Ae(this),Pe(this),xe++;const e=_e;return _e=this,Ie.bind(this,e)},Le.prototype.N=function(){2&this.f||(this.f|=2,this.o=ye,ye=this)},Le.prototype.d=function(){this.f|=8,1&this.f||ze(this)},Le.prototype.dispose=function(){this.d()},window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:ke(null),currentFloor:ke(null),canvasMode:ke("walls"),activeTool:ke("select"),selection:ke({type:"none",ids:[]}),viewBox:ke({x:0,y:0,width:1e3,height:800}),gridSize:ke(10),snapToGrid:ke(!0),showGrid:ke(!0),layers:ke([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),devicePlacements:ke([]),constraintConflicts:ke(new Map),focusedRoomId:ke(null),occupancyPanelTarget:ke(null),mmwavePlacements:ke([]),_reloadFloorData:null});const Ne=window.__inhabit_signals,Fe=Ne.currentFloorPlan,Oe=Ne.currentFloor,Re=Ne.canvasMode,Te=Ne.activeTool,We=Ne.selection,Be=Ne.viewBox,Ze=Ne.gridSize,Ue=Ne.snapToGrid,Ve=Ne.showGrid,je=Ne.layers,He=Ne.devicePlacements,qe=Ne.constraintConflicts,Ke=Ne.focusedRoomId,Ye=Ne.occupancyPanelTarget,Xe=Ne.mmwavePlacements;function Ge(e){Re.value=e,Te.value="select",We.value={type:"none",ids:[]},"occupancy"!==e&&(Ye.value=null)}async function Je(){Ne._reloadFloorData&&await Ne._reloadFloorData()}function Qe(e){const t=e.vertices;if(0===t.length)return"";const o=t.map((e,t)=>`${0===t?"M":"L"}${e.x},${e.y}`);return o.join(" ")+" Z"}function et(e,t){const o=t.x-e.x,i=t.y-e.y;return Math.sqrt(o*o+i*i)}function tt(e,t){return{x:Math.round(e.x/t)*t,y:Math.round(e.y/t)*t}}function ot(e){if(e.length<2)return{anchor:e[0]||{x:0,y:0},dir:{x:1,y:0}};let t=0,o=e[0],i=e[1];for(let n=0;n<e.length;n++)for(let s=n+1;s<e.length;s++){const r=et(e[n],e[s]);r>t&&(t=r,o=e[n],i=e[s])}if(t<1e-9)return{anchor:o,dir:{x:1,y:0}};return{anchor:o,dir:{x:(i.x-o.x)/t,y:(i.y-o.y)/t}}}function it(e,t,o){const i=e.x-t.x,n=e.y-t.y,s=i*o.x+n*o.y;return{x:t.x+s*o.x,y:t.y+s*o.y}}const nt=.05,st=.2,rt="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),at="%c[constraint]",lt="color:#8b5cf6;font-weight:bold",dt="color:#888",ct="color:#ef4444;font-weight:bold",ht="color:#22c55e;font-weight:bold";function pt(e){return`(${e.x.toFixed(1)},${e.y.toFixed(1)})`}function gt(e,t){const o=t.get(e.start_node),i=t.get(e.end_node),n=[];"free"!==e.direction&&n.push(e.direction),e.length_locked&&n.push("len🔒"),e.angle_group&&n.push(`ang:${e.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=o&&i?et(o,i).toFixed(1):"?";return`${e.id.slice(0,8)}… (${r}cm${s})`}function ut(e){return e.slice(0,8)+"…"}function ft(e,t){const o=new Map,i=new Map,n=new Map;for(const t of e)o.set(t.id,t);for(const e of t)i.set(e.id,e),n.has(e.start_node)||n.set(e.start_node,[]),n.get(e.start_node).push({edgeId:e.id,endpoint:"start"}),n.has(e.end_node)||n.set(e.end_node,[]),n.get(e.end_node).push({edgeId:e.id,endpoint:"end"});return{nodes:o,edges:i,nodeToEdges:n}}function _t(e){return"free"!==e.direction||e.length_locked}function yt(e){const t=new Map;for(const[o,i]of e.nodes)t.set(o,{x:i.x,y:i.y});return t}function vt(e,t,o,i,n){let s={x:i.x,y:i.y};if("horizontal"===e.direction?s={x:s.x,y:o.y}:"vertical"===e.direction&&(s={x:o.x,y:s.y}),e.length_locked){const t=et(n.nodes.get(e.start_node),n.nodes.get(e.end_node)),i=s.x-o.x,r=s.y-o.y,a=Math.sqrt(i*i+r*r);if(a>0&&t>0){const e=t/a;s={x:o.x+i*e,y:o.y+r*e}}}return s}function xt(e,t,o,i,n){const s=i.has(e.start_node),r=i.has(e.end_node);if(s&&r)return{idealStart:t,idealEnd:o};if(s){return{idealStart:t,idealEnd:vt(e,e.start_node,t,o,n)}}if(r){return{idealStart:vt(e,e.end_node,o,t,n),idealEnd:o}}return function(e,t,o,i){const n=et(i.nodes.get(e.start_node),i.nodes.get(e.end_node));let s={x:t.x,y:t.y},r={x:o.x,y:o.y};if("horizontal"===e.direction){const e=(s.y+r.y)/2;s={x:s.x,y:e},r={x:r.x,y:e}}else if("vertical"===e.direction){const e=(s.x+r.x)/2;s={x:e,y:s.y},r={x:e,y:r.y}}if(e.length_locked){const e=(s.x+r.x)/2,t=(s.y+r.y)/2,o=r.x-s.x,i=r.y-s.y,a=Math.sqrt(o*o+i*i);if(a>0&&n>0){const l=n/2/(a/2);s={x:e-o/2*l,y:t-i/2*l},r={x:e+o/2*l,y:t+i/2*l}}}return{idealStart:s,idealEnd:r}}(e,t,o,n)}function mt(e,t){let o=0;const i=[],n=new Map;for(const[s,r]of e.edges){if(!_t(r))continue;const a=t.get(r.start_node),l=t.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const t=et(e.nodes.get(r.start_node),e.nodes.get(r.end_node)),o=et(a,l);d=Math.max(d,Math.abs(o-t))}n.set(s,d),d>st&&i.push(s),d>o&&(o=d)}const s=wt(e,t);for(const[,r]of s){let s=0;for(const e of r.nodeIds){const o=t.get(e);if(!o)continue;const i=et(o,it(o,r.anchor,r.dir));s=Math.max(s,i)}for(const[t,o]of e.edges)if(o.collinear_group&&r.nodeIds.has(o.start_node)){const e=n.get(t)??0;n.set(t,Math.max(e,s)),s>st&&(i.includes(t)||i.push(t));break}o=Math.max(o,s)}const r=$t(e);for(const[,s]of r){const r=t.get(s.sharedNodeId);if(!r)continue;let a=0;for(let o=0;o<s.edgeIds.length;o++){const i=e.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=t.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=et(r,l);for(let i=o+1;i<s.edgeIds.length;i++){const o=e.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=t.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let p=d-h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;const g=(c+et(r,l))/2;a=Math.max(a,Math.abs(p)*g)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>st&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}const a=Et(e);for(const[,s]of a){const r=[];for(const o of s.edgeIds){const i=e.edges.get(o),n=t.get(i.start_node),s=t.get(i.end_node);n&&s?r.push(et(n,s)):r.push(0)}let a=0;for(const e of r)a=Math.max(a,Math.abs(e-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>st&&(i.includes(s.edgeIds[0])||i.push(s.edgeIds[0]),o=Math.max(o,a))}return{maxViolation:o,violatingEdgeIds:i,magnitudes:n}}function bt(e,t,o,i){const n=function(e,t){const o=[],i=new Set,n=new Set,s=[];for(const e of t)s.push(e),n.add(e);for(;s.length>0;){const t=s.shift(),r=e.nodeToEdges.get(t)||[];for(const{edgeId:a}of r){if(i.has(a))continue;i.add(a);const r=e.edges.get(a);if(!r)continue;o.push(r);const l=r.start_node===t?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return o}(e,t),s=n.filter(_t),r=wt(e,o),a=$t(e),l=Et(e);let d=0,c=0;rt&&(console.groupCollapsed(at+" solveIterative: %c%d constrained edges, %d pinned nodes",lt,dt,s.length,t.size),console.log("  Pinned nodes:",[...t].map(ut).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(t=>gt(t,e.nodes)).join(" | ")||"(none)"),i&&i.size>0&&console.log("  Pre-existing violations:",[...i.entries()].map(([t,o])=>{const i=e.edges.get(t);return(i?gt(i,e.nodes):t.slice(0,8)+"…")+` (${o.toFixed(2)})`}).join(" | ")));for(let i=0;i<100;i++){d=0,c=i+1;const s=0===i?new Set(t):t;for(const r of n){if(!_t(r))continue;const n=o.get(r.start_node),a=o.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=xt(r,n,a,s,e);if(!t.has(r.start_node)){const e=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,e),o.set(r.start_node,l)}if(!t.has(r.end_node)){const e=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,e),o.set(r.end_node,c)}0===i&&(s.add(r.start_node),s.add(r.end_node))}for(const[,e]of r)for(const i of e.nodeIds){if(t.has(i))continue;const n=o.get(i);if(!n)continue;const s=it(n,e.anchor,e.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>nt&&(d=Math.max(d,r),o.set(i,s))}const h=kt(e,a,t,o);d=Math.max(d,h);const p=Pt(e,l,t,o);if(d=Math.max(d,p),d<nt)break}const h=[];for(const[t,i]of o){const o=e.nodes.get(t);(Math.abs(i.x-o.x)>nt||Math.abs(i.y-o.y)>nt)&&h.push({nodeId:t,x:i.x,y:i.y})}if(d<nt)rt&&console.log(at+" %cConverged%c in %d iteration(s), %d node(s) moved",lt,ht,"",c,h.length);else{const{violatingEdgeIds:t,maxViolation:n,magnitudes:s}=mt(e,o),r=[];for(const e of t)if(i){const t=i.get(e);if(void 0===t)r.push(e);else{(s.get(e)??0)>t+nt&&r.push(e)}}else r.push(e);if(r.length>0)return rt&&(console.log(`${at} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,lt,ct,""),console.log("  All violating edges:",t.map(t=>{const o=e.edges.get(t);return o?gt(o,e.nodes):t.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",r.map(t=>{const i=e.edges.get(t);if(!i)return t.slice(0,8)+"…";const n=o.get(i.start_node),s=o.get(i.end_node),r=n&&s?` now ${pt(n)}→${pt(s)}`:"";return gt(i,e.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};rt&&console.log(`${at} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,lt,"color:#f59e0b;font-weight:bold","")}return rt&&console.groupEnd(),{updates:h,blocked:!1}}function wt(e,t){const o=new Map,i=new Map;for(const[,t]of e.edges){if(!t.collinear_group)continue;i.has(t.collinear_group)||i.set(t.collinear_group,new Set);const e=i.get(t.collinear_group);e.add(t.start_node),e.add(t.end_node)}for(const[e,n]of i){const i=[];for(const e of n){const o=t.get(e);o&&i.push(o)}if(i.length<2)continue;const{anchor:s,dir:r}=ot(i);o.set(e,{nodeIds:n,anchor:s,dir:r})}return o}function $t(e){const t=new Map,o=new Map;for(const[,t]of e.edges)t.angle_group&&(o.has(t.angle_group)||o.set(t.angle_group,[]),o.get(t.angle_group).push(t.id));for(const[i,n]of o){if(n.length<2)continue;const o=n.map(t=>e.edges.get(t)),s=new Map;for(const e of o)s.set(e.start_node,(s.get(e.start_node)??0)+1),s.set(e.end_node,(s.get(e.end_node)??0)+1);let r=null;for(const[e,t]of s)if(t===n.length){r=e;break}if(!r)continue;const a=e.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const t of o){const o=t.start_node===r?t.end_node:t.start_node,i=e.nodes.get(o);if(!i){d=!1;break}l.push(Math.atan2(i.y-a.y,i.x-a.x))}d&&t.set(i,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return t}function kt(e,t,o,i){let n=0;for(const[,s]of t){const t=i.get(s.sharedNodeId);if(!t)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let o=0;o<r;o++){const n=e.edges.get(s.edgeIds[o]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=i.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-t.y,h.x-t.x))}if(!c)continue;const h=[];for(let e=0;e<r;e++){let t=d[e]-s.originalAngles[e];for(;t>Math.PI;)t-=2*Math.PI;for(;t<-Math.PI;)t+=2*Math.PI;h.push(t)}const p=a.map(e=>o.has(e)),g=p.filter(Boolean).length;if(g===r)continue;let u=0,f=0;if(g>0)for(let e=0;e<r;e++)p[e]&&(u+=Math.sin(h[e]),f+=Math.cos(h[e]));else for(let e=0;e<r;e++)u+=Math.sin(h[e]),f+=Math.cos(h[e]);const _=Math.atan2(u,f);for(let e=0;e<r;e++){if(p[e])continue;const o=s.originalAngles[e]+_,r=et(t,l[e]),d={x:t.x+Math.cos(o)*r,y:t.y+Math.sin(o)*r},c=Math.max(Math.abs(d.x-l[e].x),Math.abs(d.y-l[e].y));n=Math.max(n,c),i.set(a[e],d)}}return n}function Et(e){const t=new Map,o=new Map;for(const[,t]of e.edges)t.link_group&&(o.has(t.link_group)||o.set(t.link_group,[]),o.get(t.link_group).push(t.id));for(const[i,n]of o){if(n.length<2)continue;let o=0;for(const t of n){const i=e.edges.get(t);o+=et(e.nodes.get(i.start_node),e.nodes.get(i.end_node))}t.set(i,{edgeIds:n,targetLength:o/n.length})}return t}function Pt(e,t,o,i){let n=0;for(const[,s]of t)for(const t of s.edgeIds){const r=e.edges.get(t),a=i.get(r.start_node),l=i.get(r.end_node);if(!a||!l)continue;const d=et(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=nt)continue;const c=o.has(r.start_node),h=o.has(r.end_node);if(c&&h)continue;const p=l.x-a.x,g=l.y-a.y,u=s.targetLength/d;if(c){const e={x:a.x+p*u,y:a.y+g*u},t=Math.max(Math.abs(e.x-l.x),Math.abs(e.y-l.y));n=Math.max(n,t),i.set(r.end_node,e)}else if(h){const e={x:l.x-p*u,y:l.y-g*u},t=Math.max(Math.abs(e.x-a.x),Math.abs(e.y-a.y));n=Math.max(n,t),i.set(r.start_node,e)}else{const e=(a.x+l.x)/2,t=(a.y+l.y)/2,o=s.targetLength/2/(d/2),c={x:e-p/2*o,y:t-g/2*o},h={x:e+p/2*o,y:t+g/2*o},u=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),i.set(r.start_node,c),i.set(r.end_node,h)}}return n}function Mt(e,t,o,i){let n=o,s=i;const r=function(e,t){const o=e.nodeToEdges.get(t);if(!o)return null;for(const{edgeId:t}of o){const o=e.edges.get(t);if(o?.collinear_group)return o.collinear_group}return null}(e,t);if(r){const t=function(e,t){const o=new Set;for(const[,i]of e.edges)i.collinear_group===t&&(o.add(i.start_node),o.add(i.end_node));return o}(e,r),a=[];for(const o of t){const t=e.nodes.get(o);t&&a.push({x:t.x,y:t.y})}if(a.length>=2){const{anchor:e,dir:t}=ot(a),r=it({x:o,y:i},e,t);n=r.x,s=r.y}}const a=yt(e),{magnitudes:l}=mt(e,a),d=yt(e);d.set(t,{x:n,y:s});const c=new Set([t]);for(const[o,i]of e.nodes)i.pinned&&o!==t&&c.add(o);const h=bt(e,c,d,l),p=h.updates.some(e=>e.nodeId===t);if(!p){const o=e.nodes.get(t);o.x===n&&o.y===s||h.updates.unshift({nodeId:t,x:n,y:s})}const g=h.updates.find(e=>e.nodeId===t);if(g&&(g.x=n,g.y=s),h.updates=h.updates.filter(o=>o.nodeId===t||!e.nodes.get(o.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:t,magnitudes:o}=mt(e,d),i=[];for(const e of t){const t=l.get(e);if(void 0===t)i.push(e);else{(o.get(e)??0)>t+nt&&i.push(e)}}i.length>0&&(h.blocked=!0,h.blockedBy=i)}return h}function St(e,t,o){const i=e.edges.get(t);if(!i)return{updates:[],blocked:!1};if(rt&&console.log(at+" solveEdgeLengthChange: %c%s → %scm",lt,dt,gt(i,e.nodes),o.toFixed(1)),i.length_locked)return rt&&console.log(at+" %c→ BLOCKED: edge is length-locked",lt,ct),{updates:[],blocked:!0,blockedBy:[i.id]};const n=e.nodes.get(i.start_node),s=e.nodes.get(i.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===et(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(e,t){const o=t.get(e.start_node),i=t.get(e.end_node);return Math.atan2(i.y-o.y,i.x-o.x)}(i,e.nodes),d=o/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},p=yt(e);p.set(i.start_node,c),p.set(i.end_node,h);const g=new Set([i.start_node,i.end_node]);for(const[t,o]of e.nodes)o.pinned&&g.add(t);const u=bt(e,g,p);return u.updates.some(e=>e.nodeId===i.start_node)||u.updates.unshift({nodeId:i.start_node,x:c.x,y:c.y}),u.updates.some(e=>e.nodeId===i.end_node)||u.updates.push({nodeId:i.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(t=>t.nodeId===i.start_node||t.nodeId===i.end_node||!e.nodes.get(t.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function Ct(e){const t=new Map;for(const o of e)t.set(o.nodeId,{x:o.x,y:o.y});return t}function At(e,t,o,i,n){const s=Mt(ft(e,t),o,i,n);return{positions:Ct(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function zt(e,t,o){const i=e.edges.get(t);if(!i)return{updates:[],blocked:!1};const n=e.nodes.get(i.start_node),s=e.nodes.get(i.end_node);rt&&(console.group(at+" solveConstraintSnap: %csnap %s → %s",lt,dt,gt(i,e.nodes),o),console.log(`  Nodes: ${ut(i.start_node)} ${pt(n)} → ${ut(i.end_node)} ${pt(s)}`));const r=function(e,t,o){if("free"===t)return null;const i=o.get(e.start_node),n=o.get(e.end_node);if(!i||!n)return null;const s=(i.x+n.x)/2,r=(i.y+n.y)/2,a=et(i,n)/2;if("horizontal"===t){if(Math.round(i.y)===Math.round(n.y))return null;const t=i.x<=n.x;return{nodeUpdates:[{nodeId:e.start_node,x:t?s-a:s+a,y:r},{nodeId:e.end_node,x:t?s+a:s-a,y:r}]}}if("vertical"===t){if(Math.round(i.x)===Math.round(n.x))return null;const t=i.y<=n.y;return{nodeUpdates:[{nodeId:e.start_node,x:s,y:t?r-a:r+a},{nodeId:e.end_node,x:s,y:t?r+a:r-a}]}}return null}(i,o,e.nodes);if(!r)return rt&&(console.log(at+" %cAlready satisfies %s — no-op",lt,ht,o),console.groupEnd()),{updates:[],blocked:!1};const a=yt(e),{magnitudes:l}=mt(e,a),d=r.nodeUpdates.find(e=>e.nodeId===i.start_node),c=r.nodeUpdates.find(e=>e.nodeId===i.end_node);rt&&console.log(`  Snap target: ${ut(i.start_node)} ${pt(d)} → ${ut(i.end_node)} ${pt(c)}`);const h=yt(e);h.set(i.start_node,{x:d.x,y:d.y}),h.set(i.end_node,{x:c.x,y:c.y});const p=new Set([i.start_node,i.end_node]);for(const[t,o]of e.nodes)o.pinned&&p.add(t);const g=bt(e,p,h,l);return g.updates.some(e=>e.nodeId===i.start_node)||g.updates.unshift({nodeId:i.start_node,x:d.x,y:d.y}),g.updates.some(e=>e.nodeId===i.end_node)||g.updates.push({nodeId:i.end_node,x:c.x,y:c.y}),g.updates=g.updates.filter(t=>t.nodeId===i.start_node||t.nodeId===i.end_node||!e.nodes.get(t.nodeId)?.pinned),rt&&(g.blocked?console.log(at+" %c→ SNAP BLOCKED by: %s",lt,ct,(g.blockedBy||[]).map(t=>{const o=e.edges.get(t);return o?gt(o,e.nodes):t.slice(0,8)+"…"}).join(" | ")):console.log(at+" %c→ Snap OK%c, %d node(s) to update",lt,ht,"",g.updates.length),console.groupEnd()),g}function It(e,t,o=.2){const i=new Map;for(const t of e)i.set(t.id,t);const n=[];for(const e of t){const t=i.get(e.start_node),s=i.get(e.end_node);if(t&&s)if("horizontal"===e.direction){const i=Math.abs(t.y-s.y);i>o&&n.push({edgeId:e.id,type:"direction",expected:0,actual:i})}else if("vertical"===e.direction){const i=Math.abs(t.x-s.x);i>o&&n.push({edgeId:e.id,type:"direction",expected:0,actual:i})}}const s=new Map,r=new Map;for(const e of t)e.collinear_group&&(s.has(e.collinear_group)||(s.set(e.collinear_group,new Set),r.set(e.collinear_group,e.id)),s.get(e.collinear_group).add(e.start_node),s.get(e.collinear_group).add(e.end_node));for(const[e,t]of s){const s=[];for(const e of t){const t=i.get(e);t&&s.push({x:t.x,y:t.y})}if(s.length<2)continue;const{anchor:a,dir:l}=ot(s);let d=0;for(const e of s){const t=it(e,a,l);d=Math.max(d,et(e,t))}d>o&&n.push({edgeId:r.get(e),type:"collinear",expected:0,actual:d})}const a=new Map;for(const e of t)e.link_group&&(a.has(e.link_group)||a.set(e.link_group,[]),a.get(e.link_group).push(e.id));for(const[,e]of a){if(e.length<2)continue;const s=[];for(const o of e){const e=t.find(e=>e.id===o),n=i.get(e.start_node),r=i.get(e.end_node);n&&r?s.push(et(n,r)):s.push(0)}const r=s.reduce((e,t)=>e+t,0)/s.length;let a=0;for(const e of s)a=Math.max(a,Math.abs(e-r));a>o&&n.push({edgeId:e[0],type:"link_group",expected:r,actual:a})}return n}function Lt(e){const t=new Map;for(const o of e)t.set(o.id,o);return t}function Dt(e,t){const o=t.get(e.start_node),i=t.get(e.end_node);return o&&i?{...e,startPos:{x:o.x,y:o.y},endPos:{x:i.x,y:i.y}}:null}function Nt(e){const t=Lt(e.nodes),o=[];for(const i of e.edges){const e=Dt(i,t);e&&o.push(e)}return o}function Ft(e,t){return t.filter(t=>t.start_node===e||t.end_node===e)}function Ot(e,t,o){let i=null,n=o;for(const o of t){const t=Math.sqrt((e.x-o.x)**2+(e.y-o.y)**2);t<n&&(n=t,i=o)}return i}function Rt(e){let t=0;const o=e.length;for(let i=0;i<o;i++){const n=(i+1)%o;t+=e[i].x*e[n].y,t-=e[n].x*e[i].y}return t/2}function Tt(e){const t=e.length;if(t<3){let o=0,i=0;for(const t of e)o+=t.x,i+=t.y;return{x:o/t,y:i/t}}let o=0,i=0,n=0;for(let s=0;s<t;s++){const r=(s+1)%t,a=e[s].x*e[r].y-e[r].x*e[s].y;o+=a,i+=(e[s].x+e[r].x)*a,n+=(e[s].y+e[r].y)*a}if(o/=2,Math.abs(o)<1e-6){let o=0,i=0;for(const t of e)o+=t.x,i+=t.y;return{x:o/t,y:i/t}}const s=1/(6*o);return{x:i*s,y:n*s}}const Wt=ke([]),Bt=ke([]),Zt=ke(!1),Ut=Ce(()=>Wt.value.length>0&&!Zt.value),Vt=Ce(()=>Bt.value.length>0&&!Zt.value);function jt(e){Wt.value=[...Wt.value.slice(-99),e],Bt.value=[]}async function Ht(){const e=Wt.value;if(0===e.length||Zt.value)return;const t=e[e.length-1];Zt.value=!0;try{await t.undo()}finally{Zt.value=!1}Wt.value=e.slice(0,-1),Bt.value=[...Bt.value,t]}async function qt(){const e=Bt.value;if(0===e.length||Zt.value)return;const t=e[e.length-1];Zt.value=!0;try{await t.redo()}finally{Zt.value=!1}Bt.value=e.slice(0,-1),Wt.value=[...Wt.value,t]}function Kt(){Wt.value=[],Bt.value=[]}const Yt=85*Math.PI/180;function Xt(e,t,o,i,n,s){const r=n*Math.PI/180,a=s?1:-1,l=Math.cos(r),d=a*Math.sin(r),c=o-e,h=i-t,p=e+l*c-d*h,g=t+d*c+l*h,u=p-e,f=g-t,_=a*(4/3)*Math.tan(r/4);return{ox:p,oy:g,cp1x:o-_*h,cp1y:i+_*c,cp2x:p+_*f,cp2y:g-_*u}}const Gt=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function Jt(e){let t=0;for(let o=0;o<e.length;o++)t=(t<<5)-t+e.charCodeAt(o);return Gt[Math.abs(t)%Gt.length]}class Qt extends le{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._entitySearch="",this._openingPreview=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,this._zoneEditor=null,this._draggingZone=null,this._draggingZoneVertex=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=r`
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

    /* --- Zone / Furniture styles --- */
    .zone-shape {
      cursor: pointer;
      transition: fill-opacity 0.2s ease;
    }

    .zone-shape:hover {
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
      cursor: pointer;
    }

    .zone-area-shape:hover {
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
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(De(()=>{this._viewBox=Be.value}),De(()=>{this._canvasMode=Re.value}),De(()=>{const e=Oe.value;e&&e.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=e.id,requestAnimationFrame(()=>this._fitToFloor(e)))}),De(()=>{const e=Ke.value,t=this._focusedRoomId;this._focusedRoomId=e,e?requestAnimationFrame(()=>this._animateToRoom(e)):null!==t&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas()}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const e=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=e}catch(e){console.error("Error loading HA areas:",e)}}_handleWheel(e){e.preventDefault(),this._cancelViewBoxAnimation();const t=e.deltaY>0?1.1:.9,o=this._screenToSvg({x:e.clientX,y:e.clientY}),i=this._viewBox.width*t,n=this._viewBox.height*t;if(i<100||i>1e4)return;const s={x:o.x-(o.x-this._viewBox.x)*t,y:o.y-(o.y-this._viewBox.y)*t,width:i,height:n};Be.value=s,this._viewBox=s}_handlePointerDown(e){const t=this._screenToSvg({x:e.clientX,y:e.clientY}),o=Te.value,i=this._getSnappedPoint(t,"device"===o||"wall"===o||"zone"===o),n=this._canvasMode;if(this._pendingDevice&&"device"!==Te.value&&(this._pendingDevice=null),1===e.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},void this._svg?.setPointerCapture(e.pointerId);if("viewing"===n&&0===e.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},void this._svg?.setPointerCapture(e.pointerId);if(0===e.button)if("select"===o){const o=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null;if(this._handleSelectClick(t,e.shiftKey)){if("zone"===We.value.type&&1===We.value.ids.length){const o=Oe.value,i=o?.zones?.find(e=>e.id===We.value.ids[0]);i?.polygon?.vertices&&(this._draggingZone={zone:i,startPoint:t,originalVertices:i.polygon.vertices.map(e=>({x:e.x,y:e.y})),hasMoved:!1,pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId))}}else o&&(We.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},this._svg?.setPointerCapture(e.pointerId)}else if("wall"===o){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const t=this._wallStartPoint&&e.shiftKey?this._cursorPos:i;this._handleWallClick(t,e.shiftKey)}else"device"===o?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(i)):"door"===o||"window"===o?this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(o)):"zone"===o?(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._handleZonePolyClick(this._cursorPos)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},this._svg?.setPointerCapture(e.pointerId))}_handleDeviceClick(e){this._pendingDevice={position:e},this._entitySearch=""}async _placeOpening(e){if(!this.hass||!this._openingPreview)return;const t=Oe.value,o=Fe.value;if(!t||!o)return;const i=this.hass,n=o.id,s=t.id,{edgeId:r,t:a,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,p="door"===e?80:100,g=e,u={...l},f={...d},_=c,y={...h};try{const t=await i.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:r,position:a,new_type:g,width:p,..."door"===e?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await Je(),await this._syncRoomsWithEdges();const o=t.edges.map(e=>e.id);jt({type:"opening_place",description:`Place ${e}`,undo:async()=>{for(const e of o)try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:e})}catch{}await i.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:f,thickness:_}),await Je(),await this._syncRoomsWithEdges()},redo:async()=>{const t=Oe.value;if(!t)return;const o=Nt(t).find(e=>{if("wall"!==e.type)return!1;const t=this._getClosestPointOnSegment(y,e.startPos,e.endPos);return Math.sqrt((t.x-y.x)**2+(t.y-y.y)**2)<5});o&&await i.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:o.id,position:a,new_type:g,width:p,..."door"===e?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await Je(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error placing opening:",e)}}_handlePointerMove(e){const t=this._screenToSvg({x:e.clientX,y:e.clientY}),o=Te.value;let i=this._getSnappedPoint(t,"device"===o||"wall"===o||"zone"===o);if(e.shiftKey&&"wall"===o&&this._wallStartPoint){i=Math.abs(i.x-this._wallStartPoint.x)>=Math.abs(i.y-this._wallStartPoint.y)?{x:i.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:i.y}}if("zone"===o&&this._zonePolyPoints.length>0){const e=this._zonePolyPoints[this._zonePolyPoints.length-1],t=Math.abs(i.x-e.x),o=Math.abs(i.y-e.y),n=15;o<n&&t>n?i={x:i.x,y:e.y}:t<n&&o>n&&(i={x:e.x,y:i.y})}if(this._cursorPos=i,this._draggingZone){const e=t.x-this._draggingZone.startPoint.x,o=t.y-this._draggingZone.startPoint.y;if(!this._draggingZone.hasMoved&&(Math.abs(e)>3||Math.abs(o)>3)&&(this._draggingZone.hasMoved=!0),this._draggingZone.hasMoved){const t=this._draggingZone.zone;if(t.polygon?.vertices){const i={x:this._draggingZone.originalVertices[0].x+e,y:this._draggingZone.originalVertices[0].y+o},n=Ue.value?tt(i,Ze.value):i,s=n.x-i.x,r=n.y-i.y;for(let i=0;i<t.polygon.vertices.length;i++)t.polygon.vertices[i]={x:this._draggingZone.originalVertices[i].x+e+s,y:this._draggingZone.originalVertices[i].y+o+r}}this.requestUpdate()}return}if(this._draggingZoneVertex){let e=this._getSnappedPoint(t,!0);const o=this._draggingZoneVertex.zone;if(o.polygon?.vertices){const t=o.polygon.vertices,i=this._draggingZoneVertex.vertexIndex,n=t.length,s=t[(i-1+n)%n],r=t[(i+1)%n],a=15;for(const t of[s,r])Math.abs(e.x-t.x)<a&&(e={x:t.x,y:e.y}),Math.abs(e.y-t.y)<a&&(e={x:e.x,y:t.y});t[i]={x:e.x,y:e.y}}return void this.requestUpdate()}if(this._draggingNode){const o=e.clientX-this._draggingNode.startX,i=e.clientY-this._draggingNode.startY;return(Math.abs(o)>3||Math.abs(i)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(t),void this.requestUpdate()}if(this._isPanning){const t=(e.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),o=(e.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),i={...this._viewBox,x:this._viewBox.x-t,y:this._viewBox.y-o};return this._panStart={x:e.clientX,y:e.clientY},Be.value=i,void(this._viewBox=i)}this._wallStartPoint||"select"!==o||"walls"!==this._canvasMode||this._checkNodeHover(t),"zone"===o&&this._zonePolyPoints.length>0&&this.requestUpdate(),"door"!==o&&"window"!==o||this._updateOpeningPreview(t)}_checkNodeHover(e){const t=Oe.value;if(!t)return void(this._hoveredNode=null);const o=Ot(e,t.nodes,15);this._hoveredNode=o}_updateOpeningPreview(e){const t=Oe.value;if(!t)return void(this._openingPreview=null);const o=Nt(t);let i=null,n=30,s=e,r=0;for(const t of o){if("wall"!==t.type)continue;const o=this._getClosestPointOnSegment(e,t.startPos,t.endPos),a=Math.sqrt((e.x-o.x)**2+(e.y-o.y)**2);if(a<n){n=a,i=t,s=o;const e=t.endPos.x-t.startPos.x,l=t.endPos.y-t.startPos.y,d=e*e+l*l;r=d>0?((o.x-t.startPos.x)*e+(o.y-t.startPos.y)*l)/d:0}}this._openingPreview=i?{edgeId:i.id,position:s,startPos:i.startPos,endPos:i.endPos,thickness:i.thickness,t:r}:null,this.requestUpdate()}_handlePointerUp(e){if(this._draggingZone){if(this._draggingZone.hasMoved)this._finishZoneDrag();else if("occupancy"===this._canvasMode){const e=this._draggingZone.zone,t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;Ye.value={id:e.id,name:t,type:"zone"}}else{const e=this._draggingZone.zone;this._zoneEditor={zone:e,editName:e.name,editColor:e.color,editAreaId:e.ha_area_id??null}}return this._svg?.releasePointerCapture(e.pointerId),void(this._draggingZone=null)}return this._draggingZoneVertex?(this._finishZoneVertexDrag(),this._svg?.releasePointerCapture(e.pointerId),void(this._draggingZoneVertex=null)):this._draggingNode?(this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(e.pointerId)):void(this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(e.pointerId)))}async _handleDblClick(e){if("walls"!==this._canvasMode)return;const t=this._screenToSvg({x:e.clientX,y:e.clientY}),o=Oe.value,i=Fe.value;if(!o||!i||!this.hass)return;const n=Ot(t,o.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Nt(o);for(const e of s){if(this._pointToSegmentDistance(t,e.startPos,e.endPos)<e.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:i.id,floor_id:o.id,edge_id:e.id,point:{x:t.x,y:t.y}}),await Je(),await this._syncRoomsWithEdges()}catch(e){console.error("Failed to split edge:",e)}return}}}async _handleContextMenu(e){if("walls"!==this._canvasMode)return;e.preventDefault();const t=this._screenToSvg({x:e.clientX,y:e.clientY}),o=Oe.value,i=Fe.value;if(!o||!i||!this.hass)return;const n=Ot(t,o.nodes,15);if(!n)return;if(2===Ft(n.id,o.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:i.id,floor_id:o.id,node_id:n.id}),await Je(),await this._syncRoomsWithEdges(),this._hoveredNode=null,We.value={type:"none",ids:[]},this._edgeEditor=null}catch(e){console.error("Failed to dissolve node:",e)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Te.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const e=Oe.value,t=Fe.value;if(!e||!t)return void(this._draggingNode=null);const o=this._cursorPos,i=this._draggingNode.originalCoords;if(Math.abs(o.x-i.x)<1&&Math.abs(o.y-i.y)<1)return void(this._draggingNode=null);const n=Mt(ft(e.nodes,e.edges),this._draggingNode.node.id,o.x,o.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:n.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await Je()})}catch(e){console.error("Error updating node:",e),alert(`Failed to update node: ${e}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=function(e,t,o=.5){const i=new Map;for(const t of e)i.set(t.id,t);const n=[];for(const e of t){const t=i.get(e.start_node),s=i.get(e.end_node);t&&s&&et(t,s)<=o&&n.push(e.id)}return n}(e.nodes,e.edges);if(0!==o.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",o.length,o.map(e=>e.slice(0,8)+"…").join(", "));try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:t.id,floor_id:e.id,edge_id:i});await Je(),await this._syncRoomsWithEdges()}catch(e){console.error("Error removing degenerate edges:",e)}}}_handleKeyDown(e){"Escape"===e.key?(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._draggingZone=null,this._draggingZoneVertex=null,this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,We.value={type:"none",ids:[]},Te.value="select"):"Backspace"!==e.key&&"Delete"!==e.key||!this._zoneEditor?"Backspace"!==e.key&&"Delete"!==e.key||!this._multiEdgeEditor?"Backspace"!==e.key&&"Delete"!==e.key||!this._edgeEditor?"z"!==e.key||!e.ctrlKey&&!e.metaKey||e.shiftKey?("z"===e.key&&(e.ctrlKey||e.metaKey)&&e.shiftKey||"y"===e.key&&(e.ctrlKey||e.metaKey))&&(e.preventDefault(),qt()):(e.preventDefault(),Ht()):(e.preventDefault(),this._handleEdgeDelete()):(e.preventDefault(),this._handleMultiEdgeDelete()):(e.preventDefault(),this._handleZoneDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._edgeEditor.edge,i=parseFloat(this._editingLength);if(isNaN(i)||i<=0)return;const n=Math.abs(i-this._edgeEditor.length)>=.01,s=this._editingDirection!==o.direction,r=this._editingLengthLocked!==o.length_locked,a="door"===o.type||"window"===o.type,l=a&&this._editingOpeningParts!==(o.opening_parts??"single"),d=a&&this._editingOpeningType!==(o.opening_type??"swing"),c=a&&this._editingSwingDirection!==(o.swing_direction??"left"),h=a&&(this._editingEntityId??null)!==(o.entity_id??null),p=s||r||l||d||c||h;try{if(s){if(!await this._applyDirection(o,this._editingDirection))return}if(n&&await this._updateEdgeLength(o,i),p){const i=Oe.value;if(i&&r){const e={};s&&(e.direction=this._editingDirection),r&&(e.length_locked=this._editingLengthLocked);const t=function(e,t,o,i){if(rt){const e=Object.entries(i).map(([e,t])=>`${e}=${t}`).join(", ");console.group(at+" checkConstraintsFeasible: %cedge %s → {%s}",lt,dt,o.slice(0,8)+"…",e)}const n=ft(e,t),s=yt(n),{magnitudes:r}=mt(n,s),a=t.map(e=>e.id!==o?e:{...e,...void 0!==i.direction&&{direction:i.direction},...void 0!==i.length_locked&&{length_locked:i.length_locked},...void 0!==i.angle_group&&{angle_group:i.angle_group??void 0}}),l=ft(e,a),d=yt(l),c=new Set;for(const[e,t]of l.nodes)t.pinned&&c.add(e);const h=bt(l,c,d,r);return h.blocked?(rt&&(console.log(at+" %c→ NOT FEASIBLE%c — blocked by: %s",lt,ct,"",(h.blockedBy||[]).map(e=>{const t=l.edges.get(e);return t?gt(t,l.nodes):e.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(rt&&(console.log(at+" %c→ Feasible",lt,ht),console.groupEnd()),{feasible:!0})}(i.nodes,i.edges,o.id,e);if(!t.feasible)return void(t.blockedBy&&this._blinkEdges(t.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:t.id,floor_id:e.id,edge_id:o.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await Je()}}catch(e){console.error("Error applying edge changes:",e)}this._edgeEditor=null,We.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,We.value={type:"none",ids:[]}}async _setDoorOpensToSide(e,t){if(!this.hass)return;if("a"===e)return;const o=Oe.value,i=Fe.value;if(!o||!i)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:i.id,floor_id:o.id,edge_id:t.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await Je();const e=Oe.value;if(e){const o=e.edges.find(e=>e.id===t.id);o&&this._updateEdgeEditorForSelection([o.id])}}catch(e){console.error("Error flipping door side:",e)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this.hass,i=t.id,n=e.id,s=this._edgeEditor.edge,r=Lt(e.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Je(),await this._syncRoomsWithEdges(),jt({type:"edge_delete",description:"Delete edge",undo:async()=>{const e=await o.callWS({type:"inhabit/edges/add",floor_plan_id:i,floor_id:n,...d});c.id=e.edge.id,await Je(),await this._syncRoomsWithEdges()},redo:async()=>{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:i,floor_id:n,edge_id:c.id}),await Je(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error deleting edge:",e)}this._edgeEditor=null,We.value={type:"none",ids:[]}}_handleEditorKeyDown(e){"Enter"===e.key?this._handleEditorSave():"Escape"===e.key&&this._handleEditorCancel()}async _withNodeUndo(e,t,o){if(!this.hass)return;const i=Oe.value,n=Fe.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l=new Map;for(const t of e){const e=i.nodes.find(e=>e.id===t.nodeId);e&&l.set(e.id,{x:e.x,y:e.y})}await o(),await this._syncRoomsWithEdges();const d=Oe.value;if(!d)return;const c=new Map;for(const t of e){const e=d.nodes.find(e=>e.id===t.nodeId);e&&c.set(e.id,{x:e.x,y:e.y})}const h=async e=>{const t=Array.from(e.entries()).map(([e,t])=>({node_id:e,x:t.x,y:t.y}));t.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:t}),await Je(),await this._syncRoomsWithEdges()};jt({type:"node_update",description:t,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(e,t){if(!this.hass)return;const o=Oe.value,i=Fe.value;if(!o||!i)return;const n=o.edges.map(t=>t.id===e.id?{...t,length_locked:!1}:t),s=St(ft(o.nodes,n),e.id,t);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await Je()})}catch(e){console.error("Error updating edge length:",e),alert(`Failed to update edge: ${e}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(e){const t=Oe.value;if(t){const o=this._draggingNode?.node.id,i=Ot(e,o?t.nodes.filter(e=>e.id!==o):t.nodes,15);if(i)return{x:i.x,y:i.y};if(o){const i=new Set(Ft(o,t.edges).map(e=>`${e.start_node}-${e.end_node}`)),n=Nt(t);let s=null,r=15;for(const t of n){const o=`${t.start_node}-${t.end_node}`;if(i.has(o))continue;const n=this._getClosestPointOnSegment(e,t.startPos,t.endPos),a=Math.sqrt((e.x-n.x)**2+(e.y-n.y)**2);a<r&&(r=a,s=n)}if(s)return s}}return{x:Math.round(e.x),y:Math.round(e.y)}}_getSnappedPoint(e,t=!1){const o=Oe.value;if(!o)return Ue.value?tt(e,Ze.value):e;const i=Ot(e,o.nodes,15);if(i)return{x:i.x,y:i.y};if(t){const t=Nt(o);let i=null,n=15;for(const o of t){const t=this._getClosestPointOnSegment(e,o.startPos,o.endPos),s=Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2));s<n&&(n=s,i=t)}if(i)return i}return Ue.value?tt(e,Ze.value):e}_getClosestPointOnSegment(e,t,o){const i=o.x-t.x,n=o.y-t.y,s=i*i+n*n;if(0===s)return t;const r=Math.max(0,Math.min(1,((e.x-t.x)*i+(e.y-t.y)*n)/s));return{x:t.x+r*i,y:t.y+r*n}}_handleSelectClick(e,t=!1){const o=Oe.value;if(!o)return!1;const i=this._canvasMode;if("walls"===i){const i=Nt(o);for(const o of i){if(this._pointToSegmentDistance(e,o.startPos,o.endPos)<o.thickness/2+5){if(t&&"edge"===We.value.type){const e=[...We.value.ids],t=e.indexOf(o.id);return t>=0?e.splice(t,1):e.push(o.id),We.value={type:"edge",ids:e},this._updateEdgeEditorForSelection(e),!0}return We.value={type:"edge",ids:[o.id]},this._updateEdgeEditorForSelection([o.id]),!0}}}if("placement"===i){const t=He.value.filter(e=>e.floor_id===o.id);for(const o of t){if(Math.sqrt(Math.pow(e.x-o.position.x,2)+Math.pow(e.y-o.position.y,2))<15)return We.value={type:"device",ids:[o.id]},!0}}if(("furniture"===i||"occupancy"===i)&&o.zones){const t=[...o.zones];for(const o of t)if(o.polygon?.vertices&&this._pointInPolygon(e,o.polygon.vertices)){if("occupancy"===i){We.value={type:"zone",ids:[o.id]};const e=o.ha_area_id?this._haAreas.find(e=>e.area_id===o.ha_area_id)?.name??o.name:o.name;return Ye.value={id:o.id,name:e,type:"zone"},!0}return We.value={type:"zone",ids:[o.id]},!0}}if("walls"===i||"occupancy"===i)for(const t of o.rooms)if(this._pointInPolygon(e,t.polygon.vertices)){We.value={type:"room",ids:[t.id]};const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name;return"occupancy"===i?Ye.value={id:t.id,name:e,type:"room"}:this._roomEditor={room:t,editName:e,editColor:t.color,editAreaId:t.ha_area_id??null},!0}return We.value={type:"none",ids:[]},!1}_updateEdgeEditorForSelection(e){const t=Oe.value;if(!t)return;if(0===e.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const o=Lt(t.nodes);if(1===e.length){const i=t.edges.find(t=>t.id===e[0]);if(i){const e=o.get(i.start_node),t=o.get(i.end_node);if(e&&t){const o=this._calculateWallLength(e,t);this._edgeEditor={edge:i,position:{x:(e.x+t.x)/2,y:(e.y+t.y)/2},length:o},this._editingLength=Math.round(o).toString(),this._editingLengthLocked=i.length_locked,this._editingDirection=i.direction,this._editingOpeningParts=i.opening_parts??"single",this._editingOpeningType=i.opening_type??"swing",this._editingSwingDirection=i.swing_direction??"left",this._editingEntityId=i.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const i=e.map(e=>t.edges.find(t=>t.id===e)).filter(e=>!!e),n=[];for(const e of i){const t=o.get(e.start_node),i=o.get(e.end_node);t&&n.push({x:t.x,y:t.y}),i&&n.push({x:i.x,y:i.y})}const s=function(e,t=2){if(e.length<2)return!0;if(2===e.length)return!0;let o=0,i=e[0],n=e[1];for(let t=0;t<e.length;t++)for(let s=t+1;s<e.length;s++){const r=et(e[t],e[s]);r>o&&(o=r,i=e[t],n=e[s])}if(o<1e-9)return!0;const s=n.x-i.x,r=n.y-i.y,a=Math.sqrt(s*s+r*r);for(const o of e)if(Math.abs((o.x-i.x)*r-(o.y-i.y)*s)/a>t)return!1;return!0}(n);let r;if(s){r=0;for(const e of i){const t=o.get(e.start_node),i=o.get(e.end_node);t&&i&&(r+=this._calculateWallLength(t,i))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:i,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(e,t,o){const i=o.x-t.x,n=o.y-t.y,s=i*i+n*n;if(0===s)return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2));const r=Math.max(0,Math.min(1,((e.x-t.x)*i+(e.y-t.y)*n)/s)),a=t.x+r*i,l=t.y+r*n;return Math.sqrt(Math.pow(e.x-a,2)+Math.pow(e.y-l,2))}_handleWallClick(e,t=!1){if(this._wallStartPoint){let o="free";if(t){o=Math.abs(e.x-this._wallStartPoint.x)>=Math.abs(e.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,e,o);const i=Oe.value,n=i?.nodes.some(t=>Math.abs(e.x-t.x)<1&&Math.abs(e.y-t.y)<1);this._wallChainStart&&Math.abs(e.x-this._wallChainStart.x)<1&&Math.abs(e.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Te.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=e}else this._wallStartPoint=e,this._wallChainStart=e}async _completeWall(e,t,o="free"){if(!this.hass)return;const i=Oe.value,n=Fe.value;if(!i||!n)return;const s=this.hass,r=n.id,a=i.id,l={id:""};try{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:e,end:t,thickness:6,direction:o});l.id=i.edge.id,await Je(),await this._syncRoomsWithEdges(),jt({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await Je(),await this._syncRoomsWithEdges()},redo:async()=>{const i=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:e,end:t,thickness:6,direction:o});l.id=i.edge.id,await Je(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error creating edge:",e)}}_screenToSvg(e){if(!this._svg)return e;const t=this._svg.getScreenCTM();if(t){const o=t.inverse();return{x:o.a*e.x+o.c*e.y+o.e,y:o.b*e.x+o.d*e.y+o.f}}const o=this._svg.getBoundingClientRect(),i=this._viewBox.width/o.width,n=this._viewBox.height/o.height;return{x:this._viewBox.x+(e.x-o.left)*i,y:this._viewBox.y+(e.y-o.top)*n}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(e){const t=Oe.value;if(!t)return;const o=t.rooms.find(t=>t.id===e);if(!o||0===o.polygon.vertices.length)return;const i=o.polygon.vertices.map(e=>e.x),n=o.polygon.vertices.map(e=>e.y),s=Math.min(...i),r=Math.max(...i),a=Math.min(...n),l=Math.max(...n),d=r-s,c=l-a;let h=d+2*(.15*Math.max(d,50)),p=c+2*(.15*Math.max(c,50));const g=this._svg?.getBoundingClientRect(),u=g&&g.width>0&&g.height>0?g.width/g.height:1.25;h/p>u?p=h/u:h=p*u;const f=(s+r)/2,_=(a+l)/2;this._animateViewBox({x:f-h/2,y:_-p/2,width:h,height:p},400)}_animateToFloor(){const e=Oe.value;if(!e)return;const t=[],o=[];for(const i of e.nodes)t.push(i.x),o.push(i.y);for(const i of e.rooms)for(const e of i.polygon.vertices)t.push(e.x),o.push(e.y);for(const i of He.value)i.floor_id===e.id&&(t.push(i.position.x),o.push(i.position.y));if(0===t.length)return;const i=Math.min(...t),n=Math.max(...t),s=Math.min(...o),r=Math.max(...o),a=n-i,l=r-s;let d=a+2*(.1*Math.max(a,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),p=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>p?c=d/p:d=c*p;const g=(i+n)/2,u=(s+r)/2;this._animateViewBox({x:g-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(e,t){this._cancelViewBoxAnimation();const o={...this._viewBox},i=performance.now(),n=s=>{const r=s-i,a=Math.min(r/t,1),l=1-Math.pow(1-a,3),d={x:o.x+(e.x-o.x)*l,y:o.y+(e.y-o.y)*l,width:o.width+(e.width-o.width)*l,height:o.height+(e.height-o.height)*l};this._viewBox=d,Be.value=d,this._viewBoxAnimation=a<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(e){const t=[],o=[];for(const i of e.nodes)t.push(i.x),o.push(i.y);for(const i of e.rooms)for(const e of i.polygon.vertices)t.push(e.x),o.push(e.y);for(const i of He.value)i.floor_id===e.id&&(t.push(i.position.x),o.push(i.position.y));if(0===t.length)return;const i=Math.min(...t),n=Math.max(...t),s=Math.min(...o),r=Math.max(...o),a=n-i,l=r-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=a+2*(.1*Math.max(a,50)),p=l+2*(.1*Math.max(l,50));h/p>c?p=h/c:h=p*c;const g={x:(i+n)/2-h/2,y:(s+r)/2-p/2,width:h,height:p};Be.value=g,this._viewBox=g}_pointInPolygon(e,t){if(t.length<3)return!1;let o=!1;const i=t.length;for(let n=0,s=i-1;n<i;s=n++){const i=t[n],r=t[s];i.y>e.y!=r.y>e.y&&e.x<(r.x-i.x)*(e.y-i.y)/(r.y-i.y)+i.x&&(o=!o)}return o}_getRandomRoomColor(){const e=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return e[Math.floor(Math.random()*e.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=function(e,t){if(0===t.length)return[];const o=new Map;for(const t of e)o.set(t.id,t);const i=new Map,n=(e,t)=>{const n=o.get(e),s=o.get(t);if(!n||!s)return;if(e===t)return;const r=Math.atan2(s.y-n.y,s.x-n.x);i.has(e)||i.set(e,[]),i.get(e).push({targetId:t,angle:r})};for(const e of t)n(e.start_node,e.end_node),n(e.end_node,e.start_node);for(const[,e]of i)e.sort((e,t)=>e.angle-t.angle);const s=new Set,r=[],a=(e,t)=>`${e}->${t}`;for(const[e,t]of i)for(const n of t){const t=a(e,n.targetId);if(s.has(t))continue;const l=[];let d=e,c=n.targetId,h=!0;for(let t=0;t<1e3;t++){const t=a(d,c);if(s.has(t)){h=!1;break}s.add(t),l.push(d);const r=o.get(d),p=o.get(c),g=Math.atan2(r.y-p.y,r.x-p.x),u=i.get(c);if(!u||0===u.length){h=!1;break}let f=null;for(const e of u)if(e.angle>g){f=e;break}if(f||(f=u[0]),d=c,c=f.targetId,d===e&&c===n.targetId)break;if(d===e)break}h&&l.length>=3&&r.push(l.map(e=>{const t=o.get(e);return{x:t.x,y:t.y}}))}const l=[];for(const e of r){const t=Rt(e),o=Math.abs(t);if(o<100)continue;if(t>0)continue;const i=Tt(e);l.push({vertices:e,area:o,centroid:i})}const d=new Map;for(const e of l){const t=e.vertices.map(e=>`${Math.round(e.x)},${Math.round(e.y)}`).sort().join("|");(!d.has(t)||d.get(t).area<e.area)&&d.set(t,e)}return Array.from(d.values())}(e.nodes,e.edges),i=[...e.rooms],n=new Set;let s=this._getNextRoomNumber(i)-1;for(const r of o){let o=null,a=0;for(const e of i){if(n.has(e.id))continue;const t=e.polygon.vertices,i=r.vertices,s=this._getPolygonCenter(t);if(!s)continue;const l=r.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;t.length===i.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>a&&(a=c,o=e)}if(o){n.add(o.id);if(this._verticesChanged(o.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:t.id,room_id:o.id,polygon:{vertices:r.vertices}})}catch(e){console.error("Error updating room polygon:",e)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:t.id,floor_id:e.id,name:`Room ${s}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(e){console.error("Error creating auto-detected room:",e)}}}for(const e of i)if(!n.has(e.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:e.id})}catch(e){console.error("Error deleting orphaned room:",e)}await Je()}_verticesChanged(e,t){if(e.length!==t.length)return!0;for(let o=0;o<e.length;o++)if(Math.abs(e[o].x-t[o].x)>1||Math.abs(e[o].y-t[o].y)>1)return!0;return!1}_getNextRoomNumber(e){let t=0;for(const o of e){const e=o.name.match(/^Room (\d+)$/);e&&(t=Math.max(t,parseInt(e[1],10)))}return t+1}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const{room:o,editName:i,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:t.id,room_id:o.id,name:i,color:n,ha_area_id:s}),await Je()}catch(e){console.error("Error updating room:",e)}this._roomEditor=null,We.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,We.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const e=Fe.value;if(e){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:this._roomEditor.room.id}),await Je()}catch(e){console.error("Error deleting room:",e)}this._roomEditor=null,We.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;return V`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Room Properties</span>
          <button class="wall-editor-close" @click=${this._handleRoomEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">HA Area</span>
          <select
            class="wall-editor-select"
            .value=${this._roomEditor.editAreaId??""}
            @change=${e=>{if(this._roomEditor){const t=e.target.value,o=this._haAreas.find(e=>e.area_id===t);this._roomEditor={...this._roomEditor,editAreaId:t||null,editName:o?o.name:this._roomEditor.editName}}}}
          >
            <option value="">None</option>
            ${this._haAreas.map(e=>V`
              <option value=${e.area_id} ?selected=${this._roomEditor?.editAreaId===e.area_id}>${e.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Name</span>
          <input
            type="text"
            .value=${this._roomEditor.editName}
            ?disabled=${!!this._roomEditor.editAreaId}
            @input=${e=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editName:e.target.value})}}
            @keydown=${e=>{"Enter"===e.key?this._handleRoomEditorSave():"Escape"===e.key&&this._handleRoomEditorCancel()}}
          />
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Color</span>
          <div class="wall-editor-colors">
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(e=>V`
              <button
                class="color-swatch ${this._roomEditor?.editColor===e?"active":""}"
                style="background:${e};"
                @click=${()=>{this._roomEditor&&(this._roomEditor={...this._roomEditor,editColor:e})}}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleRoomEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleRoomDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}_renderEdgeChains(e,t,o=null){const i=Nt(e);let n=i.map(e=>({id:e.id,start_node:e.start_node,end_node:e.end_node,startPos:e.startPos,endPos:e.endPos,thickness:e.thickness,type:e.type,opening_parts:e.opening_parts,opening_type:e.opening_type,swing_direction:e.swing_direction,entity_id:e.entity_id}));if(this._draggingNode){const{positions:t,blocked:o,blockedBy:s}=At(e.nodes,e.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);o?s&&this._blinkEdges(s):n=i.map(e=>({id:e.id,start_node:e.start_node,end_node:e.end_node,startPos:t.get(e.start_node)??e.startPos,endPos:t.get(e.end_node)??e.endPos,thickness:e.thickness,type:e.type,opening_parts:e.opening_parts,opening_type:e.opening_type,swing_direction:e.swing_direction,entity_id:e.entity_id}))}const s=function(e){const t=e.filter(e=>"wall"===e.type);if(0===t.length)return[];const o=new Set,i=[];for(const e of t){if(o.has(e.id))continue;const n=[e];o.add(e.id);let s=e.end_node,r=!0;for(;r;){r=!1;for(const e of t)if(!o.has(e.id)){if(e.start_node===s){n.push(e),o.add(e.id),s=e.end_node,r=!0;break}if(e.end_node===s){n.push({...e,start_node:e.end_node,end_node:e.start_node,startPos:e.endPos,endPos:e.startPos}),o.add(e.id),s=e.start_node,r=!0;break}}}let a=e.start_node;for(r=!0;r;){r=!1;for(const e of t)if(!o.has(e.id)){if(e.end_node===a){n.unshift(e),o.add(e.id),a=e.start_node,r=!0;break}if(e.start_node===a){n.unshift({...e,start_node:e.end_node,end_node:e.start_node,startPos:e.endPos,endPos:e.startPos}),o.add(e.id),a=e.end_node,r=!0;break}}}i.push(n)}return i}(n),r="edge"===t.type?n.filter(e=>t.ids.includes(e.id)):[],a=qe.value.get(e.id),l=a?new Set(a.map(e=>e.edgeId)):new Set,d=n.filter(e=>"door"===e.type||"window"===e.type),c=[];for(const e of s)if(o){let t=[],i=!1;for(const n of e){const e=o.has(n.id);0===t.length?(t.push(n),i=e):e===i?t.push(n):(c.push({edges:t,dimClass:i?"edges-focused":"edges-dimmed"}),t=[n],i=e)}t.length>0&&c.push({edges:t,dimClass:i?"edges-focused":"edges-dimmed"})}else c.push({edges:e,dimClass:""});return j`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(e=>j`
        <path class="wall ${e.dimClass}"
              d="${function(e){if(0===e.length)return"";const t=e[0].thickness/2,o=[e[0].start];for(const t of e)o.push(t.end);const i=o.length>2&&Math.abs(o[0].x-o[o.length-1].x)<1&&Math.abs(o[0].y-o[o.length-1].y)<1,n=[],s=[];for(let e=0;e<o.length;e++){const r=o[e];let a,l=null,d=null;if(e>0||i){const t=o[e>0?e-1:o.length-2],i=r.x-t.x,n=r.y-t.y,s=Math.sqrt(i*i+n*n);s>0&&(l={x:i/s,y:n/s})}if(e<o.length-1||i){const t=o[e<o.length-1?e+1:1],i=t.x-r.x,n=t.y-r.y,s=Math.sqrt(i*i+n*n);s>0&&(d={x:i/s,y:n/s})}if(l&&d){const e={x:-l.y,y:l.x},t={x:-d.y,y:d.x},o=e.x+t.x,i=e.y+t.y,n=Math.sqrt(o*o+i*i);if(n<.01)a=e;else{a={x:o/n,y:i/n};const t=e.x*a.x+e.y*a.y;if(Math.abs(t)>.1){const e=1/t,o=Math.min(Math.abs(e),3)*Math.sign(e);a={x:a.x*o,y:a.y*o}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:r.x+a.x*t,y:r.y+a.y*t}),s.push({x:r.x-a.x*t,y:r.y-a.y*t})}const r=Math.min(.8*t,4);let a=`M${n[0].x},${n[0].y}`;for(let e=1;e<n.length;e++)if(e<n.length-1&&n.length>2){const t=n[e-1],o=n[e],i=n[e+1],s=o.x-t.x,l=o.y-t.y,d=Math.sqrt(s*s+l*l),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=o.x-s/d*g,t=o.y-l/d*g,i=o.x+c/p*u,n=o.y+h/p*u;a+=` L${e},${t} Q${o.x},${o.y} ${i},${n}`}else a+=` L${o.x},${o.y}`}else a+=` L${n[e].x},${n[e].y}`;const l=[...s].reverse();if(i){a+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let e=s.length-2;e>=0;e--){const t=s.length-1-e;if(t>0&&t<s.length-1){const t=s[e+1],o=s[e],i=s[e-1],n=o.x-t.x,l=o.y-t.y,d=Math.sqrt(n*n+l*l),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=o.x-n/d*g,t=o.y-l/d*g,i=o.x+c/p*u,s=o.y+h/p*u;a+=` L${e},${t} Q${o.x},${o.y} ${i},${s}`}else a+=` L${o.x},${o.y}`}else a+=` L${s[e].x},${s[e].y}`}}else for(let e=0;e<l.length;e++)if(e>0&&e<l.length-1&&l.length>2){const t=l[e-1],o=l[e],i=l[e+1],n=o.x-t.x,s=o.y-t.y,d=Math.sqrt(n*n+s*s),c=i.x-o.x,h=i.y-o.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=o.x-n/d*g,t=o.y-s/d*g,i=o.x+c/p*u,r=o.y+h/p*u;a+=` L${e},${t} Q${o.x},${o.y} ${i},${r}`}else a+=` L${o.x},${o.y}`}else a+=` L${l[e].x},${l[e].y}`;return a+=" Z",a}(e.edges.map(e=>({start:e.startPos,end:e.endPos,thickness:e.thickness})))}"/>
      `)}

      <!-- Door and window openings -->
      ${d.map(e=>{const t=this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness}),i=!!o&&o.has(e.id),n=o?i?"edges-focused":"edges-dimmed":"";let s=0;if(e.entity_id&&this.hass?.states[e.entity_id]){const t=this.hass.states[e.entity_id],o=t.state;if("on"===o||"open"===o){const o="door"===e.type?Yt:Math.PI/2,i=t.attributes.current_position;s=void 0!==i&&i>=0&&i<=100?i/100*o:o}}const r=this._swingAngles.get(e.id)??0;let a=r;const l=s-r;Math.abs(l)>.001?(a=r+.15*l,this._swingAngles.set(e.id,a),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):a!==s&&(a=s,this._swingAngles.set(e.id,s));const d=e.endPos.x-e.startPos.x,c=e.endPos.y-e.startPos.y,h=Math.sqrt(d*d+c*c);if(0===h)return null;const p=d/h,g=c/h,u=-g,f=p,_=e.opening_parts??"single",y=e.opening_type??"swing",v="window"===e.type?"window":"door";if("swing"===y){const t=.5*e.thickness,o=.7*e.thickness,i=1.5,s=(e,i)=>{const n=e.x,s=e.y,r=n+p*i*t,a=s+g*i*t;return`M${n-u*o},${s-f*o}\n                    L${n+u*o},${s+f*o}\n                    L${r+u*o},${a+f*o}\n                    L${r-u*o},${a-f*o} Z`},r=t+i,l={x:e.startPos.x+p*r,y:e.startPos.y+g*r},d={x:e.endPos.x-p*r,y:e.endPos.y-g*r},c=e.swing_direction??"left",y="right"===c?e.endPos:e.startPos,x="right"===c?-1:1,m=y.x+p*x*t+u*(e.thickness/2),b=y.y+g*x*t+f*(e.thickness/2);if("door"===v){const t=e.thickness/2,o=y.x+u*t,i=y.y+f*t,r="right"===c?e.startPos:e.endPos,p=r.x+u*t,g=r.y+f*t,_=Xt(o,i,p,g,85,"left"===c),v=`M${o},${i} L${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy} Z`,x=Math.cos(a),w=Math.sin(a),$="left"===c?1:-1,k=e=>{const t=e.x-m,o=e.y-b;return{x:m+x*t-$*w*o,y:b+$*w*t+x*o}},E=k(l),P=k(d),M=this._singleEdgePath({start:E,end:P,thickness:e.thickness});return j`
              <g class="${n}">
                ${this._fadedWedge(e.id,v,o,i,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy}"/>
                <path class="opening-stop" d="${s(e.startPos,1)}"/>
                <path class="opening-stop" d="${s(e.endPos,-1)}"/>
                <path class="door-closed-segment" d="${M}"/>
                <circle class="metal-hinge" cx="${m}" cy="${b}" r="2.5"/>
              </g>
            `}const w=e.thickness/2,$=y.x+u*w,k=y.y+f*w,E="right"===c?e.startPos:e.endPos,P=E.x+u*w,M=E.y+f*w,S=$+u*h,C=k+f*h,A=.5522847498,z=P+A*(S-$),I=M+A*(C-k),L=S+A*(P-$),D=C+A*(M-k),N=`M${P},${M} C${z},${I} ${L},${D} ${S},${C}`,F=`M${$},${k} L${P},${M} C${z},${I} ${L},${D} ${S},${C} Z`;if("double"===_){const o=(l.x+d.x)/2,r=(l.y+d.y)/2,c=.5*i,_=(e.startPos.x+e.endPos.x)/2,y=(e.startPos.y+e.endPos.y)/2,v=h/2,x=e.startPos.x+u*w,m=e.startPos.y+f*w,b=e.endPos.x+u*w,$=e.endPos.y+f*w,k=_+u*w,E=y+f*w,P=x+u*v,M=m+f*v,S=b+u*v,C=$+f*v,z=k+A*(P-x),I=E+A*(M-m),L=P+A*(k-x),D=M+A*(E-m),N=k+A*(S-b),F=E+A*(C-$),O=S+A*(k-b),R=C+A*(E-$),T=`M${x},${m} L${k},${E} C${z},${I} ${L},${D} ${P},${M} Z`,W=`M${b},${$} L${k},${E} C${N},${F} ${O},${R} ${S},${C} Z`,B=Math.cos(a),Z=Math.sin(a),U=(e,t,o,i)=>{const n=e.x-t,s=e.y-o;return{x:t+B*n-i*Z*s,y:o+i*Z*n+B*s}},V=e.startPos.x+p*t+u*(e.thickness/2),H=e.startPos.y+g*t+f*(e.thickness/2),q=e.endPos.x-p*t+u*(e.thickness/2),K=e.endPos.y-g*t+f*(e.thickness/2),Y={x:o-p*c,y:r-g*c},X={x:o+p*c,y:r+g*c},G=this._singleEdgePath({start:U(l,V,H,1),end:U(Y,V,H,1),thickness:e.thickness}),J=this._singleEdgePath({start:U(X,q,K,-1),end:U(d,q,K,-1),thickness:e.thickness});return j`
              <g class="${n}">
                ${this._fadedWedge(`${e.id}-l`,T,x,m,v,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${e.id}-r`,W,b,$,v,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${k},${E} C${z},${I} ${L},${D} ${P},${M}"/>
                <path class="door-swing"
                      d="M${k},${E} C${N},${F} ${O},${R} ${S},${C}"/>
                <path class="opening-stop" d="${s(e.startPos,1)}"/>
                <path class="opening-stop" d="${s(e.endPos,-1)}"/>
                <path class="window-closed-segment" d="${G}"/>
                <path class="window-closed-segment" d="${J}"/>
              </g>
            `}const O=Math.cos(a),R=Math.sin(a),T="left"===c?1:-1,W=e=>{const t=e.x-m,o=e.y-b;return{x:m+O*t-T*R*o,y:b+T*R*t+O*o}},B=this._singleEdgePath({start:W(l),end:W(d),thickness:e.thickness});return j`
            <g class="${n}">
              ${this._fadedWedge(e.id,F,$,k,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${N}"/>
              <path class="opening-stop" d="${s(e.startPos,1)}"/>
              <path class="opening-stop" d="${s(e.endPos,-1)}"/>
              <path class="window-closed-segment" d="${B}"/>
            </g>
          `}if("sliding"===y){const o=.3*e.thickness,i=3,s=e.endPos.x+u*o,r=e.endPos.y+f*o,a=e.startPos.x-u*o,l=e.startPos.y-f*o;return j`
            <g class="${n}">
              <path class="${v}" d="${t}"/>
              <line class="door-swing"
                    x1="${e.startPos.x+u*o}" y1="${e.startPos.y+f*o}"
                    x2="${s}" y2="${r}"/>
              <polygon class="sliding-arrow"
                       points="${s},${r} ${s-p*i+u*i*.5},${r-g*i+f*i*.5} ${s-p*i-u*i*.5},${r-g*i-f*i*.5}"/>
              <line class="door-swing"
                    x1="${e.endPos.x-u*o}" y1="${e.endPos.y-f*o}"
                    x2="${a}" y2="${l}"/>
              <polygon class="sliding-arrow"
                       points="${a},${l} ${a+p*i+u*i*.5},${l+g*i+f*i*.5} ${a+p*i-u*i*.5},${l+g*i-f*i*.5}"/>
              ${"window"===v?j`
                <line class="window-pane"
                      x1="${e.startPos.x}" y1="${e.startPos.y}"
                      x2="${e.endPos.x}" y2="${e.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${e.startPos.x-u*e.thickness/2}" y1="${e.startPos.y-f*e.thickness/2}" x2="${e.startPos.x+u*e.thickness/2}" y2="${e.startPos.y+f*e.thickness/2}"/>
              <line class="door-jamb" x1="${e.endPos.x-u*e.thickness/2}" y1="${e.endPos.y-f*e.thickness/2}" x2="${e.endPos.x+u*e.thickness/2}" y2="${e.endPos.y+f*e.thickness/2}"/>
            </g>
          `}if("tilt"===y){const o=(e.startPos.x+e.endPos.x)/2,i=(e.startPos.y+e.endPos.y)/2,s=.25*h;return j`
            <g class="${n}">
              <path class="${v}" d="${t}"/>
              <line class="window-pane"
                    x1="${e.startPos.x}" y1="${e.startPos.y}"
                    x2="${e.endPos.x}" y2="${e.endPos.y}"/>
              <line class="door-swing"
                    x1="${e.startPos.x}" y1="${e.startPos.y}"
                    x2="${o+u*s}" y2="${i+f*s}"/>
              <line class="door-swing"
                    x1="${e.endPos.x}" y1="${e.endPos.y}"
                    x2="${o+u*s}" y2="${i+f*s}"/>
              <line class="door-jamb" x1="${e.startPos.x-u*e.thickness/2}" y1="${e.startPos.y-f*e.thickness/2}" x2="${e.startPos.x+u*e.thickness/2}" y2="${e.startPos.y+f*e.thickness/2}"/>
              <line class="door-jamb" x1="${e.endPos.x-u*e.thickness/2}" y1="${e.endPos.y-f*e.thickness/2}" x2="${e.endPos.x+u*e.thickness/2}" y2="${e.endPos.y+f*e.thickness/2}"/>
            </g>
          `}return null})}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${l.size>0?n.filter(e=>l.has(e.id)).map(e=>j`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
        `):null}

      <!-- Selected edge highlights -->
      ${r.map(e=>j`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(e=>{const t=n.find(t=>t.id===e);return t?j`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
        `:null}):null}
    `}_fadedWedge(e,t,o,i,n,s){return j`
      <defs>
        <radialGradient id="wg-${e}" cx="${o}" cy="${i}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path d="${t}" fill="url(#wg-${e})" stroke="none"/>
    `}_singleEdgePath(e){const{start:t,end:o,thickness:i}=e,n=o.x-t.x,s=o.y-t.y,r=Math.sqrt(n*n+s*s);if(0===r)return"";const a=-s/r*(i/2),l=n/r*(i/2);return`M${t.x+a},${t.y+l}\n            L${o.x+a},${o.y+l}\n            L${o.x-a},${o.y-l}\n            L${t.x-a},${t.y-l}\n            Z`}_blinkEdges(e){this._blinkTimer&&clearTimeout(this._blinkTimer);const t=Array.isArray(e)?e:[e];this._blinkingEdgeIds=t;const o=Oe.value;if(o){const e=t.map(e=>{const t=o.edges.find(t=>t.id===e);if(!t)return e.slice(0,8)+"…";const i=o.nodes.find(e=>e.id===t.start_node),n=o.nodes.find(e=>e.id===t.end_node),s=i&&n?Math.sqrt((n.x-i.x)**2+(n.y-i.y)**2).toFixed(1):"?",r=[];return"free"!==t.direction&&r.push(t.direction),t.length_locked&&r.push("len-locked"),t.angle_group&&r.push(`ang:${t.angle_group.slice(0,4)}`),`${e.slice(0,8)}… (${s}cm${r.length?" "+r.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${t.length} blocked edge(s):\n  ${e.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(e,t){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))}_formatLength(e){return e>=100?`${(e/100).toFixed(2)}m`:`${Math.round(e)}cm`}_getRoomEdgeIds(e,t){const o=t.rooms.find(t=>t.id===e);if(!o)return new Set;const i=o.polygon.vertices;if(i.length<2)return new Set;const n=[];for(const e of i){const o=Ot(e,t.nodes,5);o&&n.push(o.id)}if(n.length<2)return new Set;const s=new Map;for(const e of t.edges)s.set(`${e.start_node}|${e.end_node}`,e.id),s.set(`${e.end_node}|${e.start_node}`,e.id);const r=new Set;for(let e=0;e<n.length;e++){const t=n[e],o=n[(e+1)%n.length],i=s.get(`${t}|${o}`);i&&r.add(i)}return r}_renderFloor(){const e=Oe.value;if(!e)return null;const t=We.value,o=je.value,i=this._focusedRoomId,n=i?this._getRoomEdgeIds(i,e):null;return j`
      <!-- Background layer -->
      ${o.find(e=>"background"===e.id)?.visible&&e.background_image?j`
        <image href="${e.background_image}"
               x="0" y="0"
               width="${1e3*e.background_scale}"
               height="${800*e.background_scale}"
               opacity="${o.find(e=>"background"===e.id)?.opacity??1}"
               class="${i?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer -->
      ${o.find(e=>"structure"===e.id)?.visible?j`
        <g class="structure-layer" opacity="${o.find(e=>"structure"===e.id)?.opacity??1}">
          <!-- Rooms -->
          ${e.rooms.map(e=>j`
            <path class="room ${"room"===t.type&&t.ids.includes(e.id)?"selected":""} ${i?e.id===i?"room-focused":"room-dimmed":""}"
                  d="${Qe(e.polygon)}"
                  fill="${e.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}

          <!-- Edges (rendered as chains for proper corners) -->
          ${this._renderEdgeChains(e,t,n)}
        </g>
      `:null}

      <!-- Furniture layer -->
      ${o.find(e=>"furniture"===e.id)?.visible?j`
        <g class="furniture-layer-container" opacity="${o.find(e=>"furniture"===e.id)?.opacity??1}">
          ${this._renderFurnitureLayer()}
        </g>
      `:null}

      <!-- Labels layer -->
      ${o.find(e=>"labels"===e.id)?.visible?j`
        <g class="labels-layer" opacity="${o.find(e=>"labels"===e.id)?.opacity??1}">
          ${e.rooms.map(e=>{const t=this._getPolygonCenter(e.polygon.vertices);if(!t)return null;const o=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name,n=!!e.ha_area_id;return j`
              <g class="room-label-group ${i?e.id===i?"label-focused":"label-dimmed":""}" transform="translate(${t.x}, ${t.y})">
                <text class="room-label" x="0" y="0">
                  ${o}
                </text>
                ${n?j`
                  <g class="room-link-icon" transform="translate(${3.8*o.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}

      <!-- Devices layer -->
      ${o.find(e=>"devices"===e.id)?.visible?j`
        <g class="devices-layer" opacity="${o.find(e=>"devices"===e.id)?.opacity??1}">
          ${He.value.filter(t=>t.floor_id===e.id).map(e=>j`
              <g class="${i?e.room_id===i?"device-focused":"device-dimmed":""}">
                ${this._renderDevice(e)}
              </g>
            `)}
        </g>
      `:null}

      <!-- mmWave sensors layer -->
      ${o.find(e=>"devices"===e.id)?.visible?this._renderMmwaveLayer(e):null}
    `}_renderDevice(e){const t=this.hass?.states[e.entity_id],o="on"===t?.state,i=We.value;return j`
      <g class="device-marker ${o?"on":"off"} ${"device"===i.type&&i.ids.includes(e.id)?"selected":""}"
         transform="translate(${e.position.x}, ${e.position.y}) rotate(${e.rotation})">
        <circle r="12" fill="${o?"#ffd600":"#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${e.show_label?j`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${e.label||t?.attributes.friendly_name||e.entity_id}
          </text>
        `:null}
      </g>
    `}_renderMmwaveLayer(e){const t=Xe.value.filter(t=>t.floor_id===e.id);if(0===t.length)return null;const o=We.value;return j`
      <g class="mmwave-layer">
        ${t.map(e=>{const t="device"===o.type&&o.ids.includes(e.id),i=e.wall_normal_angle+e.angle,n=e.field_of_view/2,s=e.detection_range,r=(i-n)*Math.PI/180,a=(i+n)*Math.PI/180,l=e.mount_x+s*Math.cos(r),d=e.mount_y+s*Math.sin(r),c=e.mount_x+s*Math.cos(a),h=e.mount_y+s*Math.sin(a),p=e.field_of_view>180?1:0;return j`
            <g class="mmwave-placement ${t?"selected":""}">
              <!-- FOV cone -->
              <path
                d="M ${e.mount_x} ${e.mount_y} L ${l} ${d} A ${s} ${s} 0 ${p} 1 ${c} ${h} Z"
                fill="rgba(33, 150, 243, 0.1)"
                stroke="rgba(33, 150, 243, 0.4)"
                stroke-width="1"
                stroke-dasharray="4 2"
              />
              <!-- Sensor icon -->
              <circle cx="${e.mount_x}" cy="${e.mount_y}" r="8"
                fill="#2196f3" stroke="#fff" stroke-width="2"/>
              <text x="${e.mount_x}" y="${e.mount_y+3}" text-anchor="middle"
                font-size="8" fill="#fff" font-weight="bold">R</text>
            </g>
          `})}
      </g>
    `}_renderNodeGuideDots(){const e=Oe.value;if(!e||0===e.nodes.length)return null;const t=new Set;for(const o of e.edges)t.add(o.start_node),t.add(o.end_node);const o=e.nodes.filter(e=>t.has(e.id));return 0===o.length?null:j`
      <g class="node-guide-dots">
        ${o.map(e=>j`
          <circle cx="${e.x}" cy="${e.y}" r="4"
            fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        `)}
      </g>
    `}_renderNodeEndpoints(){const e=Oe.value;if(!e||0===e.nodes.length)return null;const t=new Set;for(const o of e.edges)t.add(o.start_node),t.add(o.end_node);const o=[];for(const i of e.nodes)i.pinned&&t.has(i.id)&&o.push({node:i,coords:{x:i.x,y:i.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&t.has(this._draggingNode.node.id)){const t=o.findIndex(e=>e.node.id===this._draggingNode.node.id);t>=0&&o.splice(t,1);const{positions:i,blocked:n}=At(e.nodes,e.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:i.get(this._draggingNode.node.id)??this._cursorPos;o.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&t.has(this._hoveredNode.id)&&(o.some(e=>e.node.id===this._hoveredNode.id)||o.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===o.length)return null;return j`
      <g class="wall-endpoints-layer">
        ${o.map(e=>e.isPinned?j`
          <g class="wall-endpoint pinned"
             transform="translate(${e.coords.x}, ${e.coords.y})"
             @pointerdown=${t=>this._handleNodePointerDown(t,e.node)}>
            <rect x="-5" y="-5" width="10" height="10" rx="2" />
            <g transform="translate(-6, -18) scale(0.5)">
              <path d="${"M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"}" fill="var(--primary-color, #2196f3)" />
            </g>
          </g>
        `:j`
          <circle
            class="wall-endpoint ${e.isDragging?"dragging":""}"
            cx="${e.coords.x}"
            cy="${e.coords.y}"
            r="6"
            @pointerdown=${t=>this._handleNodePointerDown(t,e.node)}
          />
        `)}
        ${this._draggingNode?this._renderDraggedEdgeLengths(e):null}
      </g>
    `}_renderDraggedEdgeLengths(e){if(!this._draggingNode)return null;const t=this._cursorPos,{positions:o,blocked:i}=At(e.nodes,e.edges,this._draggingNode.node.id,t.x,t.y);if(i)return null;const n=Nt(e),s=[];for(const e of n){const t=o.get(e.start_node),i=o.get(e.end_node);if(!t&&!i)continue;const n=t??e.startPos,r=i??e.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:e.startPos,origEnd:e.endPos,length:a,angle:l,thickness:e.thickness})}const r=[];for(let e=0;e<s.length;e++)for(let o=e+1;o<s.length;o++){const i=Math.abs(s[e].angle-s[o].angle)%Math.PI;Math.abs(i-Math.PI/2)<.02&&r.push({point:t,angle:Math.min(s[e].angle,s[o].angle)})}return j`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:e,origEnd:t,thickness:o})=>{const i=t.x-e.x,n=t.y-e.y,s=Math.sqrt(i*i+n*n);if(0===s)return null;const r=-n/s*(o/2),a=i/s*(o/2);return j`
          <path
            class="wall-original-ghost"
            d="M${e.x+r},${e.y+a}
               L${t.x+r},${t.y+a}
               L${t.x-r},${t.y-a}
               L${e.x-r},${e.y-a}
               Z"
          />
        `})}

      <!-- Edge length labels -->
      ${s.map(({start:e,end:t,length:o})=>{const i=(e.x+t.x)/2,n=(e.y+t.y)/2,s=Math.atan2(t.y-e.y,t.x-e.x)*(180/Math.PI);return j`
          <g transform="translate(${i}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${r.map(({point:e,angle:t})=>j`
        <g transform="translate(${e.x}, ${e.y}) rotate(${180*t/Math.PI})">
          <path
            class="right-angle-indicator"
            d="M 12 0 L 12 12 L 0 12"
            fill="none"
            stroke="var(--primary-color, #2196f3)"
            stroke-width="2"
          />
        </g>
      `)}
    `}_handleNodePointerDown(e,t){if(2===e.button)return;e.stopPropagation(),e.preventDefault();const o=this._hoveredNode||t;if("wall"===Te.value){const t={x:o.x,y:o.y};return void this._handleWallClick(t,e.shiftKey)}if(o.pinned)return this._wallStartPoint={x:o.x,y:o.y},Te.value="wall",void(this._hoveredNode=null);this._draggingNode={node:o,originalCoords:{x:o.x,y:o.y},startX:e.clientX,startY:e.clientY,hasMoved:!1},this._svg?.setPointerCapture(e.pointerId)}_handleZonePolyClick(e){const t=this._zonePolyPoints;if(t.length>=3){const o=t[0];if(Math.sqrt((e.x-o.x)**2+(e.y-o.y)**2)<15)return this._pendingZonePolygon=[...t],this._zonePolyPoints=[],void this._saveZone("Zone")}this._zonePolyPoints=[...t,e]}async _saveZone(e){if(!this.hass||!this._pendingZonePolygon)return;const t=Oe.value,o=Fe.value;if(t&&o){try{await this.hass.callWS({type:"inhabit/zones/add",floor_plan_id:o.id,floor_id:t.id,name:e,polygon:{vertices:this._pendingZonePolygon.map(e=>({x:e.x,y:e.y}))},color:"#a1c4fd"}),await Je()}catch(e){console.error("Error saving zone:",e)}this._pendingZonePolygon=null}}_renderFurnitureLayer(){const e=Oe.value;if(!e||!e.zones||0===e.zones.length)return null;const t=We.value,o=this._focusedRoomId,i=e.zones;return j`
      <g class="furniture-layer">
        ${i.map(e=>{if(!e.polygon?.vertices?.length)return null;const i=Qe(e.polygon),n="zone"===t.type&&t.ids.includes(e.id),s=this._getPolygonCenter(e.polygon.vertices),r=o?e.room_id===o?"":"room-dimmed":"";return j`
            <g class="${r}">
              <path class="zone-shape ${n?"selected":""}"
                    d="${i}"
                    fill="${e.color||"#a1c4fd"}"
                    fill-opacity="0.35"
                    stroke="${e.color||"#a1c4fd"}"
                    stroke-width="1.5"/>
              ${s?j`
                <text class="zone-label" x="${s.x}" y="${s.y}">${e.name}</text>
              `:null}
              ${n&&!this._draggingZone?this._renderZoneVertexHandles(e):null}
            </g>
          `})}
      </g>
    `}_renderZoneVertexHandles(e){const t=e.polygon?.vertices;return t?.length?j`
      ${t.map((t,o)=>j`
        <circle
          class="zone-vertex-handle"
          cx="${t.x}" cy="${t.y}" r="6"
          fill="white" stroke="${e.color||"#2196f3"}" stroke-width="1.5"
          style="cursor: grab"
          @pointerdown=${i=>{i.stopPropagation(),i.preventDefault(),this._draggingZoneVertex={zone:e,vertexIndex:o,originalCoords:{x:t.x,y:t.y},pointerId:i.pointerId},this._svg?.setPointerCapture(i.pointerId)}}
        />
      `)}
    `:null}_renderFurnitureDrawingPreview(){if("zone"===Te.value&&this._zonePolyPoints.length>0){const e=this._zonePolyPoints,t=this._cursorPos;let o=`M ${e[0].x} ${e[0].y}`;for(let t=1;t<e.length;t++)o+=` L ${e[t].x} ${e[t].y}`;o+=` L ${t.x} ${t.y}`;let i=null;if(e.length>=3){const o=e[0];Math.sqrt((t.x-o.x)**2+(t.y-o.y)**2)<15&&(i=j`<circle cx="${o.x}" cy="${o.y}" r="8" fill="rgba(76, 175, 80, 0.3)" stroke="#4caf50" stroke-width="2"/>`)}return j`
        <g class="furniture-preview">
          <path class="furniture-poly-preview" d="${o}"/>
          ${e.map(e=>j`
            <circle cx="${e.x}" cy="${e.y}" r="4" fill="var(--primary-color, #2196f3)" stroke="white" stroke-width="1.5"/>
          `)}
          ${i}
        </g>
      `}return null}_renderZoneEditor(){if(!this._zoneEditor)return null;return V`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Zone</span>
          <button class="wall-editor-close" @click=${()=>{this._zoneEditor=null,We.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Area</span>
          <select class="wall-editor-select"
            .value=${this._zoneEditor.editAreaId??""}
            @change=${e=>{if(!this._zoneEditor)return;const t=e.target.value,o=this._haAreas.find(e=>e.area_id===t);this._zoneEditor={...this._zoneEditor,editAreaId:t||null,editName:o?o.name:this._zoneEditor.editName}}}
          >
            <option value="">None</option>
            ${this._haAreas.map(e=>V`
              <option value=${e.area_id} ?selected=${this._zoneEditor?.editAreaId===e.area_id}>${e.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Name</span>
          <input
            type="text"
            .value=${this._zoneEditor.editName}
            @input=${e=>{this._zoneEditor&&(this._zoneEditor={...this._zoneEditor,editName:e.target.value})}}
            @keydown=${e=>{"Enter"===e.key?this._handleZoneEditorSave():"Escape"===e.key&&(this._zoneEditor=null,We.value={type:"none",ids:[]})}}
          />
        </div>

        ${this._zoneEditor.zone.polygon?.vertices?.length?V`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Size</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <label style="font-size:11px;">W</label>
              <input type="number" style="width:60px;" .value=${String(this._getZoneBBoxWidth())}
                @change=${e=>this._handleZoneSizeChange("width",parseFloat(e.target.value))}
              />
              <label style="font-size:11px;">H</label>
              <input type="number" style="width:60px;" .value=${String(this._getZoneBBoxHeight())}
                @change=${e=>this._handleZoneSizeChange("height",parseFloat(e.target.value))}
              />
            </div>
          </div>
        `:null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Color</span>
          <div class="wall-editor-colors">
            ${["#a1c4fd","#c5e1a5","#ffe0b2","#d1c4e9","#ffccbc","#b0bec5","#e0e0e0","#f8bbd0"].map(e=>V`
              <button
                class="color-swatch ${this._zoneEditor?.editColor===e?"active":""}"
                style="background:${e};"
                @click=${()=>{this._zoneEditor&&(this._zoneEditor={...this._zoneEditor,editColor:e})}}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleZoneEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleZoneDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `}_getZoneBBoxWidth(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const e=this._zoneEditor.zone.polygon.vertices.map(e=>e.x);return Math.round(Math.max(...e)-Math.min(...e))}_getZoneBBoxHeight(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const e=this._zoneEditor.zone.polygon.vertices.map(e=>e.y);return Math.round(Math.max(...e)-Math.min(...e))}_handleZoneSizeChange(e,t){if(!this._zoneEditor||!this.hass||t<=0)return;const o=this._zoneEditor.zone,i=o.polygon?.vertices;if(!i?.length)return;const n=i.map(e=>e.x),s=i.map(e=>e.y),r=Math.min(...n),a=Math.max(...n),l=Math.min(...s),d=Math.max(...s),c=(r+a)/2,h=(l+d)/2,p=a-r,g=d-l;if(0===p||0===g)return;const u="width"===e?t/p:1,f="height"===e?t/g:1,_=i.map(e=>({x:c+(e.x-c)*u,y:h+(e.y-h)*f}));for(let e=0;e<i.length;e++)i[e]=_[e];this.requestUpdate();const y=Fe.value;y&&this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:y.id,zone_id:o.id,polygon:{vertices:_.map(e=>({x:e.x,y:e.y}))}}).then(()=>Je()).catch(e=>console.error("Error resizing zone:",e))}async _handleZoneEditorSave(){if(!this._zoneEditor||!this.hass)return;const e=Fe.value;if(e){try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:this._zoneEditor.zone.id,name:this._zoneEditor.editName,color:this._zoneEditor.editColor,ha_area_id:this._zoneEditor.editAreaId??""}),await Je()}catch(e){console.error("Error updating zone:",e)}this._zoneEditor=null,We.value={type:"none",ids:[]}}}async _handleZoneDelete(){if(!this._zoneEditor||!this.hass)return;const e=Fe.value;if(e){try{await this.hass.callWS({type:"inhabit/zones/delete",floor_plan_id:e.id,zone_id:this._zoneEditor.zone.id}),await Je()}catch(e){console.error("Error deleting zone:",e)}this._zoneEditor=null,We.value={type:"none",ids:[]}}}async _finishZoneDrag(){if(!this._draggingZone||!this.hass)return;const e=Fe.value;if(!e)return;const t=this._draggingZone.zone;if(t.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:t.id,polygon:{vertices:t.polygon.vertices.map(e=>({x:e.x,y:e.y}))}}),await Je()}catch(e){if(console.error("Error moving zone:",e),t.polygon?.vertices&&this._draggingZone.originalVertices)for(let e=0;e<t.polygon.vertices.length;e++)t.polygon.vertices[e]=this._draggingZone.originalVertices[e]}}async _finishZoneVertexDrag(){if(!this._draggingZoneVertex||!this.hass)return;const e=Fe.value;if(!e)return;const t=this._draggingZoneVertex.zone;if(t.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:t.id,polygon:{vertices:t.polygon.vertices.map(e=>({x:e.x,y:e.y}))}}),await Je()}catch(e){console.error("Error moving zone vertex:",e),t.polygon?.vertices&&this._draggingZoneVertex&&(t.polygon.vertices[this._draggingZoneVertex.vertexIndex]=this._draggingZoneVertex.originalCoords)}}_renderDrawingPreview(){if("wall"===Te.value&&this._wallStartPoint){const e=this._wallStartPoint,t=this._cursorPos,o=this._calculateWallLength(e,t),i=(e.x+t.x)/2,n=(e.y+t.y)/2,s=Math.atan2(t.y-e.y,t.x-e.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return j`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${e.x}" y1="${e.y}"
                x2="${t.x}" y2="${t.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${i}, ${n}) rotate(${r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(o)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const e=Te.value;if("door"!==e&&"window"!==e)return null;const{position:t,startPos:o,endPos:i,thickness:n}=this._openingPreview,s="door"===e?80:100,r=i.x-o.x,a=i.y-o.y,l=Math.sqrt(r*r+a*a);if(0===l)return null;const d=r/l,c=a/l,h=-c,p=d,g=s/2,u=n/2,f=t.x,_=t.y,y=`M${f-d*g+h*u},${_-c*g+p*u}\n                      L${f+d*g+h*u},${_+c*g+p*u}\n                      L${f+d*g-h*u},${_+c*g-p*u}\n                      L${f-d*g-h*u},${_-c*g-p*u}\n                      Z`;if("window"===e)return j`
        <g class="opening-ghost">
          <path class="window" d="${y}"/>
          <line class="window-pane"
                x1="${f}" y1="${_}"
                x2="${f+h*n}" y2="${_+p*n}"/>
        </g>
      `;const v=f-d*g,x=_-c*g,m=f+d*g,b=_+c*g,w=Xt(v,x,m,b,85,!0),$=w.ox-v,k=w.oy-x,E=Math.sqrt($*$+k*k),P=E>0?-k/E*1.25:0,M=E>0?$/E*1.25:0,S=`M${v+P},${x+M} L${w.ox+P},${w.oy+M} L${w.ox-P},${w.oy-M} L${v-P},${x-M} Z`,C=`M${v},${x} L${m},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy} Z`,A=f-d*g,z=_-c*g,I=f+d*g,L=_+c*g;return j`
      <g class="opening-ghost">
        <path class="door" d="${y}"/>
        <path class="swing-wedge" d="${C}"/>
        <path class="door-leaf-panel" d="${S}"/>
        <path class="door-swing"
              d="M${m},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy}"/>
        <line class="door-jamb" x1="${A-h*u}" y1="${z-p*u}" x2="${A+h*u}" y2="${z+p*u}"/>
        <line class="door-jamb" x1="${I-h*u}" y1="${L-p*u}" x2="${I+h*u}" y2="${L+p*u}"/>
        <circle class="hinge-glow" cx="${v}" cy="${x}" r="5"/>
        <circle class="hinge-dot" cx="${v}" cy="${x}" r="3"/>
      </g>
    `}_getPolygonCenter(e){if(0===e.length)return null;if(e.length<3){let t=0,o=0;for(const i of e)t+=i.x,o+=i.y;return{x:t/e.length,y:o/e.length}}let t=0,o=0,i=0;const n=e.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=e[s].x*e[r].y-e[r].x*e[s].y;t+=a,o+=(e[s].x+e[r].x)*a,i+=(e[s].y+e[r].y)*a}if(t/=2,Math.abs(t)<1e-6){let t=0,o=0;for(const i of e)t+=i.x,o+=i.y;return{x:t/n,y:o/n}}const s=1/(6*t);return{x:o*s,y:i*s}}_svgToScreen(e){if(!this._svg)return e;const t=this._svg.getScreenCTM();if(t){const o=t.a*e.x+t.c*e.y+t.e,i=t.b*e.x+t.d*e.y+t.f,n=this._svg.getBoundingClientRect();return{x:o-n.left,y:i-n.top}}const o=this._svg.getBoundingClientRect(),i=o.width/this._viewBox.width,n=o.height/this._viewBox.height;return{x:(e.x-this._viewBox.x)*i,y:(e.y-this._viewBox.y)*n}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const e=this._edgeEditor.edge,t="door"===e.type,o="window"===e.type,i=t||o;return V`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t?"Door Properties":o?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e.link_group?(()=>{const t=Oe.value,o=e.link_group,i=t?t.edges.filter(e=>e.link_group===o).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Jt(o)};">
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

        ${e.collinear_group?(()=>{const t=Oe.value,o=e.collinear_group,i=t?t.edges.filter(e=>e.collinear_group===o).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Jt(o)};">
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

        ${i?(()=>{const t=Oe.value;if(!t)return null;const o=Lt(t.nodes),i=o.get(e.start_node),n=o.get(e.end_node);if(!i||!n)return null;const s=(i.x+n.x)/2,r=(i.y+n.y)/2,a=n.x-i.x,l=n.y-i.y,d=Math.sqrt(a*a+l*l);if(0===d)return null;const c=-l/d,h=a/d,p=e.thickness/2+5,g={x:s+c*p,y:r+h*p},u={x:s-c*p,y:r-h*p},f=t.rooms.find(e=>e.polygon.vertices.length>=3&&this._pointInPolygon(g,e.polygon.vertices)),_=t.rooms.find(e=>e.polygon.vertices.length>=3&&this._pointInPolygon(u,e.polygon.vertices)),y=f?.name||(e.is_exterior?"Outside":null),v=_?.name||(e.is_exterior?"Outside":null);return y||v?V`
            <div class="wall-editor-section">
              <span class="wall-editor-section-label">Opens into</span>
              <div class="wall-editor-row" style="gap:6px; font-size:12px; align-items:center;">
                <button
                  class="room-side-btn active"
                  style="background:${f?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("a",e)}
                >${y??"—"}</button>
                <ha-icon icon="mdi:door-open" style="--mdc-icon-size:14px; color:var(--secondary-text-color, #888);"></ha-icon>
                <button
                  class="room-side-btn"
                  style="background:${_?.color??"var(--secondary-background-color, #f5f5f5)"};"
                  @click=${()=>this._setDoorOpensToSide("b",e)}
                >${v??"—"}</button>
              </div>
            </div>
          `:null})():null}

        ${i?(()=>{const e=t?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],o="swing"===this._editingOpeningType,i="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return V`
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
                ${e.map(e=>V`
                  <button
                    class="constraint-btn ${this._editingOpeningType===e.value?"active":""}"
                    @click=${()=>{this._editingOpeningType=e.value}}
                  >${e.label}</button>
                `)}
              </div>
            </div>

            ${o?V`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===i.length?V`
                    <button class="constraint-btn active">${i[0].label}</button>
                  `:i.map(e=>V`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===e.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=e.value}}
                    >${e.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${i?V`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const e=this.hass?.states[this._editingEntityId],t=e?.attributes.friendly_name||this._editingEntityId,o=e?.attributes.icon||"mdi:radiobox-marked";return V`
                <div class="wall-editor-row" style="gap:6px; align-items:center;">
                  <ha-icon icon=${o} style="--mdc-icon-size:18px; color:${"on"===e?.state?"var(--state-light-active-color, #ffd600)":"var(--secondary-text-color, #999)"};"></ha-icon>
                  <span style="flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t}</span>
                  <span style="font-size:11px; color:var(--secondary-text-color, #999); font-weight:500;">${e?.state??"?"}</span>
                  <button
                    class="constraint-btn"
                    @click=${()=>{this._editingEntityId=null,this._openingSensorPickerOpen=!1,this._openingSensorSearch=""}}
                    title="Remove sensor"
                    style="padding:2px 6px; font-size:11px;"
                  ><ha-icon icon="mdi:close" style="--mdc-icon-size:14px;"></ha-icon></button>
                </div>
              `})():this._openingSensorPickerOpen?V`
              <div style="display:flex; flex-direction:column; gap:6px;">
                <input
                  class="opening-sensor-search"
                  type="text"
                  placeholder="Search sensors..."
                  .value=${this._openingSensorSearch}
                  @input=${e=>{this._openingSensorSearch=e.target.value}}
                  @keydown=${e=>{"Escape"===e.key&&(this._openingSensorPickerOpen=!1)}}
                  style="width:100%; padding:6px 8px; border:1px solid var(--divider-color, #e0e0e0); border-radius:8px; font-size:12px; background:var(--primary-background-color, #fafafa); color:var(--primary-text-color, #333); box-sizing:border-box;"
                />
                <div style="max-height:160px; overflow-y:auto;">
                  ${this._getOpeningSensorEntities().map(e=>V`
                    <div
                      class="entity-item ${"on"===e.state?"on":""}"
                      @click=${()=>{this._editingEntityId=e.entity_id,this._openingSensorPickerOpen=!1,this._openingSensorSearch=""}}
                    >
                      <ha-icon icon=${e.attributes.icon||"mdi:radiobox-marked"}></ha-icon>
                      <span class="name">${e.attributes.friendly_name||e.entity_id}</span>
                      <span class="state">${e.state}</span>
                    </div>
                  `)}
                </div>
              </div>
            `:V`
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
              @input=${e=>this._editingLength=e.target.value}
              @keydown=${this._handleEditorKeyDown}
              autofocus
            />
            <span class="wall-editor-unit">cm</span>
            ${i?null:V`
              <button
                class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
                @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
                title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
              ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
            `}
          </div>
        </div>

        ${e.angle_group?(()=>{const t=Oe.value,o=e.angle_group,i=t?t.edges.filter(e=>e.angle_group===o).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${Jt(o)};">
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

        ${i?null:V`
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
    `}async _applyDirection(e,t){if(!this.hass)return!1;const o=Oe.value,i=Fe.value;if(!o||!i)return!1;const n=o.edges.map(t=>t.id===e.id?{...t,direction:"free",length_locked:!1,angle_group:void 0}:t),s=zt(ft(o.nodes,n),e.id,t);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:i.id,floor_id:o.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await Je(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const e=this._nodeEditor.node,t=Oe.value,o=t?Ft(e.id,t.edges).length:0;return V`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
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
              @input=${e=>{this._nodeEditor&&(this._nodeEditor={...this._nodeEditor,editX:e.target.value})}}
              @keydown=${e=>{"Enter"===e.key&&this._handleNodeEditorSave()}}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
          <div class="wall-editor-row">
            <span class="wall-editor-label">Y</span>
            <input
              type="number"
              .value=${this._nodeEditor.editY}
              @input=${e=>{this._nodeEditor&&(this._nodeEditor={...this._nodeEditor,editY:e.target.value})}}
              @keydown=${e=>{"Enter"===e.key&&this._handleNodeEditorSave()}}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Pin</span>
          <div class="wall-editor-row">
            <button
              class="constraint-btn ${e.pinned?"active":""}"
              @click=${()=>this._toggleNodePin()}
              title="${e.pinned?"Unpin node":"Pin node in place"}"
            ><ha-icon icon="${e.pinned?"mdi:pin":"mdi:pin-off"}"></ha-icon> ${e.pinned?"Pinned":"Unpinned"}</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${()=>this._handleNodeEditorSave()}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          ${2===o?V`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._nodeEditor.node,i=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(i)&&!isNaN(n))try{const s=Mt(ft(e.nodes,e.edges),o.id,i,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await Je(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(o.id)}catch(e){console.error("Error updating node position:",e),alert(`Failed to update node: ${e}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._nodeEditor.node,i=!o.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:[{node_id:o.id,x:o.x,y:o.y,pinned:i}]}),await Je(),this._refreshNodeEditor(o.id)}catch(e){console.error("Error toggling node pin:",e),alert(`Failed to toggle pin: ${e}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(e&&t)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:t.id,floor_id:e.id,node_id:this._nodeEditor.node.id}),await Je(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(e){console.error("Failed to dissolve node:",e),alert(`Failed to dissolve node: ${e}`)}}_refreshNodeEditor(e){const t=Oe.value;if(t){const o=t.nodes.find(t=>t.id===e);o&&(this._nodeEditor={node:o,editX:Math.round(o.x).toString(),editY:Math.round(o.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const e=["binary_sensor","cover"];let t=Object.values(this.hass.states).filter(t=>e.some(e=>t.entity_id.startsWith(e+".")));const o=Oe.value,i=this._edgeEditor?.edge.id;if(o){const e=new Set(o.edges.filter(e=>e.entity_id&&e.id!==i).map(e=>e.entity_id));t=t.filter(t=>!e.has(t.entity_id))}if(this._openingSensorSearch){const e=this._openingSensorSearch.toLowerCase();t=t.filter(t=>t.entity_id.toLowerCase().includes(e)||(t.attributes.friendly_name||"").toLowerCase().includes(e))}return t.slice(0,30)}_getFilteredEntities(){if(!this.hass)return[];const e=["light","switch","sensor","binary_sensor","climate","fan","cover","camera","media_player"];let t=Object.values(this.hass.states).filter(t=>e.some(e=>t.entity_id.startsWith(e+".")));if(this._entitySearch){const e=this._entitySearch.toLowerCase();t=t.filter(t=>t.entity_id.toLowerCase().includes(e)||(t.attributes.friendly_name||"").toLowerCase().includes(e))}return t.slice(0,30)}_getEntityIcon(e){const t=e.entity_id.split(".")[0];return e.attributes.icon||{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:radiobox-marked",climate:"mdi:thermostat",fan:"mdi:fan",cover:"mdi:window-shutter",camera:"mdi:camera",media_player:"mdi:cast"}[t]||"mdi:devices"}async _placeDevice(e){if(!this.hass||!this._pendingDevice)return;const t=Oe.value,o=Fe.value;if(!t||!o)return;const i=this.hass,n=o.id,s=t.id,r={...this._pendingDevice.position},a=e.startsWith("binary_sensor.")||e.startsWith("sensor."),l={id:""};try{const t=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:e,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=t.id,await Je(),jt({type:"device_place",description:"Place device",undo:async()=>{await i.callWS({type:"inhabit/devices/remove",floor_plan_id:n,device_id:l.id}),await Je()},redo:async()=>{const t=await i.callWS({type:"inhabit/devices/place",floor_plan_id:n,floor_id:s,entity_id:e,position:r,rotation:0,scale:1,show_state:!0,show_label:!0,contributes_to_occupancy:a});l.id=t.id,await Je()}})}catch(e){console.error("Error placing device:",e),alert(`Failed to place device: ${e}`)}this._pendingDevice=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const e=this._svgToScreen(this._pendingDevice.position),t=this._getFilteredEntities();return V`
      <div class="entity-picker"
           style="left: ${e.x+20}px; top: ${e.y-10}px;"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <input
          type="text"
          placeholder="Search entities..."
          .value=${this._entitySearch}
          @input=${e=>this._entitySearch=e.target.value}
          @keydown=${e=>"Escape"===e.key&&this._cancelDevicePlacement()}
          autofocus
        />
        <div class="entity-list">
          ${t.map(e=>V`
              <div
                class="entity-item ${"on"===e.state?"on":""}"
                @click=${()=>this._placeDevice(e.entity_id)}
              >
                <ha-icon icon=${this._getEntityIcon(e)}></ha-icon>
                <span class="name">${e.attributes.friendly_name||e.entity_id}</span>
                <span class="state">${e.state}</span>
              </div>
            `)}
        </div>
      </div>
    `}render(){const e=this._canvasMode,t=[this._isPanning?"panning":"","select"===Te.value?"select-tool":"","viewing"===e?"view-mode":""].filter(Boolean).join(" ");return V`
      <svg
        class="${t}"
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
        ${"walls"===e?this._renderEdgeAnnotations():null}
        ${"walls"===e?this._renderAngleConstraints():null}
        ${"walls"===e?this._renderNodeEndpoints():null}
        ${"furniture"===e&&"zone"===Te.value?this._renderNodeGuideDots():null}
        ${"viewing"!==e&&"occupancy"!==e?this._renderDrawingPreview():null}
        ${"furniture"===e?this._renderFurnitureDrawingPreview():null}
        ${"walls"===e?this._renderOpeningPreview():null}
        ${"placement"===e?this._renderDevicePreview():null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"occupancy"!==e?this._renderZoneEditor():null}
      ${"placement"===e?this._renderEntityPicker():null}
    `;var o}_getVisibleAnnotationEdgeIds(){const e=We.value;if("edge"!==e.type||0===e.ids.length)return null;const t=Oe.value;if(!t)return null;const o=new Set(e.ids),i=t.edges.filter(t=>e.ids.includes(t.id)),n=new Set,s=new Set,r=new Set;for(const e of i)e.link_group&&n.add(e.link_group),e.collinear_group&&s.add(e.collinear_group),e.angle_group&&r.add(e.angle_group);for(const e of t.edges)o.has(e.id)||(e.link_group&&n.has(e.link_group)&&o.add(e.id),e.collinear_group&&s.has(e.collinear_group)&&o.add(e.id),e.angle_group&&r.has(e.angle_group)&&o.add(e.id));return o}_renderEdgeAnnotations(){const e=Oe.value;if(!e||0===e.edges.length)return null;const t=this._getVisibleAnnotationEdgeIds();if(!t)return null;const o=Nt(e);return j`
      <g class="wall-annotations-layer">
        ${o.map(e=>{if(!t.has(e.id))return null;const o=(e.startPos.x+e.endPos.x)/2,i=(e.startPos.y+e.endPos.y)/2,n=this._calculateWallLength(e.startPos,e.endPos),s=Math.atan2(e.endPos.y-e.startPos.y,e.endPos.x-e.startPos.x)*(180/Math.PI),r=s>90||s<-90?s+180:s,a=[];e.length_locked&&a.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===e.direction&&a.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===e.direction&&a.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),p=-(e.thickness/2+6);return j`
            <g transform="translate(${o}, ${i}) rotate(${r})">
              ${e.link_group?j`
                <circle cx="${h}" cy="${p-1}" r="3.5"
                  fill="${Jt(e.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${e.collinear_group?j`
                <g transform="translate(${h-(e.link_group?10:0)}, ${p-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${Jt(e.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              `:null}
              <text class="wall-annotation-text" x="0" y="${p}">${l}</text>
              ${a.map((e,t)=>j`
                <g transform="translate(${c+t*d}, ${p}) rotate(${-r}) scale(${.35})">
                  <path d="${e}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `})}
      </g>
    `}_renderAngleConstraints(){const e=Oe.value;if(!e||0===e.edges.length)return null;const t=this._getVisibleAnnotationEdgeIds();if(!t)return null;const o=Lt(e.nodes),i=new Map;for(const t of e.edges)t.angle_group&&(i.has(t.angle_group)||i.set(t.angle_group,[]),i.get(t.angle_group).push(t));for(const[e,o]of i)o.some(e=>t.has(e.id))||i.delete(e);const n=[];for(const[,e]of i){if(2!==e.length)continue;const t=new Set([e[0].start_node,e[0].end_node]),i=new Set([e[1].start_node,e[1].end_node]);let s=null;for(const e of t)if(i.has(e)){s=e;break}if(!s)continue;const r=s,a=o.get(r);if(!a)continue;const l=[];for(const t of e){const e=t.start_node===r?t.end_node:t.start_node,i=o.get(e);i&&l.push(Math.atan2(i.y-a.y,i.x-a.x))}if(l.length<2)continue;l.sort((e,t)=>e-t);const d=l.length;for(let e=0;e<d;e++){const t=l[e],o=l[(e+1)%d],i=(o-t+2*Math.PI)%(2*Math.PI);if(Math.PI-i<.01)continue;const s=t+Math.PI,r=o+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):n.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return j`
      <g class="angle-constraints-layer">
        ${n.map(e=>{const t=e.angle1,o=e.angle2,i=o-t,n=180*i/Math.PI;if(n>85&&n<95){const n=.7*s,r=e.x+n*Math.cos(t),a=e.y+n*Math.sin(t),l=e.x+n*Math.cos(o),d=e.y+n*Math.sin(o),c=(t+o)/2,h=n/Math.cos(i/2),p=e.x+h*Math.cos(c),g=e.y+h*Math.sin(c);return j`
              <path d="M${r},${a} L${p},${g} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=e.x+s*Math.cos(t),a=e.y+s*Math.sin(t),l=e.x+s*Math.cos(o),d=e.y+s*Math.sin(o),c=i>Math.PI?1:0;return j`
            <path d="M${r},${a} A${s},${s} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const e=this._multiEdgeEditor.edges,t=this._multiEdgeEditor.collinear??!1;return V`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,We.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t?V`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Total Length</span>
            <div class="wall-editor-row">
              <input
                type="number"
                .value=${this._editingTotalLength}
                @input=${e=>this._editingTotalLength=e.target.value}
                @keydown=${e=>{"Enter"===e.key&&this._applyTotalLength()}}
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
            ${(()=>{const t=e.map(e=>e.angle_group).filter(Boolean);if(t.length===e.length&&1===new Set(t).size)return V`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===e.length&&(()=>{const t=new Set([e[0].start_node,e[0].end_node]);return t.has(e[1].start_node)||t.has(e[1].end_node)})()?V`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:V`<button
                class="constraint-btn"
                disabled
                title="${2!==e.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const t=e.map(e=>e.link_group).filter(Boolean);return t.length===e.length&&1===new Set(t).size?V`<button
                  class="constraint-btn active"
                  @click=${()=>this._unlinkEdges()}
                  title="Unlink these walls"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon> Unlink</button>`:V`<button
                class="constraint-btn"
                @click=${()=>this._linkEdges()}
                title="Link these walls so property changes propagate"
              ><ha-icon icon="mdi:link-variant"></ha-icon> Link</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Collinear Link</span>
          <div class="wall-editor-row">
            ${(()=>{const o=e.map(e=>e.collinear_group).filter(Boolean);return o.length===e.length&&1===new Set(o).size?V`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:t?V`<button
                  class="constraint-btn"
                  @click=${()=>this._collinearLinkEdges()}
                  title="Constrain walls to stay on the same line"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Link Collinear</button>`:V`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}}catch(e){console.error("Error angle linking edges:",e)}}async _angleUnlinkEdges(){if(!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i)if(this._multiEdgeEditor){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}else if(this._edgeEditor){const e=i.edges.find(e=>e.id===o[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error angle unlinking edges:",e)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={edges:e}}}catch(e){console.error("Error linking edges:",e)}}async _unlinkEdges(){if(!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i)if(this._multiEdgeEditor){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={edges:e}}else if(this._edgeEditor){const e=i.edges.find(e=>e.id===o[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error unlinking edges:",e)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=parseFloat(this._editingTotalLength);if(isNaN(o)||o<=0)return;const i=this._multiEdgeEditor.edges.map(e=>e.id),n=function(e,t,o){const i=new Set,n=[];for(const o of t){const t=e.edges.get(o);if(t){if(t.length_locked)return{updates:[],blocked:!0,blockedBy:[t.id]};n.push(t),i.add(t.start_node),i.add(t.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const t of i){const o=e.nodes.get(t);o&&s.push({x:o.x,y:o.y})}const{anchor:r,dir:a}=ot(s),l=new Map;for(const t of i){const o=e.nodes.get(t);if(!o)continue;const i=o.x-r.x,n=o.y-r.y,s=i*a.x+n*a.y;l.set(t,s)}let d=1/0,c=-1/0,h="";for(const[e,t]of l)t<d&&(d=t,h=e),t>c&&(c=t);const p=c-d;if(p<1e-9)return{updates:[],blocked:!1};const g=yt(e),u=new Set;for(const[e,t]of l){if(u.add(e),e===h)continue;const i=d+o/p*(t-d);g.set(e,{x:r.x+i*a.x,y:r.y+i*a.y})}const f=new Set(u);for(const[t,o]of e.nodes)o.pinned&&f.add(t);const _=bt(e,f,g);for(const t of u){const o=g.get(t),i=e.nodes.get(t);o&&(Math.abs(o.x-i.x)>nt||Math.abs(o.y-i.y)>nt)&&(_.updates.some(e=>e.nodeId===t)||_.updates.push({nodeId:t,x:o.x,y:o.y}))}return _.blocked=!1,delete _.blockedBy,_}(ft(e.nodes,e.edges),i,o);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:n.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await Je();Oe.value&&this._updateEdgeEditorForSelection(i)}catch(e){console.error("Error applying total length:",e)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}}catch(e){console.error("Error collinear linking edges:",e)}}async _collinearUnlinkEdges(){if(!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==o.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:o}),await Je();const i=Oe.value;if(i)if(this._multiEdgeEditor){const e=o.map(e=>i.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}else if(this._edgeEditor){const e=i.edges.find(e=>e.id===o[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error collinear unlinking edges:",e)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const e=Oe.value,t=Fe.value;if(!e||!t)return;const o=this._multiEdgeEditor.edges;try{for(const i of o)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:t.id,floor_id:e.id,edge_id:i.id});await Je(),await this._syncRoomsWithEdges()}catch(e){console.error("Error deleting edges:",e)}this._multiEdgeEditor=null,We.value={type:"none",ids:[]}}_renderDevicePreview(){return"device"!==Te.value||this._pendingDevice?null:j`
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
    `}}e([pe({attribute:!1})],Qt.prototype,"hass",void 0),e([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(e){return(t,o,i)=>((e,t,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,o),o))(t,o,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}("svg")],Qt.prototype,"_svg",void 0),e([ge()],Qt.prototype,"_viewBox",void 0),e([ge()],Qt.prototype,"_isPanning",void 0),e([ge()],Qt.prototype,"_panStart",void 0),e([ge()],Qt.prototype,"_cursorPos",void 0),e([ge()],Qt.prototype,"_wallStartPoint",void 0),e([ge()],Qt.prototype,"_roomEditor",void 0),e([ge()],Qt.prototype,"_haAreas",void 0),e([ge()],Qt.prototype,"_hoveredNode",void 0),e([ge()],Qt.prototype,"_draggingNode",void 0),e([ge()],Qt.prototype,"_nodeEditor",void 0),e([ge()],Qt.prototype,"_edgeEditor",void 0),e([ge()],Qt.prototype,"_multiEdgeEditor",void 0),e([ge()],Qt.prototype,"_editingTotalLength",void 0),e([ge()],Qt.prototype,"_editingLength",void 0),e([ge()],Qt.prototype,"_editingLengthLocked",void 0),e([ge()],Qt.prototype,"_editingDirection",void 0),e([ge()],Qt.prototype,"_editingOpeningParts",void 0),e([ge()],Qt.prototype,"_editingOpeningType",void 0),e([ge()],Qt.prototype,"_editingSwingDirection",void 0),e([ge()],Qt.prototype,"_editingEntityId",void 0),e([ge()],Qt.prototype,"_openingSensorSearch",void 0),e([ge()],Qt.prototype,"_openingSensorPickerOpen",void 0),e([ge()],Qt.prototype,"_blinkingEdgeIds",void 0),e([ge()],Qt.prototype,"_focusedRoomId",void 0),e([ge()],Qt.prototype,"_pendingDevice",void 0),e([ge()],Qt.prototype,"_entitySearch",void 0),e([ge()],Qt.prototype,"_openingPreview",void 0),e([ge(),ge()],Qt.prototype,"_zonePolyPoints",void 0),e([ge()],Qt.prototype,"_pendingZonePolygon",void 0),e([ge()],Qt.prototype,"_zoneEditor",void 0),e([ge()],Qt.prototype,"_draggingZone",void 0),e([ge()],Qt.prototype,"_draggingZoneVertex",void 0),e([ge()],Qt.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",Qt);const eo=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"}],to=[{id:"zone",icon:"mdi:vector-polygon",label:"Zone"}],oo=[{id:"device",icon:"mdi:devices",label:"Device"}];class io extends le{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._canvasMode="walls",this._renamingFloorId=null,this._renameValue="",this._cleanupEffects=[],this._handleDocumentClick=e=>{e.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
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
  `}_selectFloor(e){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:e},bubbles:!0,composed:!0}))}_handleToolSelect(e){Te.value=e,this._addMenuOpen=!1}_handleUndo(){Ht()}_handleRedo(){qt()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(e,t,o){e.stopPropagation(),confirm(`Delete "${o}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:t},bubbles:!0,composed:!0})))}_startRename(e,t,o){e.stopPropagation(),this._renamingFloorId=t,this._renameValue=o,this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelector(".rename-input");e&&(e.focus(),e.select())})}_commitRename(){const e=this._renamingFloorId,t=this._renameValue.trim();this._renamingFloorId=null,e&&t&&this.dispatchEvent(new CustomEvent("rename-floor",{detail:{id:e,name:t},bubbles:!0,composed:!0}))}_cancelRename(){this._renamingFloorId=null}_handleRenameKeyDown(e){"Enter"===e.key?this._commitRename():"Escape"===e.key&&this._cancelRename()}_openImportExport(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("open-import-export",{bubbles:!0,composed:!0}))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._handleDocumentClick),this._cleanupEffects.push(De(()=>{this._canvasMode=Re.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}render(){const e=Fe.value,t=Oe.value,o=Te.value,i=this._canvasMode,n=e?.floors||[],s="walls"===i?eo:"furniture"===i?to:"placement"===i?oo:[];return V`
      <!-- Floor Selector -->
      ${n.length>0?V`
        <div class="floor-selector">
          <button
            class="floor-trigger ${this._floorMenuOpen?"open":""}"
            @click=${this._toggleFloorMenu}
          >
            ${t?.name||"Select floor"}
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          ${this._floorMenuOpen?V`
            <div class="floor-dropdown">
              ${n.map(e=>this._renamingFloorId===e.id?V`
                    <div class="floor-option">
                      <ha-icon icon="mdi:layers"></ha-icon>
                      <input
                        class="rename-input"
                        .value=${this._renameValue}
                        @input=${e=>{this._renameValue=e.target.value}}
                        @keydown=${this._handleRenameKeyDown}
                        @blur=${this._commitRename}
                        @click=${e=>e.stopPropagation()}
                      />
                    </div>
                  `:V`
                    <button
                      class="floor-option ${e.id===t?.id?"selected":""}"
                      @click=${()=>this._selectFloor(e.id)}
                    >
                      <ha-icon icon="mdi:layers"></ha-icon>
                      ${e.name}
                      <span class="rename-btn"
                            @click=${t=>this._startRename(t,e.id,e.name)}
                            title="Rename floor">
                        <ha-icon icon="mdi:pencil-outline"></ha-icon>
                      </span>
                      <span class="delete-btn"
                            @click=${t=>this._handleDeleteFloor(t,e.id,e.name)}
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
      `:V`
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
          @click=${()=>Ge("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"furniture"===i?"active":""}"
          @click=${()=>Ge("furniture")}
          title="Zones mode"
        >
          <ha-icon icon="mdi:vector-square"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===i?"active":""}"
          @click=${()=>Ge("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
        <button
          class="mode-button ${"occupancy"===i?"active":""}"
          @click=${()=>Ge("occupancy")}
          title="Occupancy mode"
        >
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
        </button>
      </div>

      <div class="spacer"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!Ut.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!Vt.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Add Menu -->
      ${s.length>0?V`
        <div class="add-button-container">
          <button
            class="add-button ${this._addMenuOpen?"menu-open":""}"
            @click=${this._toggleAddMenu}
            title="Add element"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
          ${this._addMenuOpen?V`
                <div class="add-menu">
                  ${s.map(e=>V`
                      <button
                        class="add-menu-item ${o===e.id?"active":""}"
                        @click=${()=>this._handleToolSelect(e.id)}
                      >
                        <ha-icon icon=${e.icon}></ha-icon>
                        ${e.label}
                      </button>
                    `)}
                </div>
              `:null}
        </div>
      `:null}
    `}}e([pe({attribute:!1})],io.prototype,"hass",void 0),e([pe({attribute:!1})],io.prototype,"floorPlans",void 0),e([ge()],io.prototype,"_addMenuOpen",void 0),e([ge()],io.prototype,"_floorMenuOpen",void 0),e([ge()],io.prototype,"_canvasMode",void 0),e([ge()],io.prototype,"_renamingFloorId",void 0),e([ge()],io.prototype,"_renameValue",void 0),customElements.get("fpb-toolbar")||customElements.define("fpb-toolbar",io);class no extends le{constructor(){super(...arguments),this.open=!1,this._mode="export",this._exportSelection=new Set,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1,this._error=null}static{this.styles=r`
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
  `}show(e){this._mode=e||"export",this._error=null,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1;const t=Fe.value;t&&(this._exportSelection=new Set(t.floors.map(e=>e.id))),this.open=!0}close(){this.open=!1}_setMode(e){this._mode=e,this._error=null}_toggleExportFloor(e){const t=new Set(this._exportSelection);t.has(e)?t.delete(e):t.add(e),this._exportSelection=t}_toggleExportAll(){const e=Fe.value;e&&(this._exportSelection.size===e.floors.length?this._exportSelection=new Set:this._exportSelection=new Set(e.floors.map(e=>e.id)))}async _doExport(){if(!this.hass)return;const e=Fe.value;if(e&&0!==this._exportSelection.size){this._exporting=!0,this._error=null;try{const t=[];for(const o of this._exportSelection){const i=await this.hass.callWS({type:"inhabit/floors/export",floor_plan_id:e.id,floor_id:o});t.push(i)}const o=1===t.length?t[0]:{inhabit_version:"1.0",export_type:"floors",exported_at:(new Date).toISOString(),floors:t},i=JSON.stringify(o,null,2),n=new Blob([i],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s;const a=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),l=1===t.length?(t[0].floor?.name||"floor").toLowerCase().replace(/[^a-z0-9]+/g,"-"):"floors";r.download=`inhabit-${a}-${l}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s),this.close()}catch(e){console.error("Export error:",e),this._error=`Export failed: ${e?.message||e}`}finally{this._exporting=!1}}}_pickFile(){const e=document.createElement("input");e.type="file",e.accept=".json",e.style.display="none",document.body.appendChild(e),e.addEventListener("change",async()=>{const t=e.files?.[0];if(document.body.removeChild(e),t)try{const e=await t.text(),o=JSON.parse(e);this._parseImportFile(o)}catch{this._error="Could not read file. Make sure it's a valid Inhabit JSON export."}}),e.click()}_parseImportFile(e){if(this._error=null,!e||"object"!=typeof e)return void(this._error="Invalid file format.");const t=e;if("floors"===t.export_type&&Array.isArray(t.floors)){const e=t.floors;return this._importData=e,void(this._importEntries=e.map((e,t)=>{const o=e.floor,i=e.devices;return{index:t,name:o?.name||`Floor ${t+1}`,level:o?.level??t,roomCount:Array.isArray(o?.rooms)?o.rooms.length:0,wallCount:Array.isArray(o?.edges)?o.edges.length:Array.isArray(o?.walls)?o.walls.length:0,deviceCount:Array.isArray(i)?i.length:0,selected:!0}}))}if("floor"===t.export_type){this._importData=[t];const e=t.floor,o=t.devices;return void(this._importEntries=[{index:0,name:e?.name||"Imported Floor",level:e?.level??0,roomCount:Array.isArray(e?.rooms)?e.rooms.length:0,wallCount:Array.isArray(e?.edges)?e.edges.length:Array.isArray(e?.walls)?e.walls.length:0,deviceCount:Array.isArray(o)?o.length:0,selected:!0}])}this._error="Invalid file: not an Inhabit floor export."}_toggleImportFloor(e){this._importEntries=this._importEntries.map(t=>t.index===e?{...t,selected:!t.selected}:t)}_toggleImportAll(){const e=this._importEntries.every(e=>e.selected);this._importEntries=this._importEntries.map(t=>({...t,selected:!e}))}async _doImport(){if(!this.hass)return;const e=Fe.value;if(!e)return;const t=this._importEntries.filter(e=>e.selected);if(0!==t.length){this._importing=!0,this._error=null;try{let o=null;const i=[];for(const n of t){const t=this._importData[n.index],s=await this.hass.callWS({type:"inhabit/floors/import",floor_plan_id:e.id,data:t});i.push(s),o=s}const n={...e,floors:[...e.floors,...i]};this.dispatchEvent(new CustomEvent("floors-imported",{detail:{floorPlan:n,switchTo:o},bubbles:!0,composed:!0})),this.close()}catch(e){console.error("Import error:",e),this._error=`Import failed: ${e?.message||e}`}finally{this._importing=!1}}}_onOverlayClick(e){e.target.classList.contains("overlay")&&this.close()}render(){if(!this.open)return q;const e=Fe.value,t=e?.floors||[];return V`
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

          ${this._error?V`<div class="error-msg" style="margin: 0 16px 8px;">${this._error}</div>`:q}

          <div class="dialog-content">
            ${"export"===this._mode?this._renderExport(t):this._renderImport()}
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" @click=${this.close}>Cancel</button>
            ${"export"===this._mode?V`
                  <button
                    class="btn-primary"
                    ?disabled=${0===this._exportSelection.size||this._exporting}
                    @click=${this._doExport}
                  >
                    ${this._exporting?"Exporting…":"Export"}
                  </button>
                `:V`
                  <button
                    class="btn-primary"
                    ?disabled=${0===this._importEntries.filter(e=>e.selected).length||this._importing}
                    @click=${this._doImport}
                    style=${0===this._importEntries.length?"display:none":""}
                  >
                    ${this._importing?"Importing…":"Import"}
                  </button>
                `}
          </div>
        </div>
      </div>
    `}_renderExport(e){if(0===e.length)return V`<div class="empty-msg">No floors to export.</div>`;const t=this._exportSelection.size===e.length;return V`
      <label class="select-all" @click=${this._toggleExportAll}>
        <input
          type="checkbox"
          .checked=${t}
          @click=${e=>e.stopPropagation()}
          @change=${this._toggleExportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${e.map(e=>V`
            <label class="floor-item" @click=${()=>this._toggleExportFloor(e.id)}>
              <input
                type="checkbox"
                .checked=${this._exportSelection.has(e.id)}
                @click=${e=>e.stopPropagation()}
                @change=${()=>this._toggleExportFloor(e.id)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${e.name}</div>
                <div class="floor-item-meta">
                  ${e.rooms.length} room${1!==e.rooms.length?"s":""},
                  ${e.edges.length} edge${1!==e.edges.length?"s":""}
                </div>
              </div>
            </label>
          `)}
      </div>
    `}_renderImport(){if(0===this._importEntries.length)return V`
        <div class="file-drop" @click=${this._pickFile}>
          <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          <span>Choose an Inhabit JSON file</span>
        </div>
      `;const e=this._importEntries.every(e=>e.selected);return V`
      <label class="select-all" @click=${this._toggleImportAll}>
        <input
          type="checkbox"
          .checked=${e}
          @click=${e=>e.stopPropagation()}
          @change=${this._toggleImportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${this._importEntries.map(e=>V`
            <label class="floor-item" @click=${()=>this._toggleImportFloor(e.index)}>
              <input
                type="checkbox"
                .checked=${e.selected}
                @click=${e=>e.stopPropagation()}
                @change=${()=>this._toggleImportFloor(e.index)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${e.name}</div>
                <div class="floor-item-meta">
                  ${e.roomCount} room${1!==e.roomCount?"s":""},
                  ${e.wallCount} wall${1!==e.wallCount?"s":""}${e.deviceCount>0?`, ${e.deviceCount} device${1!==e.deviceCount?"s":""}`:""}
                </div>
              </div>
            </label>
          `)}
      </div>
    `}}e([pe({attribute:!1})],no.prototype,"hass",void 0),e([pe({type:Boolean,reflect:!0})],no.prototype,"open",void 0),e([ge()],no.prototype,"_mode",void 0),e([ge()],no.prototype,"_exportSelection",void 0),e([ge()],no.prototype,"_importEntries",void 0),e([ge()],no.prototype,"_importData",void 0),e([ge()],no.prototype,"_importing",void 0),e([ge()],no.prototype,"_exporting",void 0),e([ge()],no.prototype,"_error",void 0),customElements.get("fpb-import-export-dialog")||customElements.define("fpb-import-export-dialog",no);class so extends le{constructor(){super(...arguments),this.targetId="",this.targetName="",this.targetType="room",this._config=null,this._occupancyState=null,this._loading=!0}static{this.styles=r`
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
      gap: 8px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      background: var(--secondary-background-color, #f0f0f0);
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
      padding: 2px;
      color: var(--error-color, #f44336);
      font-size: 16px;
      line-height: 1;
    }

    .add-sensor-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .add-sensor-row input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      font-size: 13px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .add-sensor-row button {
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
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
  `}connectedCallback(){super.connectedCallback(),this._loadConfig(),this._startPolling()}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}updated(e){e.has("targetId")&&this.targetId&&this._loadConfig()}_startPolling(){this._pollTimer=window.setInterval(()=>this._loadOccupancyState(),2e3)}_stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}async _loadConfig(){if(this.hass&&this.targetId){this._loading=!0;try{const e=await this.hass.callWS({type:"inhabit/sensor_config/get",room_id:this.targetId});this._config=e}catch{this._config=null}await this._loadOccupancyState(),this._loading=!1}}async _loadOccupancyState(){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/occupancy_states"});this._occupancyState=e[this.targetId]??null}catch{}}async _updateConfig(e){if(this.hass&&this._config)try{const t=await this.hass.callWS({type:"inhabit/sensor_config/update",room_id:this.targetId,...e});this._config=t}catch(e){console.error("Failed to update sensor config:",e)}}async _addSensor(e,t){if(!this._config||!t)return;const o=`${e}_sensors`,i=this._config[o];if(i.some(e=>e.entity_id===t))return;const n=[...i,{entity_id:t,sensor_type:e,weight:1,inverted:!1}];await this._updateConfig({[o]:n})}async _removeSensor(e,t){if(!this._config)return;const o=`${e}_sensors`,i=this._config[o].filter(e=>e.entity_id!==t);await this._updateConfig({[o]:i})}_renderSensorSection(e,t,o){const i=`add-${t}-input`;return V`
      <div class="section">
        <div class="section-title">${e}</div>
        <div class="sensor-list">
          ${o.map(e=>V`
            <div class="sensor-item">
              <ha-icon icon=${"motion"===t?"mdi:motion-sensor":"presence"===t?"mdi:account-eye":"mdi:door"} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${e.entity_id}</span>
              <button class="remove-btn" @click=${()=>this._removeSensor(t,e.entity_id)}>x</button>
            </div>
          `)}
        </div>
        <div class="add-sensor-row">
          <input
            id=${i}
            type="text"
            placeholder="binary_sensor.xxx"
            @keydown=${e=>{if("Enter"===e.key){const o=e.target;this._addSensor(t,o.value.trim()),o.value=""}}}
          />
          <button @click=${()=>{const e=this.shadowRoot?.querySelector(`#${i}`);e&&(this._addSensor(t,e.value.trim()),e.value="")}}>Add</button>
        </div>
      </div>
    `}_renderStatus(){const e=this._occupancyState;if(!e)return q;const t=e.state,o=e.state.charAt(0).toUpperCase()+e.state.slice(1),i=Math.round(100*e.confidence);return V`
      <div class="section">
        <div class="section-title">Live Status</div>
        <div class="status-section">
          <div>
            <span class="state-badge ${t}">${o}</span>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--secondary-text-color);">Confidence: ${i}%</label>
            <div class="confidence-bar">
              <div class="confidence-bar-fill" style="width: ${i}%;"></div>
            </div>
          </div>
          ${e.contributing_sensors.length>0?V`
            <div class="contributing-sensors">
              Contributing: ${e.contributing_sensors.join(", ")}
            </div>
          `:q}
        </div>
      </div>
    `}render(){return V`
      <div class="panel-header">
        <h3>${this.targetName} Occupancy</h3>
        <button class="close-btn" @click=${()=>this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading?V`<ha-circular-progress active></ha-circular-progress>`:this._config?V`
          <!-- Enable toggle -->
          <div class="toggle-row">
            <div>
              <label>Occupancy Sensor</label>
              <div class="sublabel">Creates a binary_sensor entity</div>
            </div>
            <ha-switch
              .checked=${this._config.enabled}
              @change=${e=>this._updateConfig({enabled:e.target.checked})}
            ></ha-switch>
          </div>

          ${this._config.enabled?V`
            ${this._renderStatus()}

            <!-- Timing -->
            <div class="section">
              <div class="section-title">Timing</div>

              <div class="slider-row">
                <label>Motion Timeout <span>${this._config.motion_timeout}s</span></label>
                <input type="range" min="10" max="600" step="10"
                  .value=${String(this._config.motion_timeout)}
                  @change=${e=>this._updateConfig({motion_timeout:Number(e.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Checking Timeout <span>${this._config.checking_timeout}s</span></label>
                <input type="range" min="5" max="120" step="5"
                  .value=${String(this._config.checking_timeout)}
                  @change=${e=>this._updateConfig({checking_timeout:Number(e.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Presence Timeout <span>${this._config.presence_timeout}s</span></label>
                <input type="range" min="30" max="900" step="30"
                  .value=${String(this._config.presence_timeout)}
                  @change=${e=>this._updateConfig({presence_timeout:Number(e.target.value)})}
                />
              </div>
            </div>

            <!-- Sensor Bindings -->
            ${this._renderSensorSection("Motion Sensors","motion",this._config.motion_sensors)}
            ${this._renderSensorSection("Presence Sensors","presence",this._config.presence_sensors)}
            ${this._renderSensorSection("Door Sensors","door",this._config.door_sensors)}

            <!-- Door Logic -->
            <div class="section">
              <div class="section-title">Door Logic</div>

              <div class="toggle-row">
                <div>
                  <label>Door blocks vacancy</label>
                  <div class="sublabel">Closed door prevents VACANT</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_blocks_vacancy}
                  @change=${e=>this._updateConfig({door_blocks_vacancy:e.target.checked})}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div>
                  <label>Door open resets checking</label>
                  <div class="sublabel">Opening door restarts CHECKING timer</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_open_resets_checking}
                  @change=${e=>this._updateConfig({door_open_resets_checking:e.target.checked})}
                ></ha-switch>
              </div>
            </div>

            <!-- Thresholds -->
            <div class="section">
              <div class="section-title">Thresholds</div>

              <div class="slider-row">
                <label>Occupied Threshold <span>${(100*this._config.occupied_threshold).toFixed(0)}%</span></label>
                <input type="range" min="0.1" max="1.0" step="0.05"
                  .value=${String(this._config.occupied_threshold)}
                  @change=${e=>this._updateConfig({occupied_threshold:Number(e.target.value)})}
                />
              </div>

              <div class="slider-row">
                <label>Vacant Threshold <span>${(100*this._config.vacant_threshold).toFixed(0)}%</span></label>
                <input type="range" min="0.0" max="0.5" step="0.05"
                  .value=${String(this._config.vacant_threshold)}
                  @change=${e=>this._updateConfig({vacant_threshold:Number(e.target.value)})}
                />
              </div>
            </div>
          `:q}
        `:V`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `}
      </div>
    `}}e([pe({attribute:!1})],so.prototype,"hass",void 0),e([pe({type:String})],so.prototype,"targetId",void 0),e([pe({type:String})],so.prototype,"targetName",void 0),e([pe({type:String})],so.prototype,"targetType",void 0),e([ge()],so.prototype,"_config",void 0),e([ge()],so.prototype,"_occupancyState",void 0),e([ge()],so.prototype,"_loading",void 0),customElements.define("fpb-occupancy-panel",so);class ro extends le{constructor(){super(...arguments),this.placementId="",this._placement=null,this._loading=!0}static{this.styles=r`
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

    .target-mapping {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 8px;
    }

    .target-mapping-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .target-mapping-header span {
      font-weight: 500;
      font-size: 13px;
    }

    .target-mapping input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      font-size: 13px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .target-mapping label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: var(--error-color, #f44336);
      font-size: 14px;
    }

    .add-btn {
      padding: 8px 16px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
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
  `}connectedCallback(){super.connectedCallback(),this._loadPlacement()}updated(e){e.has("placementId")&&this.placementId&&this._loadPlacement()}async _loadPlacement(){if(!this.hass||!this.placementId)return;this._loading=!0;const e=Xe.value.find(e=>e.id===this.placementId);this._placement=e??null,this._loading=!1}async _update(e){if(this.hass&&this._placement)try{const t=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...e});this._placement=t,Xe.value=Xe.value.map(e=>e.id===t.id?t:e)}catch(e){console.error("Failed to update mmWave placement:",e)}}async _addTargetMapping(){if(!this._placement)return;const e=this._placement.target_mappings.length>0?Math.max(...this._placement.target_mappings.map(e=>e.target_index))+1:0,t=[...this._placement.target_mappings,{target_index:e,x_entity_id:"",y_entity_id:""}];await this._update({target_mappings:t})}async _removeTargetMapping(e){if(!this._placement)return;const t=this._placement.target_mappings.filter(t=>t.target_index!==e);await this._update({target_mappings:t})}async _updateTargetMapping(e,t,o){if(!this._placement)return;const i=this._placement.target_mappings.map(i=>i.target_index===e?{...i,[t]:o}:i);await this._update({target_mappings:i})}async _deletePlacement(){if(this.hass&&this._placement)try{await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),Xe.value=Xe.value.filter(e=>e.id!==this.placementId),this.dispatchEvent(new CustomEvent("close-panel"))}catch(e){console.error("Failed to delete mmWave placement:",e)}}render(){return V`
      <div class="panel-header">
        <h3>mmWave Sensor</h3>
        <button class="close-btn" @click=${()=>this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading?V`<ha-circular-progress active></ha-circular-progress>`:this._placement?V`
          <!-- Angle, FOV, Range -->
          <div class="section">
            <div class="section-title">Sensor Settings</div>

            <div class="slider-row">
              <label>Angle Offset <span>${this._placement.angle.toFixed(0)}deg</span></label>
              <input type="range" min="-90" max="90" step="1"
                .value=${String(this._placement.angle)}
                @change=${e=>this._update({angle:Number(e.target.value)})}
              />
            </div>

            <div class="slider-row">
              <label>Field of View <span>${this._placement.field_of_view.toFixed(0)}deg</span></label>
              <input type="range" min="30" max="180" step="5"
                .value=${String(this._placement.field_of_view)}
                @change=${e=>this._update({field_of_view:Number(e.target.value)})}
              />
            </div>

            <div class="slider-row">
              <label>Detection Range <span>${this._placement.detection_range.toFixed(0)}cm</span></label>
              <input type="range" min="50" max="1200" step="25"
                .value=${String(this._placement.detection_range)}
                @change=${e=>this._update({detection_range:Number(e.target.value)})}
              />
            </div>
          </div>

          <!-- Target Mappings -->
          <div class="section">
            <div class="section-title">Target Mappings</div>
            ${this._placement.target_mappings.map(e=>V`
              <div class="target-mapping">
                <div class="target-mapping-header">
                  <span>Target ${e.target_index}</span>
                  <button class="remove-btn" @click=${()=>this._removeTargetMapping(e.target_index)}>x</button>
                </div>
                <label>X Entity</label>
                <input type="text" .value=${e.x_entity_id} placeholder="sensor.mmwave_target_x"
                  @change=${t=>this._updateTargetMapping(e.target_index,"x_entity_id",t.target.value)}
                />
                <label>Y Entity</label>
                <input type="text" .value=${e.y_entity_id} placeholder="sensor.mmwave_target_y"
                  @change=${t=>this._updateTargetMapping(e.target_index,"y_entity_id",t.target.value)}
                />
              </div>
            `)}
            <button class="add-btn" @click=${this._addTargetMapping}>+ Add Target</button>
          </div>

          <!-- Delete -->
          <div class="section">
            <button class="delete-btn" @click=${this._deletePlacement}>Delete Sensor</button>
          </div>
        `:V`<p>Placement not found.</p>`}
      </div>
    `}}e([pe({attribute:!1})],ro.prototype,"hass",void 0),e([pe({type:String})],ro.prototype,"placementId",void 0),e([ge()],ro.prototype,"_placement",void 0),e([ge()],ro.prototype,"_loading",void 0),customElements.define("fpb-mmwave-panel",ro);class ao extends le{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1,this._haAreas=[],this._focusedRoomId=null,this._occupancyPanelTarget=null,this._cleanupEffects=[]}static{this.styles=r`
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

    .canvas-with-panel {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .canvas-with-panel .canvas-container {
      flex: 1;
    }

    fpb-occupancy-panel {
      width: 320px;
      flex-shrink: 0;
      border-left: 1px solid var(--divider-color, #e0e0e0);
      overflow-y: auto;
    }
  `}connectedCallback(){var e;super.connectedCallback(),Fe.value=null,Oe.value=null,Re.value="walls",Te.value="select",We.value={type:"none",ids:[]},Be.value={x:0,y:0,width:1e3,height:800},Ze.value=10,Ue.value=!0,Ve.value=!0,je.value=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}],He.value=[],qe.value=new Map,Ke.value=null,Ye.value=null,Xe.value=[],Ne._reloadFloorData=null,Re.value="walls",Kt(),e=()=>this._reloadCurrentFloor(),Ne._reloadFloorData=e,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(De(()=>{this._focusedRoomId=Ke.value}),De(()=>{this._occupancyPanelTarget=Ye.value}),De(()=>{Oe.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const e=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=e}catch(e){console.error("Error loading HA areas:",e)}}async _reloadCurrentFloor(){if(!this.hass)return;const e=Fe.value;if(e)try{const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t;const o=t.find(t=>t.id===e.id);if(o){Fe.value=o;const e=Oe.value?.id;if(e){const t=o.floors.find(t=>t.id===e);t?Oe.value=t:o.floors.length>0&&(Oe.value=o.floors[0])}else o.floors.length>0&&(Oe.value=o.floors[0]);await this._loadDevicePlacements(o.id)}}catch(e){console.error("Error reloading floor data:",e)}}_detectFloorConflicts(e){const t=new Map;for(const o of e.floors){const e=It(o.nodes,o.edges);e.length>0&&(t.set(o.id,e),console.warn(`[inhabit] Detected ${e.length} constraint conflict(s) on floor "${o.id}":`,e.map(e=>`${e.edgeId} (${e.type})`)))}qe.value=t}updated(e){e.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e,e.length>0&&(Fe.value=e[0],e[0].floors.length>0&&(Oe.value=e[0].floors[0],Ze.value=e[0].grid_size),this._detectFloorConflicts(e[0]),await this._loadDevicePlacements(e[0].id)),this._loading=!1}catch(e){this._loading=!1,this._error=`Failed to load floor plans: ${e}`,console.error("Error loading floor plans:",e)}}async _loadDevicePlacements(e){if(this.hass)try{const[t,o]=await Promise.all([this.hass.callWS({type:"inhabit/devices/list",floor_plan_id:e}),this.hass.callWS({type:"inhabit/mmwave/list",floor_plan_id:e})]);He.value=t,Xe.value=o}catch(e){console.error("Error loading device placements:",e)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(e){if(this.hass)try{const t=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});t.floors=[];for(let o=0;o<e;o++){const e=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:`Floor ${o+1}`,level:o});t.floors.push(e)}this._floorPlans=[t],Fe.value=t,Oe.value=t.floors[0],Ze.value=t.grid_size}catch(e){console.error("Error creating floors:",e),alert(`Failed to create floors: ${e}`)}}async _addFloor(){if(!this.hass)return;const e=Fe.value;if(!e)return;const t=prompt("Floor name:",`Floor ${e.floors.length+1}`);if(t)try{const o=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:t,level:e.floors.length}),i={...e,floors:[...e.floors,o]};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?i:t),Fe.value=i,Oe.value=o}catch(e){console.error("Error adding floor:",e),alert(`Failed to add floor: ${e}`)}}async _deleteFloor(e){if(!this.hass)return;const t=Fe.value;if(t)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:t.id,floor_id:e});const o=t.floors.filter(t=>t.id!==e),i={...t,floors:o};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?i:e),Fe.value=i,Oe.value?.id===e&&(Kt(),Oe.value=o.length>0?o[0]:null)}catch(e){console.error("Error deleting floor:",e),alert(`Failed to delete floor: ${e}`)}}async _renameFloor(e,t){if(!this.hass)return;const o=Fe.value;if(o)try{await this.hass.callWS({type:"inhabit/floors/update",floor_plan_id:o.id,floor_id:e,name:t});const i=o.floors.map(o=>o.id===e?{...o,name:t}:o),n={...o,floors:i};this._floorPlans=this._floorPlans.map(e=>e.id===o.id?n:e),Fe.value=n,Oe.value?.id===e&&(Oe.value={...Oe.value,name:t})}catch(e){console.error("Error renaming floor:",e)}}_openImportExport(){const e=this.shadowRoot?.querySelector("fpb-import-export-dialog");e?.show()}async _handleFloorsImported(e){const{floorPlan:t,switchTo:o}=e.detail;this._floorPlans=this._floorPlans.map(e=>e.id===t.id?t:e),Fe.value=t,o&&(Kt(),Oe.value=o),await this._loadDevicePlacements(t.id)}_handleFloorSelect(e){const t=Fe.value;if(t){const o=t.floors.find(t=>t.id===e);o&&(Oe.value?.id!==o.id&&(Kt(),Ke.value=null),Oe.value=o)}}_handleRoomChipClick(e){Ke.value===e?Ke.value=null:Ke.value=e}_renderRoomChips(){const e=Oe.value;return e&&0!==e.rooms.length?V`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${e.rooms.map(e=>{const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id):null,o=t?.icon||"mdi:floor-plan",i=t?.name??e.name;return V`
            <button
              class="room-chip ${this._focusedRoomId===e.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(e.id)}
            >
              <ha-icon icon=${o} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${i}</span>
            </button>
          `})}
      </div>
    `:null}render(){return this._loading?V`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plans...</p>
        </div>
      `:this._error?V`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?V`
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
              @input=${e=>{const t=parseInt(e.target.value,10);t>=1&&t<=10&&(this._floorCount=t)}}
            />
            <button @click=${()=>this._initializeFloors(this._floorCount)}>Get Started</button>
          </div>
        </div>
      `:V`
      <div class="container">
        <div class="main-area">
          <fpb-toolbar
            .hass=${this.hass}
            .floorPlans=${this._floorPlans}
            @floor-select=${e=>this._handleFloorSelect(e.detail.id)}
            @add-floor=${this._addFloor}
            @delete-floor=${e=>this._deleteFloor(e.detail.id)}
            @rename-floor=${e=>this._renameFloor(e.detail.id,e.detail.name)}
            @open-import-export=${this._openImportExport}
          ></fpb-toolbar>

          ${this._renderRoomChips()}

          ${this._occupancyPanelTarget?V`
            <div class="canvas-with-panel">
              <div class="canvas-container">
                <fpb-canvas .hass=${this.hass}></fpb-canvas>
              </div>
              <fpb-occupancy-panel
                .hass=${this.hass}
                .targetId=${this._occupancyPanelTarget.id}
                .targetName=${this._occupancyPanelTarget.name}
                .targetType=${this._occupancyPanelTarget.type}
                @close-panel=${()=>{Ye.value=null}}
              ></fpb-occupancy-panel>
            </div>
          `:V`
            <div class="canvas-container">
              <fpb-canvas .hass=${this.hass}></fpb-canvas>
            </div>
          `}
        </div>
      </div>
      <fpb-import-export-dialog
        .hass=${this.hass}
        @floors-imported=${this._handleFloorsImported}
      ></fpb-import-export-dialog>
    `}}e([pe({attribute:!1})],ao.prototype,"hass",void 0),e([pe({type:Boolean})],ao.prototype,"narrow",void 0),e([ge()],ao.prototype,"_floorPlans",void 0),e([ge()],ao.prototype,"_loading",void 0),e([ge()],ao.prototype,"_error",void 0),e([ge()],ao.prototype,"_floorCount",void 0),e([ge()],ao.prototype,"_haAreas",void 0),e([ge()],ao.prototype,"_focusedRoomId",void 0),e([ge()],ao.prototype,"_occupancyPanelTarget",void 0),customElements.define("ha-floorplan-builder",ao);export{ao as HaFloorplanBuilder};
