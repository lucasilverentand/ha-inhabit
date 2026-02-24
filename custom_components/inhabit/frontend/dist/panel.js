function e(e,t,i,o){var n,s=arguments.length,r=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new s(i,e,o)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,f=u.trustedTypes,_=f?f.emptyScript:"",y=u.reactiveElementPolyfillSupport,v=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},x=(e,t)=>!l(e,t),b={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=b){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&d(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const s=o?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),n=t.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:m;this._$Em=o;const s=n.fromAttribute(t,e.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(void 0!==e){const s=this.constructor;if(!1===o&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??x)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=e=>e,E=$.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+M,C=`<${I}>`,z=document,A=()=>z.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,T="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,W=/>/g,R=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,B=/"/g,U=/^(?:script|style|textarea|title)$/i,Z=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),H=Z(1),j=Z(2),V=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),K=new WeakMap,Y=z.createTreeWalker(z,129);function X(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(t):t}class G{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,s=0;const r=e.length-1,a=this.parts,[l,d]=((e,t)=>{const i=e.length-1,o=[];let n,s=2===t?"<svg>":3===t?"<math>":"",r=N;for(let t=0;t<i;t++){const i=e[t];let a,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===N?"!--"===l[1]?r=F:void 0!==l[1]?r=W:void 0!==l[2]?(U.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=R):void 0!==l[3]&&(r=R):r===R?">"===l[0]?(r=n??N,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?R:'"'===l[3]?B:O):r===B||r===O?r=R:r===F||r===W?r=N:(r=R,n=void 0);const h=r===R&&e[t+1].startsWith("/>")?" ":"";s+=r===N?i+C:d>=0?(o.push(a),i.slice(0,d)+S+i.slice(d)+M+h):i+M+(-2===d?t:h)}return[X(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]})(e,t);if(this.el=G.createElement(l,i),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=Y.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(S)){const t=d[s++],i=o.getAttribute(e).split(M),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?ie:"?"===r[1]?oe:"@"===r[1]?ne:te}),o.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:n}),o.removeAttribute(e));if(U.test(o.tagName)){const e=o.textContent.split(M),t=e.length-1;if(t>0){o.textContent=E?E.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],A()),Y.nextNode(),a.push({type:2,index:++n});o.append(e[t],A())}}}else if(8===o.nodeType)if(o.data===I)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(M,e+1));)a.push({type:7,index:n}),e+=M.length-1}n++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,o){if(t===V)return t;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=L(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,o)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??z).importNode(t,!0);Y.currentNode=o;let n=Y.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new ee(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new se(n,this,e)),this._$AV.push(t),a=i[++r]}s!==a?.index&&(n=Y.nextNode(),s++)}return Y.currentNode=z,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),L(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=G.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new Q(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new G(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new ee(this.O(A()),this.O(A()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,o){const n=this.strings;let s=!1;if(void 0===n)e=J(this,e,t,0),s=!L(e)||e!==this._$AH&&e!==V,s&&(this._$AH=e);else{const o=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=J(this,o[i+r],t,r),a===V&&(a=this._$AH[r]),s||=!L(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class oe extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class ne extends te{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??q)===V)return;const i=this._$AH,o=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==q&&(i===q||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=$.litHtmlPolyfillSupport;re?.(G,ee),($.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let le=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let n=o._$litPart$;if(void 0===n){const e=i?.renderBefore??null;o._$litPart$=n=new ee(t.insertBefore(A(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};le._$litElement$=!0,le.finalized=!0,ae.litElementHydrateSupport?.({LitElement:le});const de=ae.litElementPolyfillSupport;de?.({LitElement:le}),(ae.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:x},he=(e=ce,t,i)=>{const{kind:o,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,n,e,!0,i)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];t.call(this,i),this.requestUpdate(o,n,e,!0,i)}}throw Error("Unsupported decorator location: "+o)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return pe({...e,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ue=Symbol.for("preact-signals");function fe(){if(me>1)return void me--;let e,t=!1;for(;void 0!==ye;){let i=ye;for(ye=void 0,xe++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&Ee(i))try{i.c()}catch(i){t||(e=i,t=!0)}i=o}}if(xe=0,me--,t)throw e}let _e,ye;function ve(e){const t=_e;_e=void 0;try{return e()}finally{_e=t}}let me=0,xe=0,be=0;function we(e){if(void 0===_e)return;let t=e.n;return void 0===t||t.t!==_e?(t={i:0,S:e,p:_e.s,n:void 0,t:_e,e:void 0,x:void 0,r:t},void 0!==_e.s&&(_e.s.n=t),_e.s=t,e.n=t,32&_e.f&&e.S(t),t):-1===t.i?(t.i=0,void 0!==t.n&&(t.n.p=t.p,void 0!==t.p&&(t.p.n=t.n),t.p=_e.s,t.n=void 0,_e.s.n=t,_e.s=t),t):void 0}function $e(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.W=null==t?void 0:t.watched,this.Z=null==t?void 0:t.unwatched,this.name=null==t?void 0:t.name}function ke(e,t){return new $e(e,t)}function Ee(e){for(let t=e.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function Pe(e){for(let t=e.s;void 0!==t;t=t.n){const i=t.S.n;if(void 0!==i&&(t.r=i),t.S.n=t,t.i=-1,void 0===t.n){e.s=t;break}}}function Se(e){let t,i=e.s;for(;void 0!==i;){const e=i.p;-1===i.i?(i.S.U(i),void 0!==e&&(e.n=i.n),void 0!==i.n&&(i.n.p=e)):t=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=e}e.s=t}function Me(e,t){$e.call(this,void 0),this.x=e,this.s=void 0,this.g=be-1,this.f=4,this.W=null==t?void 0:t.watched,this.Z=null==t?void 0:t.unwatched,this.name=null==t?void 0:t.name}function Ie(e,t){return new Me(e,t)}function Ce(e){const t=e.u;if(e.u=void 0,"function"==typeof t){me++;const i=_e;_e=void 0;try{t()}catch(t){throw e.f&=-2,e.f|=8,ze(e),t}finally{_e=i,fe()}}}function ze(e){for(let t=e.s;void 0!==t;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,Ce(e)}function Ae(e){if(_e!==this)throw new Error("Out-of-order effect");Se(this),_e=e,this.f&=-2,8&this.f&&ze(this),fe()}function Le(e,t){this.x=e,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==t?void 0:t.name}function De(e,t){const i=new Le(e,t);try{i.c()}catch(e){throw i.d(),e}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}$e.prototype.brand=ue,$e.prototype.h=function(){return!0},$e.prototype.S=function(e){const t=this.t;t!==e&&void 0===e.e&&(e.x=t,this.t=e,void 0!==t?t.e=e:ve(()=>{var e;null==(e=this.W)||e.call(this)}))},$e.prototype.U=function(e){if(void 0!==this.t){const t=e.e,i=e.x;void 0!==t&&(t.x=i,e.e=void 0),void 0!==i&&(i.e=t,e.x=void 0),e===this.t&&(this.t=i,void 0===i&&ve(()=>{var e;null==(e=this.Z)||e.call(this)}))}},$e.prototype.subscribe=function(e){return De(()=>{const t=this.value,i=_e;_e=void 0;try{e(t)}finally{_e=i}},{name:"sub"})},$e.prototype.valueOf=function(){return this.value},$e.prototype.toString=function(){return this.value+""},$e.prototype.toJSON=function(){return this.value},$e.prototype.peek=function(){const e=_e;_e=void 0;try{return this.value}finally{_e=e}},Object.defineProperty($e.prototype,"value",{get(){const e=we(this);return void 0!==e&&(e.i=this.i),this.v},set(e){if(e!==this.v){if(xe>100)throw new Error("Cycle detected");this.v=e,this.i++,be++,me++;try{for(let e=this.t;void 0!==e;e=e.x)e.t.N()}finally{fe()}}}}),Me.prototype=new $e,Me.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===be)return!0;if(this.g=be,this.f|=1,this.i>0&&!Ee(this))return this.f&=-2,!0;const e=_e;try{Pe(this),_e=this;const e=this.x();(16&this.f||this.v!==e||0===this.i)&&(this.v=e,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return _e=e,Se(this),this.f&=-2,!0},Me.prototype.S=function(e){if(void 0===this.t){this.f|=36;for(let e=this.s;void 0!==e;e=e.n)e.S.S(e)}$e.prototype.S.call(this,e)},Me.prototype.U=function(e){if(void 0!==this.t&&($e.prototype.U.call(this,e),void 0===this.t)){this.f&=-33;for(let e=this.s;void 0!==e;e=e.n)e.S.U(e)}},Me.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let e=this.t;void 0!==e;e=e.x)e.t.N()}},Object.defineProperty(Me.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const e=we(this);if(this.h(),void 0!==e&&(e.i=this.i),16&this.f)throw this.v;return this.v}}),Le.prototype.c=function(){const e=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const e=this.x();"function"==typeof e&&(this.u=e)}finally{e()}},Le.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Ce(this),Pe(this),me++;const e=_e;return _e=this,Ae.bind(this,e)},Le.prototype.N=function(){2&this.f||(this.f|=2,this.o=ye,ye=this)},Le.prototype.d=function(){this.f|=8,1&this.f||ze(this)},Le.prototype.dispose=function(){this.d()},window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:ke(null),currentFloor:ke(null),canvasMode:ke("walls"),activeTool:ke("select"),selection:ke({type:"none",ids:[]}),viewBox:ke({x:0,y:0,width:1e3,height:800}),gridSize:ke(10),snapToGrid:ke(!0),showGrid:ke(!0),layers:ke([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),lightPlacements:ke([]),switchPlacements:ke([]),constraintConflicts:ke(new Map),focusedRoomId:ke(null),occupancyPanelTarget:ke(null),devicePanelTarget:ke(null),mmwavePlacements:ke([]),simulatedTargets:ke([]),simHitboxEnabled:ke(!0),_reloadFloorData:null});const Te=window.__inhabit_signals,Ne=Te.currentFloorPlan,Fe=Te.currentFloor,We=Te.canvasMode,Re=Te.activeTool,Oe=Te.selection,Be=Te.viewBox,Ue=Te.gridSize,Ze=Te.snapToGrid,He=Te.showGrid,je=Te.layers,Ve=Te.lightPlacements,qe=Te.switchPlacements,Ke=Te.constraintConflicts,Ye=Te.focusedRoomId,Xe=Te.occupancyPanelTarget,Ge=Te.devicePanelTarget,Je=Te.mmwavePlacements,Qe=Te.simulatedTargets,et=Te.simHitboxEnabled;function tt(e){We.value=e,Re.value="select",Oe.value={type:"none",ids:[]},"occupancy"!==e&&(Xe.value=null),"placement"!==e&&(Ge.value=null),"simulate"!==e&&(Qe.value=[],et.value=!0)}async function it(){Te._reloadFloorData&&await Te._reloadFloorData()}function ot(e){const t=e.vertices;if(0===t.length)return"";const i=t.map((e,t)=>`${0===t?"M":"L"}${e.x},${e.y}`);return i.join(" ")+" Z"}function nt(e,t){const i=t.x-e.x,o=t.y-e.y;return Math.sqrt(i*i+o*o)}function st(e,t){return{x:Math.round(e.x/t)*t,y:Math.round(e.y/t)*t}}function rt(e){const t=e.vertices;if(t.length<3)return 0;let i=0;const o=t.length;for(let e=0;e<o;e++){const n=(e+1)%o;i+=t[e].x*t[n].y,i-=t[n].x*t[e].y}return i/2}function at(e){if(e.length<2)return{anchor:e[0]||{x:0,y:0},dir:{x:1,y:0}};let t=0,i=e[0],o=e[1];for(let n=0;n<e.length;n++)for(let s=n+1;s<e.length;s++){const r=nt(e[n],e[s]);r>t&&(t=r,i=e[n],o=e[s])}if(t<1e-9)return{anchor:i,dir:{x:1,y:0}};return{anchor:i,dir:{x:(o.x-i.x)/t,y:(o.y-i.y)/t}}}function lt(e,t,i){const o=e.x-t.x,n=e.y-t.y,s=o*i.x+n*i.y;return{x:t.x+s*i.x,y:t.y+s*i.y}}const dt=.05,ct=.2,ht="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),pt="%c[constraint]",gt="color:#8b5cf6;font-weight:bold",ut="color:#888",ft="color:#ef4444;font-weight:bold",_t="color:#22c55e;font-weight:bold";function yt(e){return`(${e.x.toFixed(1)},${e.y.toFixed(1)})`}function vt(e,t){const i=t.get(e.start_node),o=t.get(e.end_node),n=[];"free"!==e.direction&&n.push(e.direction),e.length_locked&&n.push("len🔒"),e.angle_group&&n.push(`ang:${e.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=i&&o?nt(i,o).toFixed(1):"?";return`${e.id.slice(0,8)}… (${r}cm${s})`}function mt(e){return e.slice(0,8)+"…"}function xt(e,t){const i=new Map,o=new Map,n=new Map;for(const t of e)i.set(t.id,t);for(const e of t)o.set(e.id,e),n.has(e.start_node)||n.set(e.start_node,[]),n.get(e.start_node).push({edgeId:e.id,endpoint:"start"}),n.has(e.end_node)||n.set(e.end_node,[]),n.get(e.end_node).push({edgeId:e.id,endpoint:"end"});return{nodes:i,edges:o,nodeToEdges:n}}function bt(e){return"free"!==e.direction||e.length_locked}function wt(e){const t=new Map;for(const[i,o]of e.nodes)t.set(i,{x:o.x,y:o.y});return t}function $t(e,t,i,o,n){let s={x:o.x,y:o.y};if("horizontal"===e.direction?s={x:s.x,y:i.y}:"vertical"===e.direction&&(s={x:i.x,y:s.y}),e.length_locked){const t=nt(n.nodes.get(e.start_node),n.nodes.get(e.end_node)),o=s.x-i.x,r=s.y-i.y,a=Math.sqrt(o*o+r*r);if(a>0&&t>0){const e=t/a;s={x:i.x+o*e,y:i.y+r*e}}}return s}function kt(e,t,i,o,n){const s=o.has(e.start_node),r=o.has(e.end_node);if(s&&r)return{idealStart:t,idealEnd:i};if(s){return{idealStart:t,idealEnd:$t(e,e.start_node,t,i,n)}}if(r){return{idealStart:$t(e,e.end_node,i,t,n),idealEnd:i}}return function(e,t,i,o){const n=nt(o.nodes.get(e.start_node),o.nodes.get(e.end_node));let s={x:t.x,y:t.y},r={x:i.x,y:i.y};if("horizontal"===e.direction){const e=(s.y+r.y)/2;s={x:s.x,y:e},r={x:r.x,y:e}}else if("vertical"===e.direction){const e=(s.x+r.x)/2;s={x:e,y:s.y},r={x:e,y:r.y}}if(e.length_locked){const e=(s.x+r.x)/2,t=(s.y+r.y)/2,i=r.x-s.x,o=r.y-s.y,a=Math.sqrt(i*i+o*o);if(a>0&&n>0){const l=n/2/(a/2);s={x:e-i/2*l,y:t-o/2*l},r={x:e+i/2*l,y:t+o/2*l}}}return{idealStart:s,idealEnd:r}}(e,t,i,n)}function Et(e,t){let i=0;const o=[],n=new Map;for(const[s,r]of e.edges){if(!bt(r))continue;const a=t.get(r.start_node),l=t.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const t=nt(e.nodes.get(r.start_node),e.nodes.get(r.end_node)),i=nt(a,l);d=Math.max(d,Math.abs(i-t))}n.set(s,d),d>ct&&o.push(s),d>i&&(i=d)}const s=St(e,t);for(const[,r]of s){let s=0;for(const e of r.nodeIds){const i=t.get(e);if(!i)continue;const o=nt(i,lt(i,r.anchor,r.dir));s=Math.max(s,o)}for(const[t,i]of e.edges)if(i.collinear_group&&r.nodeIds.has(i.start_node)){const e=n.get(t)??0;n.set(t,Math.max(e,s)),s>ct&&(o.includes(t)||o.push(t));break}i=Math.max(i,s)}const r=Mt(e);for(const[,s]of r){const r=t.get(s.sharedNodeId);if(!r)continue;let a=0;for(let i=0;i<s.edgeIds.length;i++){const o=e.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=t.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=nt(r,l);for(let o=i+1;o<s.edgeIds.length;o++){const i=e.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=t.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let p=d-h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;const g=(c+nt(r,l))/2;a=Math.max(a,Math.abs(p)*g)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>ct&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}const a=Ct(e);for(const[,s]of a){const r=[];for(const i of s.edgeIds){const o=e.edges.get(i),n=t.get(o.start_node),s=t.get(o.end_node);n&&s?r.push(nt(n,s)):r.push(0)}let a=0;for(const e of r)a=Math.max(a,Math.abs(e-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>ct&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}return{maxViolation:i,violatingEdgeIds:o,magnitudes:n}}function Pt(e,t,i,o){const n=function(e,t){const i=[],o=new Set,n=new Set,s=[];for(const e of t)s.push(e),n.add(e);for(;s.length>0;){const t=s.shift(),r=e.nodeToEdges.get(t)||[];for(const{edgeId:a}of r){if(o.has(a))continue;o.add(a);const r=e.edges.get(a);if(!r)continue;i.push(r);const l=r.start_node===t?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return i}(e,t),s=n.filter(bt),r=St(e,i),a=Mt(e),l=Ct(e);let d=0,c=0;ht&&(console.groupCollapsed(pt+" solveIterative: %c%d constrained edges, %d pinned nodes",gt,ut,s.length,t.size),console.log("  Pinned nodes:",[...t].map(mt).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(t=>vt(t,e.nodes)).join(" | ")||"(none)"),o&&o.size>0&&console.log("  Pre-existing violations:",[...o.entries()].map(([t,i])=>{const o=e.edges.get(t);return(o?vt(o,e.nodes):t.slice(0,8)+"…")+` (${i.toFixed(2)})`}).join(" | ")));for(let o=0;o<100;o++){d=0,c=o+1;const s=0===o?new Set(t):t;for(const r of n){if(!bt(r))continue;const n=i.get(r.start_node),a=i.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=kt(r,n,a,s,e);if(!t.has(r.start_node)){const e=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,e),i.set(r.start_node,l)}if(!t.has(r.end_node)){const e=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,e),i.set(r.end_node,c)}0===o&&(s.add(r.start_node),s.add(r.end_node))}for(const[,e]of r)for(const o of e.nodeIds){if(t.has(o))continue;const n=i.get(o);if(!n)continue;const s=lt(n,e.anchor,e.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>dt&&(d=Math.max(d,r),i.set(o,s))}const h=It(e,a,t,i);d=Math.max(d,h);const p=zt(e,l,t,i);if(d=Math.max(d,p),d<dt)break}const h=[];for(const[t,o]of i){const i=e.nodes.get(t);(Math.abs(o.x-i.x)>dt||Math.abs(o.y-i.y)>dt)&&h.push({nodeId:t,x:o.x,y:o.y})}if(d<dt)ht&&console.log(pt+" %cConverged%c in %d iteration(s), %d node(s) moved",gt,_t,"",c,h.length);else{const{violatingEdgeIds:t,maxViolation:n,magnitudes:s}=Et(e,i),r=[];for(const e of t)if(o){const t=o.get(e);if(void 0===t)r.push(e);else{(s.get(e)??0)>t+dt&&r.push(e)}}else r.push(e);if(r.length>0)return ht&&(console.log(`${pt} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,gt,ft,""),console.log("  All violating edges:",t.map(t=>{const i=e.edges.get(t);return i?vt(i,e.nodes):t.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",r.map(t=>{const o=e.edges.get(t);if(!o)return t.slice(0,8)+"…";const n=i.get(o.start_node),s=i.get(o.end_node),r=n&&s?` now ${yt(n)}→${yt(s)}`:"";return vt(o,e.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};ht&&console.log(`${pt} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,gt,"color:#f59e0b;font-weight:bold","")}return ht&&console.groupEnd(),{updates:h,blocked:!1}}function St(e,t){const i=new Map,o=new Map;for(const[,t]of e.edges){if(!t.collinear_group)continue;o.has(t.collinear_group)||o.set(t.collinear_group,new Set);const e=o.get(t.collinear_group);e.add(t.start_node),e.add(t.end_node)}for(const[e,n]of o){const o=[];for(const e of n){const i=t.get(e);i&&o.push(i)}if(o.length<2)continue;const{anchor:s,dir:r}=at(o);i.set(e,{nodeIds:n,anchor:s,dir:r})}return i}function Mt(e){const t=new Map,i=new Map;for(const[,t]of e.edges)t.angle_group&&(i.has(t.angle_group)||i.set(t.angle_group,[]),i.get(t.angle_group).push(t.id));for(const[o,n]of i){if(n.length<2)continue;const i=n.map(t=>e.edges.get(t)),s=new Map;for(const e of i)s.set(e.start_node,(s.get(e.start_node)??0)+1),s.set(e.end_node,(s.get(e.end_node)??0)+1);let r=null;for(const[e,t]of s)if(t===n.length){r=e;break}if(!r)continue;const a=e.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const t of i){const i=t.start_node===r?t.end_node:t.start_node,o=e.nodes.get(i);if(!o){d=!1;break}l.push(Math.atan2(o.y-a.y,o.x-a.x))}d&&t.set(o,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return t}function It(e,t,i,o){let n=0;for(const[,s]of t){const t=o.get(s.sharedNodeId);if(!t)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let i=0;i<r;i++){const n=e.edges.get(s.edgeIds[i]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=o.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-t.y,h.x-t.x))}if(!c)continue;const h=[];for(let e=0;e<r;e++){let t=d[e]-s.originalAngles[e];for(;t>Math.PI;)t-=2*Math.PI;for(;t<-Math.PI;)t+=2*Math.PI;h.push(t)}const p=a.map(e=>i.has(e)),g=p.filter(Boolean).length;if(g===r)continue;let u=0,f=0;if(g>0)for(let e=0;e<r;e++)p[e]&&(u+=Math.sin(h[e]),f+=Math.cos(h[e]));else for(let e=0;e<r;e++)u+=Math.sin(h[e]),f+=Math.cos(h[e]);const _=Math.atan2(u,f);for(let e=0;e<r;e++){if(p[e])continue;const i=s.originalAngles[e]+_,r=nt(t,l[e]),d={x:t.x+Math.cos(i)*r,y:t.y+Math.sin(i)*r},c=Math.max(Math.abs(d.x-l[e].x),Math.abs(d.y-l[e].y));n=Math.max(n,c),o.set(a[e],d)}}return n}function Ct(e){const t=new Map,i=new Map;for(const[,t]of e.edges)t.link_group&&(i.has(t.link_group)||i.set(t.link_group,[]),i.get(t.link_group).push(t.id));for(const[o,n]of i){if(n.length<2)continue;let i=0;for(const t of n){const o=e.edges.get(t);i+=nt(e.nodes.get(o.start_node),e.nodes.get(o.end_node))}t.set(o,{edgeIds:n,targetLength:i/n.length})}return t}function zt(e,t,i,o){let n=0;for(const[,s]of t)for(const t of s.edgeIds){const r=e.edges.get(t),a=o.get(r.start_node),l=o.get(r.end_node);if(!a||!l)continue;const d=nt(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=dt)continue;const c=i.has(r.start_node),h=i.has(r.end_node);if(c&&h)continue;const p=l.x-a.x,g=l.y-a.y,u=s.targetLength/d;if(c){const e={x:a.x+p*u,y:a.y+g*u},t=Math.max(Math.abs(e.x-l.x),Math.abs(e.y-l.y));n=Math.max(n,t),o.set(r.end_node,e)}else if(h){const e={x:l.x-p*u,y:l.y-g*u},t=Math.max(Math.abs(e.x-a.x),Math.abs(e.y-a.y));n=Math.max(n,t),o.set(r.start_node,e)}else{const e=(a.x+l.x)/2,t=(a.y+l.y)/2,i=s.targetLength/2/(d/2),c={x:e-p/2*i,y:t-g/2*i},h={x:e+p/2*i,y:t+g/2*i},u=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),o.set(r.start_node,c),o.set(r.end_node,h)}}return n}function At(e,t,i,o){let n=i,s=o;const r=function(e,t){const i=e.nodeToEdges.get(t);if(!i)return null;for(const{edgeId:t}of i){const i=e.edges.get(t);if(i?.collinear_group)return i.collinear_group}return null}(e,t);if(r){const t=function(e,t){const i=new Set;for(const[,o]of e.edges)o.collinear_group===t&&(i.add(o.start_node),i.add(o.end_node));return i}(e,r),a=[];for(const i of t){const t=e.nodes.get(i);t&&a.push({x:t.x,y:t.y})}if(a.length>=2){const{anchor:e,dir:t}=at(a),r=lt({x:i,y:o},e,t);n=r.x,s=r.y}}const a=wt(e),{magnitudes:l}=Et(e,a),d=wt(e);d.set(t,{x:n,y:s});const c=new Set([t]);for(const[i,o]of e.nodes)o.pinned&&i!==t&&c.add(i);const h=Pt(e,c,d,l),p=h.updates.some(e=>e.nodeId===t);if(!p){const i=e.nodes.get(t);i.x===n&&i.y===s||h.updates.unshift({nodeId:t,x:n,y:s})}const g=h.updates.find(e=>e.nodeId===t);if(g&&(g.x=n,g.y=s),h.updates=h.updates.filter(i=>i.nodeId===t||!e.nodes.get(i.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:t,magnitudes:i}=Et(e,d),o=[];for(const e of t){const t=l.get(e);if(void 0===t)o.push(e);else{(i.get(e)??0)>t+dt&&o.push(e)}}o.length>0&&(h.blocked=!0,h.blockedBy=o)}return h}function Lt(e,t,i){const o=e.edges.get(t);if(!o)return{updates:[],blocked:!1};if(ht&&console.log(pt+" solveEdgeLengthChange: %c%s → %scm",gt,ut,vt(o,e.nodes),i.toFixed(1)),o.length_locked)return ht&&console.log(pt+" %c→ BLOCKED: edge is length-locked",gt,ft),{updates:[],blocked:!0,blockedBy:[o.id]};const n=e.nodes.get(o.start_node),s=e.nodes.get(o.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===nt(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(e,t){const i=t.get(e.start_node),o=t.get(e.end_node);return Math.atan2(o.y-i.y,o.x-i.x)}(o,e.nodes),d=i/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},p=wt(e);p.set(o.start_node,c),p.set(o.end_node,h);const g=new Set([o.start_node,o.end_node]);for(const[t,i]of e.nodes)i.pinned&&g.add(t);const u=Pt(e,g,p);return u.updates.some(e=>e.nodeId===o.start_node)||u.updates.unshift({nodeId:o.start_node,x:c.x,y:c.y}),u.updates.some(e=>e.nodeId===o.end_node)||u.updates.push({nodeId:o.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(t=>t.nodeId===o.start_node||t.nodeId===o.end_node||!e.nodes.get(t.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function Dt(e){const t=new Map;for(const i of e)t.set(i.nodeId,{x:i.x,y:i.y});return t}function Tt(e,t,i,o,n){const s=At(xt(e,t),i,o,n);return{positions:Dt(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function Nt(e,t,i){const o=e.edges.get(t);if(!o)return{updates:[],blocked:!1};const n=e.nodes.get(o.start_node),s=e.nodes.get(o.end_node);ht&&(console.group(pt+" solveConstraintSnap: %csnap %s → %s",gt,ut,vt(o,e.nodes),i),console.log(`  Nodes: ${mt(o.start_node)} ${yt(n)} → ${mt(o.end_node)} ${yt(s)}`));const r=function(e,t,i){if("free"===t)return null;const o=i.get(e.start_node),n=i.get(e.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=nt(o,n)/2;if("horizontal"===t){if(Math.round(o.y)===Math.round(n.y))return null;const t=o.x<=n.x;return{nodeUpdates:[{nodeId:e.start_node,x:t?s-a:s+a,y:r},{nodeId:e.end_node,x:t?s+a:s-a,y:r}]}}if("vertical"===t){if(Math.round(o.x)===Math.round(n.x))return null;const t=o.y<=n.y;return{nodeUpdates:[{nodeId:e.start_node,x:s,y:t?r-a:r+a},{nodeId:e.end_node,x:s,y:t?r+a:r-a}]}}return null}(o,i,e.nodes);if(!r)return ht&&(console.log(pt+" %cAlready satisfies %s — no-op",gt,_t,i),console.groupEnd()),{updates:[],blocked:!1};const a=wt(e),{magnitudes:l}=Et(e,a),d=r.nodeUpdates.find(e=>e.nodeId===o.start_node),c=r.nodeUpdates.find(e=>e.nodeId===o.end_node);ht&&console.log(`  Snap target: ${mt(o.start_node)} ${yt(d)} → ${mt(o.end_node)} ${yt(c)}`);const h=wt(e);h.set(o.start_node,{x:d.x,y:d.y}),h.set(o.end_node,{x:c.x,y:c.y});const p=new Set([o.start_node,o.end_node]);for(const[t,i]of e.nodes)i.pinned&&p.add(t);const g=Pt(e,p,h,l);return g.updates.some(e=>e.nodeId===o.start_node)||g.updates.unshift({nodeId:o.start_node,x:d.x,y:d.y}),g.updates.some(e=>e.nodeId===o.end_node)||g.updates.push({nodeId:o.end_node,x:c.x,y:c.y}),g.updates=g.updates.filter(t=>t.nodeId===o.start_node||t.nodeId===o.end_node||!e.nodes.get(t.nodeId)?.pinned),ht&&(g.blocked?console.log(pt+" %c→ SNAP BLOCKED by: %s",gt,ft,(g.blockedBy||[]).map(t=>{const i=e.edges.get(t);return i?vt(i,e.nodes):t.slice(0,8)+"…"}).join(" | ")):console.log(pt+" %c→ Snap OK%c, %d node(s) to update",gt,_t,"",g.updates.length),console.groupEnd()),g}function Ft(e,t,i=.2){const o=new Map;for(const t of e)o.set(t.id,t);const n=[];for(const e of t){const t=o.get(e.start_node),s=o.get(e.end_node);if(t&&s)if("horizontal"===e.direction){const o=Math.abs(t.y-s.y);o>i&&n.push({edgeId:e.id,type:"direction",expected:0,actual:o})}else if("vertical"===e.direction){const o=Math.abs(t.x-s.x);o>i&&n.push({edgeId:e.id,type:"direction",expected:0,actual:o})}}const s=new Map,r=new Map;for(const e of t)e.collinear_group&&(s.has(e.collinear_group)||(s.set(e.collinear_group,new Set),r.set(e.collinear_group,e.id)),s.get(e.collinear_group).add(e.start_node),s.get(e.collinear_group).add(e.end_node));for(const[e,t]of s){const s=[];for(const e of t){const t=o.get(e);t&&s.push({x:t.x,y:t.y})}if(s.length<2)continue;const{anchor:a,dir:l}=at(s);let d=0;for(const e of s){const t=lt(e,a,l);d=Math.max(d,nt(e,t))}d>i&&n.push({edgeId:r.get(e),type:"collinear",expected:0,actual:d})}const a=new Map;for(const e of t)e.link_group&&(a.has(e.link_group)||a.set(e.link_group,[]),a.get(e.link_group).push(e.id));for(const[,e]of a){if(e.length<2)continue;const s=[];for(const i of e){const e=t.find(e=>e.id===i),n=o.get(e.start_node),r=o.get(e.end_node);n&&r?s.push(nt(n,r)):s.push(0)}const r=s.reduce((e,t)=>e+t,0)/s.length;let a=0;for(const e of s)a=Math.max(a,Math.abs(e-r));a>i&&n.push({edgeId:e[0],type:"link_group",expected:r,actual:a})}return n}function Wt(e){const t=new Map;for(const i of e)t.set(i.id,i);return t}function Rt(e,t){const i=t.get(e.start_node),o=t.get(e.end_node);return i&&o?{...e,startPos:{x:i.x,y:i.y},endPos:{x:o.x,y:o.y}}:null}function Ot(e){const t=Wt(e.nodes),i=[];for(const o of e.edges){const e=Rt(o,t);e&&i.push(e)}return i}function Bt(e,t){return t.filter(t=>t.start_node===e||t.end_node===e)}function Ut(e,t,i){let o=null,n=i;for(const i of t){const t=Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2);t<n&&(n=t,o=i)}return o}function Zt(e){let t=0;const i=e.length;for(let o=0;o<i;o++){const n=(o+1)%i;t+=e[o].x*e[n].y,t-=e[n].x*e[o].y}return t/2}function Ht(e){const t=e.length;if(t<3){let i=0,o=0;for(const t of e)i+=t.x,o+=t.y;return{x:i/t,y:o/t}}let i=0,o=0,n=0;for(let s=0;s<t;s++){const r=(s+1)%t,a=e[s].x*e[r].y-e[r].x*e[s].y;i+=a,o+=(e[s].x+e[r].x)*a,n+=(e[s].y+e[r].y)*a}if(i/=2,Math.abs(i)<1e-6){let i=0,o=0;for(const t of e)i+=t.x,o+=t.y;return{x:i/t,y:o/t}}const s=1/(6*i);return{x:o*s,y:n*s}}const jt=ke([]),Vt=ke([]),qt=ke(!1),Kt=Ie(()=>jt.value.length>0&&!qt.value),Yt=Ie(()=>Vt.value.length>0&&!qt.value);function Xt(e){jt.value=[...jt.value.slice(-99),e],Vt.value=[]}async function Gt(){const e=jt.value;if(0===e.length||qt.value)return;const t=e[e.length-1];qt.value=!0;try{await t.undo()}finally{qt.value=!1}jt.value=e.slice(0,-1),Vt.value=[...Vt.value,t]}async function Jt(){const e=Vt.value;if(0===e.length||qt.value)return;const t=e[e.length-1];qt.value=!0;try{await t.redo()}finally{qt.value=!1}Vt.value=e.slice(0,-1),jt.value=[...jt.value,t]}function Qt(){jt.value=[],Vt.value=[]}const ei=85*Math.PI/180;function ti(e,t,i,o,n,s){const r=n*Math.PI/180,a=s?1:-1,l=Math.cos(r),d=a*Math.sin(r),c=i-e,h=o-t,p=e+l*c-d*h,g=t+d*c+l*h,u=p-e,f=g-t,_=a*(4/3)*Math.tan(r/4);return{ox:p,oy:g,cp1x:i-_*h,cp1y:o+_*c,cp2x:p+_*f,cp2y:g-_*u}}const ii=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function oi(e){let t=0;for(let i=0;i<e.length;i++)t=(t<<5)-t+e.charCodeAt(i);return ii[Math.abs(t)%ii.length]}class ni extends le{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._panStart={x:0,y:0},this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._iconCache=new Map,this._iconLoaders=new Map,this._stateIconCache=new Map,this._stateIconLoaders=new Map,this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._entitySearch="",this._openingPreview=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,this._zoneEditor=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave=null,this._draggingSimTarget=null,this._simMoveThrottle=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(De(()=>{this._viewBox=Be.value}),De(()=>{const e=We.value,t=this._canvasMode;this._canvasMode=e,"simulate"===t&&"simulate"!==e&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),De(()=>{const e=Fe.value;e&&e.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=e.id,requestAnimationFrame(()=>this._fitToFloor(e)))}),De(()=>{const e=Ye.value,t=this._focusedRoomId;this._focusedRoomId=e,e?requestAnimationFrame(()=>this._animateToRoom(e)):null!==t&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas(),this._resizeObserver=new ResizeObserver(()=>{const e=Fe.value;e&&this._fitToFloor(e)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),null!==this._swingRaf&&(cancelAnimationFrame(this._swingRaf),this._swingRaf=null),null!==this._blinkTimer&&(clearTimeout(this._blinkTimer),this._blinkTimer=null),this._resizeObserver?.disconnect(),this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const e=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=e}catch(e){console.error("Error loading HA areas:",e)}}_handleWheel(e){e.preventDefault(),this._cancelViewBoxAnimation();const t=e.deltaY>0?1.1:.9,i=this._screenToSvg({x:e.clientX,y:e.clientY}),o=this._viewBox.width*t,n=this._viewBox.height*t;if(o<100||o>1e4)return;const s={x:i.x-(i.x-this._viewBox.x)*t,y:i.y-(i.y-this._viewBox.y)*t,width:o,height:n};Be.value=s,this._viewBox=s}_handlePointerDown(e){const t=this._screenToSvg({x:e.clientX,y:e.clientY}),i=Re.value,o=this._getSnappedPoint(t,"light"===i||"switch"===i||"mmwave"===i||"wall"===i||"zone"===i),n=this._canvasMode;if(this._pendingDevice&&"light"!==Re.value&&"switch"!==Re.value&&(this._pendingDevice=null),1===e.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},void this._svg?.setPointerCapture(e.pointerId);if("viewing"===n&&0===e.button){if(this._handleSelectClick(t,e.shiftKey))return;return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},void this._svg?.setPointerCapture(e.pointerId)}if("simulate"===n&&(0===e.button||2===e.button)){const i=Qe.value,o=this._viewBox,n=.015*Math.max(o.width,o.height),s=i.find(e=>{const i=e.position.x-t.x,o=e.position.y-t.y;return Math.sqrt(i*i+o*o)<n});if(2===e.button&&s)return void this._removeSimulatedTarget(s.id);if(0===e.button)return void(s?(this._draggingSimTarget={targetId:s.id,pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId)):this._addSimulatedTarget(t))}if(0===e.button)if("select"===i){const i=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null;if(this._handleSelectClick(t,e.shiftKey)){if("zone"===Oe.value.type&&1===Oe.value.ids.length){const i=Fe.value,o=i?.zones?.find(e=>e.id===Oe.value.ids[0]);o?.polygon?.vertices&&(this._draggingZone={zone:o,startPoint:t,originalVertices:o.polygon.vertices.map(e=>({x:e.x,y:e.y})),hasMoved:!1,pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId))}else if(("light"===Oe.value.type||"switch"===Oe.value.type||"mmwave"===Oe.value.type)&&1===Oe.value.ids.length){const i=Oe.value.type,o=Oe.value.ids[0];let n=null;n="light"===i?Ve.value.find(e=>e.id===o)?.position??null:"switch"===i?qe.value.find(e=>e.id===o)?.position??null:Je.value.find(e=>e.id===o)?.position??null,n&&(this._draggingPlacement={type:i,id:o,startPoint:t,originalPosition:{...n},hasMoved:!1,pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId))}}else i&&(Oe.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},this._svg?.setPointerCapture(e.pointerId)}else if("wall"===i){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const t=this._wallStartPoint&&e.shiftKey?this._cursorPos:o;this._handleWallClick(t,e.shiftKey)}else"light"===i||"switch"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(o)):"mmwave"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._placeMmwave(o)):"door"===i||"window"===i?this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(i)):"zone"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._handleZonePolyClick(this._cursorPos)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:e.clientX,y:e.clientY},this._svg?.setPointerCapture(e.pointerId))}_handleDeviceClick(e){this._pendingDevice={position:e},this._entitySearch=""}async _placeOpening(e){if(!this.hass||!this._openingPreview)return;const t=Fe.value,i=Ne.value;if(!t||!i)return;const o=this.hass,n=i.id,s=t.id,{edgeId:r,t:a,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,p="door"===e?80:100,g=e,u={...l},f={...d},_=c,y={...h};try{const t=await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:r,position:a,new_type:g,width:p,..."door"===e?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await it(),await this._syncRoomsWithEdges();const i=t.edges.map(e=>e.id);Xt({type:"opening_place",description:`Place ${e}`,undo:async()=>{for(const e of i)try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:e})}catch{}await o.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:f,thickness:_}),await it(),await this._syncRoomsWithEdges()},redo:async()=>{const t=Fe.value;if(!t)return;const i=Ot(t).find(e=>{if("wall"!==e.type)return!1;const t=this._getClosestPointOnSegment(y,e.startPos,e.endPos);return Math.sqrt((t.x-y.x)**2+(t.y-y.y)**2)<5});i&&await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:i.id,position:a,new_type:g,width:p,..."door"===e?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await it(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error placing opening:",e)}}_handlePointerMove(e){const t=this._screenToSvg({x:e.clientX,y:e.clientY}),i=Re.value;let o=this._getSnappedPoint(t,"light"===i||"switch"===i||"mmwave"===i||"wall"===i||"zone"===i);if(e.shiftKey&&"wall"===i&&this._wallStartPoint){o=Math.abs(o.x-this._wallStartPoint.x)>=Math.abs(o.y-this._wallStartPoint.y)?{x:o.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:o.y}}if("zone"===i&&this._zonePolyPoints.length>0){const e=this._zonePolyPoints[this._zonePolyPoints.length-1],t=Math.abs(o.x-e.x),i=Math.abs(o.y-e.y),n=15;i<n&&t>n?o={x:o.x,y:e.y}:t<n&&i>n&&(o={x:e.x,y:o.y})}if(this._cursorPos=o,this._draggingSimTarget)return this._moveSimulatedTargetLocal(this._draggingSimTarget.targetId,t),void this._throttledMoveSimTarget(this._draggingSimTarget.targetId,t);if(this._draggingZone){const e=t.x-this._draggingZone.startPoint.x,i=t.y-this._draggingZone.startPoint.y;if(!this._draggingZone.hasMoved&&(Math.abs(e)>3||Math.abs(i)>3)&&(this._draggingZone.hasMoved=!0),this._draggingZone.hasMoved){const t=this._draggingZone.zone;if(t.polygon?.vertices){const o={x:this._draggingZone.originalVertices[0].x+e,y:this._draggingZone.originalVertices[0].y+i},n=Ze.value?st(o,Ue.value):o,s=n.x-o.x,r=n.y-o.y;for(let o=0;o<t.polygon.vertices.length;o++)t.polygon.vertices[o]={x:this._draggingZone.originalVertices[o].x+e+s,y:this._draggingZone.originalVertices[o].y+i+r}}this.requestUpdate()}return}if(this._draggingPlacement){const e=t.x-this._draggingPlacement.startPoint.x,i=t.y-this._draggingPlacement.startPoint.y;if(!this._draggingPlacement.hasMoved&&(Math.abs(e)>3||Math.abs(i)>3)&&(this._draggingPlacement.hasMoved=!0),this._draggingPlacement.hasMoved){const t={x:this._draggingPlacement.originalPosition.x+e,y:this._draggingPlacement.originalPosition.y+i},o=Ze.value?st(t,Ue.value):t,n=this._draggingPlacement;"light"===n.type?Ve.value=Ve.value.map(e=>e.id===n.id?{...e,position:o}:e):"switch"===n.type?qe.value=qe.value.map(e=>e.id===n.id?{...e,position:o}:e):Je.value=Je.value.map(e=>e.id===n.id?{...e,position:o}:e),this.requestUpdate()}return}if(this._rotatingMmwave)this._handleMmwaveRotationMove(t);else{if(this._draggingZoneVertex){let e=this._getSnappedPoint(t,!0);const i=this._draggingZoneVertex.zone;if(i.polygon?.vertices){const t=i.polygon.vertices,o=this._draggingZoneVertex.vertexIndex,n=t.length,s=t[(o-1+n)%n],r=t[(o+1)%n],a=15;for(const t of[s,r])Math.abs(e.x-t.x)<a&&(e={x:t.x,y:e.y}),Math.abs(e.y-t.y)<a&&(e={x:e.x,y:t.y});t[o]={x:e.x,y:e.y}}return void this.requestUpdate()}if(this._draggingNode){const i=e.clientX-this._draggingNode.startX,o=e.clientY-this._draggingNode.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(t),void this.requestUpdate()}if(this._isPanning){const t=(e.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(e.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-t,y:this._viewBox.y-i};return this._panStart={x:e.clientX,y:e.clientY},Be.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||"walls"!==this._canvasMode||this._checkNodeHover(t),"zone"===i&&this._zonePolyPoints.length>0&&this.requestUpdate(),"door"!==i&&"window"!==i||this._updateOpeningPreview(t)}}_checkNodeHover(e){const t=Fe.value;if(!t)return void(this._hoveredNode=null);const i=Ut(e,t.nodes,15);this._hoveredNode=i}_updateOpeningPreview(e){const t=Fe.value;if(!t)return void(this._openingPreview=null);const i=Ot(t);let o=null,n=30,s=e,r=0;for(const t of i){if("wall"!==t.type)continue;const i=this._getClosestPointOnSegment(e,t.startPos,t.endPos),a=Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2);if(a<n){n=a,o=t,s=i;const e=t.endPos.x-t.startPos.x,l=t.endPos.y-t.startPos.y,d=e*e+l*l;r=d>0?((i.x-t.startPos.x)*e+(i.y-t.startPos.y)*l)/d:0}}this._openingPreview=o?{edgeId:o.id,position:s,startPos:o.startPos,endPos:o.endPos,thickness:o.thickness,t:r}:null,this.requestUpdate()}_handlePointerUp(e){if(this._draggingSimTarget){const t=this._screenToSvg({x:e.clientX,y:e.clientY});return this._sendSimTargetMove(this._draggingSimTarget.targetId,t),this._svg?.releasePointerCapture(e.pointerId),this._draggingSimTarget=null,void(this._simMoveThrottle&&(clearTimeout(this._simMoveThrottle),this._simMoveThrottle=null))}if(this._rotatingMmwave)return this._finishMmwaveRotation(),void this._svg?.releasePointerCapture(e.pointerId);if(this._draggingPlacement)return this._draggingPlacement.hasMoved&&this._finishPlacementDrag(),this._svg?.releasePointerCapture(e.pointerId),void(this._draggingPlacement=null);if(this._draggingZone){if(this._draggingZone.hasMoved)this._finishZoneDrag();else if("occupancy"===this._canvasMode){const e=this._draggingZone.zone,t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;Xe.value={id:e.id,name:t,type:"zone"},Ye.value=e.id}else{const e=this._draggingZone.zone;this._zoneEditor={zone:e,editName:e.name,editColor:e.color,editAreaId:e.ha_area_id??null}}return this._svg?.releasePointerCapture(e.pointerId),void(this._draggingZone=null)}return this._draggingZoneVertex?(this._finishZoneVertexDrag(),this._svg?.releasePointerCapture(e.pointerId),void(this._draggingZoneVertex=null)):this._draggingNode?(this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(e.pointerId)):void(this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(e.pointerId)))}async _handleDblClick(e){if("walls"!==this._canvasMode)return;const t=this._screenToSvg({x:e.clientX,y:e.clientY}),i=Fe.value,o=Ne.value;if(!i||!o||!this.hass)return;const n=Ut(t,i.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Ot(i);for(const e of s){if(this._pointToSegmentDistance(t,e.startPos,e.endPos)<e.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:o.id,floor_id:i.id,edge_id:e.id,point:{x:t.x,y:t.y}}),await it(),await this._syncRoomsWithEdges()}catch(e){console.error("Failed to split edge:",e)}return}}}async _handleContextMenu(e){if("simulate"===this._canvasMode)return void e.preventDefault();if("walls"!==this._canvasMode)return;e.preventDefault();const t=this._screenToSvg({x:e.clientX,y:e.clientY}),i=Fe.value,o=Ne.value;if(!i||!o||!this.hass)return;const n=Ut(t,i.nodes,15);if(!n)return;if(2===Bt(n.id,i.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:o.id,floor_id:i.id,node_id:n.id}),await it(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Oe.value={type:"none",ids:[]},this._edgeEditor=null}catch(e){console.error("Failed to dissolve node:",e)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Re.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const e=Fe.value,t=Ne.value;if(!e||!t)return void(this._draggingNode=null);const i=this._cursorPos,o=this._draggingNode.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingNode=null);const n=At(xt(e.nodes,e.edges),this._draggingNode.node.id,i.x,i.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:n.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await it()})}catch(e){console.error("Error updating node:",e),alert(`Failed to update node: ${e}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=function(e,t,i=.5){const o=new Map;for(const t of e)o.set(t.id,t);const n=[];for(const e of t){const t=o.get(e.start_node),s=o.get(e.end_node);t&&s&&nt(t,s)<=i&&n.push(e.id)}return n}(e.nodes,e.edges);if(0!==i.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",i.length,i.map(e=>e.slice(0,8)+"…").join(", "));try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:t.id,floor_id:e.id,edge_id:o});await it(),await this._syncRoomsWithEdges()}catch(e){console.error("Error removing degenerate edges:",e)}}}_handleKeyDown(e){if("Escape"===e.key){if(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave){const e=this._rotatingMmwave;Je.value=Je.value.map(t=>t.id===e.id?{...t,angle:e.originalAngle}:t),this._rotatingMmwave=null}this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,Oe.value={type:"none",ids:[]},Ge.value=null,Re.value="select"}else"Backspace"!==e.key&&"Delete"!==e.key||!this._zoneEditor?"Backspace"!==e.key&&"Delete"!==e.key||!this._multiEdgeEditor?"Backspace"!==e.key&&"Delete"!==e.key||!this._edgeEditor?"Backspace"!==e.key&&"Delete"!==e.key||"light"!==Oe.value.type&&"switch"!==Oe.value.type&&"mmwave"!==Oe.value.type?"r"===e.key&&"mmwave"===Oe.value.type?(e.preventDefault(),this._rotateMmwave(e.shiftKey?-15:15)):"z"!==e.key||!e.ctrlKey&&!e.metaKey||e.shiftKey?("z"===e.key&&(e.ctrlKey||e.metaKey)&&e.shiftKey||"y"===e.key&&(e.ctrlKey||e.metaKey))&&(e.preventDefault(),Jt()):(e.preventDefault(),Gt()):(e.preventDefault(),this._deleteSelectedPlacement()):(e.preventDefault(),this._handleEdgeDelete()):(e.preventDefault(),this._handleMultiEdgeDelete()):(e.preventDefault(),this._handleZoneDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._edgeEditor.edge,o=parseFloat(this._editingLength);if(isNaN(o)||o<=0)return;const n=Math.abs(o-this._edgeEditor.length)>=.01,s=this._editingDirection!==i.direction,r=this._editingLengthLocked!==i.length_locked,a="door"===i.type||"window"===i.type,l=a&&this._editingOpeningParts!==(i.opening_parts??"single"),d=a&&this._editingOpeningType!==(i.opening_type??"swing"),c=a&&this._editingSwingDirection!==(i.swing_direction??"left"),h=a&&(this._editingEntityId??null)!==(i.entity_id??null),p=s||r||l||d||c||h;try{if(s){if(!await this._applyDirection(i,this._editingDirection))return}if(n&&await this._updateEdgeLength(i,o),p){const o=Fe.value;if(o&&r){const e={};s&&(e.direction=this._editingDirection),r&&(e.length_locked=this._editingLengthLocked);const t=function(e,t,i,o){if(ht){const e=Object.entries(o).map(([e,t])=>`${e}=${t}`).join(", ");console.group(pt+" checkConstraintsFeasible: %cedge %s → {%s}",gt,ut,i.slice(0,8)+"…",e)}const n=xt(e,t),s=wt(n),{magnitudes:r}=Et(n,s),a=t.map(e=>e.id!==i?e:{...e,...void 0!==o.direction&&{direction:o.direction},...void 0!==o.length_locked&&{length_locked:o.length_locked},...void 0!==o.angle_group&&{angle_group:o.angle_group??void 0}}),l=xt(e,a),d=wt(l),c=new Set;for(const[e,t]of l.nodes)t.pinned&&c.add(e);const h=Pt(l,c,d,r);return h.blocked?(ht&&(console.log(pt+" %c→ NOT FEASIBLE%c — blocked by: %s",gt,ft,"",(h.blockedBy||[]).map(e=>{const t=l.edges.get(e);return t?vt(t,l.nodes):e.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(ht&&(console.log(pt+" %c→ Feasible",gt,_t),console.groupEnd()),{feasible:!0})}(o.nodes,o.edges,i.id,e);if(!t.feasible)return void(t.blockedBy&&this._blinkEdges(t.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:t.id,floor_id:e.id,edge_id:i.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await it()}}catch(e){console.error("Error applying edge changes:",e)}this._edgeEditor=null,Oe.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Oe.value={type:"none",ids:[]}}async _setDoorOpensToSide(e,t){if(!this.hass)return;if("a"===e)return;const i=Fe.value,o=Ne.value;if(!i||!o)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:o.id,floor_id:i.id,edge_id:t.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await it();const e=Fe.value;if(e){const i=e.edges.find(e=>e.id===t.id);i&&this._updateEdgeEditorForSelection([i.id])}}catch(e){console.error("Error flipping door side:",e)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this.hass,o=t.id,n=e.id,s=this._edgeEditor.edge,r=Wt(e.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await it(),await this._syncRoomsWithEdges(),Xt({type:"edge_delete",description:"Delete edge",undo:async()=>{const e=await i.callWS({type:"inhabit/edges/add",floor_plan_id:o,floor_id:n,...d});c.id=e.edge.id,await it(),await this._syncRoomsWithEdges()},redo:async()=>{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await it(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error deleting edge:",e)}this._edgeEditor=null,Oe.value={type:"none",ids:[]}}_handleEditorKeyDown(e){"Enter"===e.key?this._handleEditorSave():"Escape"===e.key&&this._handleEditorCancel()}async _withNodeUndo(e,t,i){if(!this.hass)return;const o=Fe.value,n=Ne.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l=new Map;for(const t of e){const e=o.nodes.find(e=>e.id===t.nodeId);e&&l.set(e.id,{x:e.x,y:e.y})}await i(),await this._syncRoomsWithEdges();const d=Fe.value;if(!d)return;const c=new Map;for(const t of e){const e=d.nodes.find(e=>e.id===t.nodeId);e&&c.set(e.id,{x:e.x,y:e.y})}const h=async e=>{const t=Array.from(e.entries()).map(([e,t])=>({node_id:e,x:t.x,y:t.y}));t.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:t}),await it(),await this._syncRoomsWithEdges()};Xt({type:"node_update",description:t,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(e,t){if(!this.hass)return;const i=Fe.value,o=Ne.value;if(!i||!o)return;const n=i.edges.map(t=>t.id===e.id?{...t,length_locked:!1}:t),s=Lt(xt(i.nodes,n),e.id,t);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await it()})}catch(e){console.error("Error updating edge length:",e),alert(`Failed to update edge: ${e}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(e){const t=Fe.value;if(t){const i=this._draggingNode?.node.id,o=Ut(e,i?t.nodes.filter(e=>e.id!==i):t.nodes,15);if(o)return{x:o.x,y:o.y};if(i){const o=new Set(Bt(i,t.edges).map(e=>`${e.start_node}-${e.end_node}`)),n=Ot(t);let s=null,r=15;for(const t of n){const i=`${t.start_node}-${t.end_node}`;if(o.has(i))continue;const n=this._getClosestPointOnSegment(e,t.startPos,t.endPos),a=Math.sqrt((e.x-n.x)**2+(e.y-n.y)**2);a<r&&(r=a,s=n)}if(s)return s}}return{x:Math.round(e.x),y:Math.round(e.y)}}_getSnappedPoint(e,t=!1){const i=Fe.value;if(!i)return Ze.value?st(e,Ue.value):e;const o=Ut(e,i.nodes,15);if(o)return{x:o.x,y:o.y};if(t){const t=Ot(i);let o=null,n=15;for(const i of t){const t=this._getClosestPointOnSegment(e,i.startPos,i.endPos),s=Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2));s<n&&(n=s,o=t)}if(o)return o}return Ze.value?st(e,Ue.value):e}_getClosestPointOnSegment(e,t,i){const o=i.x-t.x,n=i.y-t.y,s=o*o+n*n;if(0===s)return t;const r=Math.max(0,Math.min(1,((e.x-t.x)*o+(e.y-t.y)*n)/s));return{x:t.x+r*o,y:t.y+r*n}}_handleSelectClick(e,t=!1){const i=Fe.value;if(!i)return!1;const o=this._canvasMode;if("walls"===o){const o=Ot(i);for(const i of o){if(this._pointToSegmentDistance(e,i.startPos,i.endPos)<i.thickness/2+5){if(t&&"edge"===Oe.value.type){const e=[...Oe.value.ids],t=e.indexOf(i.id);return t>=0?e.splice(t,1):e.push(i.id),Oe.value={type:"edge",ids:e},this._updateEdgeEditorForSelection(e),!0}return Oe.value={type:"edge",ids:[i.id]},this._updateEdgeEditorForSelection([i.id]),!0}}}if("placement"===o||"viewing"===o){for(const t of Ve.value.filter(e=>e.floor_id===i.id)){if(Math.hypot(e.x-t.position.x,e.y-t.position.y)<15)return Oe.value={type:"light",ids:[t.id]},"placement"===o?Ge.value={id:t.id,type:"light"}:this._openEntityDetails(t.entity_id),!0}for(const t of qe.value.filter(e=>e.floor_id===i.id)){if(Math.hypot(e.x-t.position.x,e.y-t.position.y)<15)return Oe.value={type:"switch",ids:[t.id]},"placement"===o?Ge.value={id:t.id,type:"switch"}:this._openEntityDetails(t.entity_id),!0}for(const t of Je.value.filter(e=>e.floor_id===i.id)){if(Math.hypot(e.x-t.position.x,e.y-t.position.y)<15)return Oe.value={type:"mmwave",ids:[t.id]},"placement"===o?Ge.value={id:t.id,type:"mmwave"}:t.entity_id&&this._openEntityDetails(t.entity_id),!0}}if(("furniture"===o||"occupancy"===o)&&i.zones){const t=[...i.zones];for(const i of t)if(i.polygon?.vertices&&this._pointInPolygon(e,i.polygon.vertices)){if("occupancy"===o){Oe.value={type:"zone",ids:[i.id]};const e=i.ha_area_id?this._haAreas.find(e=>e.area_id===i.ha_area_id)?.name??i.name:i.name;return Xe.value={id:i.id,name:e,type:"zone"},Ye.value=i.id,!0}return Oe.value={type:"zone",ids:[i.id]},!0}}if("walls"===o||"occupancy"===o)for(const t of i.rooms)if(this._pointInPolygon(e,t.polygon.vertices)){Oe.value={type:"room",ids:[t.id]};const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name;return"occupancy"===o?(Xe.value={id:t.id,name:e,type:"room"},Ye.value=t.id):this._roomEditor={room:t,editName:e,editColor:t.color,editAreaId:t.ha_area_id??null},!0}return Oe.value={type:"none",ids:[]},Ge.value=null,!1}_updateEdgeEditorForSelection(e){const t=Fe.value;if(!t)return;if(0===e.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const i=Wt(t.nodes);if(1===e.length){const o=t.edges.find(t=>t.id===e[0]);if(o){const e=i.get(o.start_node),t=i.get(o.end_node);if(e&&t){const i=this._calculateWallLength(e,t);this._edgeEditor={edge:o,position:{x:(e.x+t.x)/2,y:(e.y+t.y)/2},length:i},this._editingLength=Math.round(i).toString(),this._editingLengthLocked=o.length_locked,this._editingDirection=o.direction,this._editingOpeningParts=o.opening_parts??"single",this._editingOpeningType=o.opening_type??"swing",this._editingSwingDirection=o.swing_direction??"left",this._editingEntityId=o.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const o=e.map(e=>t.edges.find(t=>t.id===e)).filter(e=>!!e),n=[];for(const e of o){const t=i.get(e.start_node),o=i.get(e.end_node);t&&n.push({x:t.x,y:t.y}),o&&n.push({x:o.x,y:o.y})}const s=function(e,t=2){if(e.length<2)return!0;if(2===e.length)return!0;let i=0,o=e[0],n=e[1];for(let t=0;t<e.length;t++)for(let s=t+1;s<e.length;s++){const r=nt(e[t],e[s]);r>i&&(i=r,o=e[t],n=e[s])}if(i<1e-9)return!0;const s=n.x-o.x,r=n.y-o.y,a=Math.sqrt(s*s+r*r);for(const i of e)if(Math.abs((i.x-o.x)*r-(i.y-o.y)*s)/a>t)return!1;return!0}(n);let r;if(s){r=0;for(const e of o){const t=i.get(e.start_node),o=i.get(e.end_node);t&&o&&(r+=this._calculateWallLength(t,o))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:o,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(e,t,i){const o=i.x-t.x,n=i.y-t.y,s=o*o+n*n;if(0===s)return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2));const r=Math.max(0,Math.min(1,((e.x-t.x)*o+(e.y-t.y)*n)/s)),a=t.x+r*o,l=t.y+r*n;return Math.sqrt(Math.pow(e.x-a,2)+Math.pow(e.y-l,2))}_handleWallClick(e,t=!1){if(this._wallStartPoint){let i="free";if(t){i=Math.abs(e.x-this._wallStartPoint.x)>=Math.abs(e.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,e,i);const o=Fe.value,n=o?.nodes.some(t=>Math.abs(e.x-t.x)<1&&Math.abs(e.y-t.y)<1);this._wallChainStart&&Math.abs(e.x-this._wallChainStart.x)<1&&Math.abs(e.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Re.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=e}else this._wallStartPoint=e,this._wallChainStart=e}async _completeWall(e,t,i="free"){if(!this.hass)return;const o=Fe.value,n=Ne.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l={id:""};try{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:e,end:t,thickness:6,direction:i});l.id=o.edge.id,await it(),await this._syncRoomsWithEdges(),Xt({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await it(),await this._syncRoomsWithEdges()},redo:async()=>{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:e,end:t,thickness:6,direction:i});l.id=o.edge.id,await it(),await this._syncRoomsWithEdges()}})}catch(e){console.error("Error creating edge:",e)}}_screenToSvg(e){if(!this._svg)return e;const t=this._svg.getScreenCTM();if(t){const i=t.inverse();return{x:i.a*e.x+i.c*e.y+i.e,y:i.b*e.x+i.d*e.y+i.f}}const i=this._svg.getBoundingClientRect(),o=this._viewBox.width/i.width,n=this._viewBox.height/i.height;return{x:this._viewBox.x+(e.x-i.left)*o,y:this._viewBox.y+(e.y-i.top)*n}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(e){const t=Fe.value;if(!t)return;const i=t.rooms.find(t=>t.id===e)??t.zones?.find(t=>t.id===e);if(!i||!i.polygon?.vertices?.length)return;const o=i.polygon.vertices.map(e=>e.x),n=i.polygon.vertices.map(e=>e.y),s=Math.min(...o),r=Math.max(...o),a=Math.min(...n),l=Math.max(...n),d=r-s,c=l-a,h=Xe.value?.3:.15;let p=d+2*(Math.max(d,50)*h),g=c+2*(Math.max(c,50)*h);const u=this._svg?.getBoundingClientRect(),f=u&&u.width>0&&u.height>0?u.width/u.height:1.25;p/g>f?g=p/f:p=g*f;const _=(s+r)/2,y=(a+l)/2;let v=0;if(!!Xe.value&&u&&u.width>0){v=316/u.width*p/2}this._animateViewBox({x:_-p/2+v,y:y-g/2,width:p,height:g},400)}_animateToFloor(){const e=Fe.value;if(!e)return;const t=[],i=[];for(const o of e.nodes)t.push(o.x),i.push(o.y);for(const o of e.rooms)for(const e of o.polygon.vertices)t.push(e.x),i.push(e.y);for(const o of Ve.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));for(const o of qe.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));for(const o of Je.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));if(0===t.length)return;const o=Math.min(...t),n=Math.max(...t),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s;let d=a+2*(.1*Math.max(a,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),p=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>p?c=d/p:d=c*p;const g=(o+n)/2,u=(s+r)/2;this._animateViewBox({x:g-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(e,t){this._cancelViewBoxAnimation();const i={...this._viewBox},o=performance.now(),n=s=>{const r=s-o,a=Math.min(r/t,1),l=1-Math.pow(1-a,3),d={x:i.x+(e.x-i.x)*l,y:i.y+(e.y-i.y)*l,width:i.width+(e.width-i.width)*l,height:i.height+(e.height-i.height)*l};this._viewBox=d,Be.value=d,this._viewBoxAnimation=a<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(e){const t=[],i=[];for(const o of e.nodes)t.push(o.x),i.push(o.y);for(const o of e.rooms)for(const e of o.polygon.vertices)t.push(e.x),i.push(e.y);for(const o of Ve.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));for(const o of qe.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));for(const o of Je.value)o.floor_id===e.id&&(t.push(o.position.x),i.push(o.position.y));if(0===t.length)return;const o=Math.min(...t),n=Math.max(...t),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=a+2*(.1*Math.max(a,50)),p=l+2*(.1*Math.max(l,50));h/p>c?p=h/c:h=p*c;const g={x:(o+n)/2-h/2,y:(s+r)/2-p/2,width:h,height:p};Be.value=g,this._viewBox=g}async _addSimulatedTarget(e){if(!this.hass)return;const t=Ne.value,i=Fe.value;if(t&&i)try{const o=await this.hass.callWS({type:"inhabit/simulate/target/add",floor_plan_id:t.id,floor_id:i.id,position:{x:e.x,y:e.y},hitbox:et.value});Qe.value=[...Qe.value,o]}catch(e){console.error("Failed to add simulated target:",e)}}async _removeSimulatedTarget(e){if(this.hass)try{await this.hass.callWS({type:"inhabit/simulate/target/remove",target_id:e}),Qe.value=Qe.value.filter(t=>t.id!==e)}catch(e){console.error("Failed to remove simulated target:",e)}}_moveSimulatedTargetLocal(e,t){const i=Fe.value,o=Qe.value,n=o.findIndex(t=>t.id===e);if(-1===n)return;const s=et.value&&i?this._getRegionAtPoint(t,i):null,r={...o[n],position:{x:t.x,y:t.y},region_id:s?.id??null,region_name:s?.name??null},a=[...o];a[n]=r,Qe.value=a}_throttledMoveSimTarget(e,t){this._simMoveThrottle||(this._simMoveThrottle=setTimeout(()=>{this._simMoveThrottle=null,this._sendSimTargetMove(e,t)},66))}async _sendSimTargetMove(e,t){if(this.hass)try{const i=await this.hass.callWS({type:"inhabit/simulate/target/move",target_id:e,position:{x:t.x,y:t.y},hitbox:et.value}),o=Qe.value,n=o.findIndex(t=>t.id===e);if(-1!==n){const e=[...o];e[n]=i,Qe.value=e}}catch{}}_getRegionAtPoint(e,t){if(t.zones)for(const i of t.zones)if(i.polygon?.vertices&&this._pointInPolygon(e,i.polygon.vertices))return{id:i.id,name:i.name};for(const i of t.rooms)if(i.polygon?.vertices&&this._pointInPolygon(e,i.polygon.vertices))return{id:i.id,name:i.name};return null}_renderSimulationLayer(e){const t=Qe.value,i=et.value,o=new Set;if(i)for(const e of t)e.region_id&&o.add(e.region_id);const n=this._viewBox,s=Math.max(n.width,n.height)/100,r=1.2*s,a=1.4*s,l=r+.6*a;return j`
      <g class="simulation-layer">
        <!-- Room/zone occupation highlights -->
        ${e.rooms.map(e=>o.has(e.id)?j`
          <path d="${ot(e.polygon)}"
                fill="rgba(76, 175, 80, 0.18)"
                stroke="rgba(76, 175, 80, 0.6)"
                stroke-width="2"
                pointer-events="none"/>
        `:null)}
        ${(e.zones||[]).map(e=>o.has(e.id)?j`
          <path d="${ot(e.polygon)}"
                fill="rgba(76, 175, 80, 0.18)"
                stroke="rgba(76, 175, 80, 0.6)"
                stroke-width="2"
                pointer-events="none"/>
        `:null)}

        <!-- Target dots -->
        ${t.map(e=>{const t=!!e.region_id?"#4caf50":"#9e9e9e";return j`
            <g class="sim-target" style="cursor: grab;">
              <circle cx="${e.position.x}" cy="${e.position.y}" r="${r}"
                      fill="${t}" fill-opacity="0.85"
                      stroke="white" stroke-width="${.2*s}"/>
              <circle cx="${e.position.x}" cy="${e.position.y}" r="${.4*r}"
                      fill="white" fill-opacity="0.9"/>
              ${e.region_name?j`
                <text x="${e.position.x}" y="${e.position.y+l}"
                      text-anchor="middle"
                      fill="var(--primary-text-color, #333)"
                      font-size="${a}"
                      font-weight="500"
                      pointer-events="none">
                  ${e.region_name}
                </text>
              `:null}
            </g>
          `})}
      </g>
    `}_pointInPolygon(e,t){if(t.length<3)return!1;let i=!1;const o=t.length;for(let n=0,s=o-1;n<o;s=n++){const o=t[n],r=t[s];o.y>e.y!=r.y>e.y&&e.x<(r.x-o.x)*(e.y-o.y)/(r.y-o.y)+o.x&&(i=!i)}return i}_getRandomRoomColor(){const e=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return e[Math.floor(Math.random()*e.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=function(e,t){if(0===t.length)return[];const i=new Map;for(const t of e)i.set(t.id,t);const o=new Map,n=(e,t)=>{const n=i.get(e),s=i.get(t);if(!n||!s)return;if(e===t)return;const r=Math.atan2(s.y-n.y,s.x-n.x);o.has(e)||o.set(e,[]),o.get(e).push({targetId:t,angle:r})};for(const e of t)n(e.start_node,e.end_node),n(e.end_node,e.start_node);for(const[,e]of o)e.sort((e,t)=>e.angle-t.angle);const s=new Set,r=[],a=(e,t)=>`${e}->${t}`;for(const[e,t]of o)for(const n of t){const t=a(e,n.targetId);if(s.has(t))continue;const l=[];let d=e,c=n.targetId,h=!0;for(let t=0;t<1e3;t++){const t=a(d,c);if(s.has(t)){h=!1;break}s.add(t),l.push(d);const r=i.get(d),p=i.get(c),g=Math.atan2(r.y-p.y,r.x-p.x),u=o.get(c);if(!u||0===u.length){h=!1;break}let f=null;for(const e of u)if(e.angle>g){f=e;break}if(f||(f=u[0]),d=c,c=f.targetId,d===e&&c===n.targetId)break;if(d===e)break}h&&l.length>=3&&r.push(l.map(e=>{const t=i.get(e);return{x:t.x,y:t.y}}))}const l=[];for(const e of r){const t=Zt(e),i=Math.abs(t);if(i<100)continue;if(t>0)continue;const o=Ht(e);l.push({vertices:e,area:i,centroid:o})}const d=new Map;for(const e of l){const t=e.vertices.map(e=>`${Math.round(e.x)},${Math.round(e.y)}`).sort().join("|");(!d.has(t)||d.get(t).area<e.area)&&d.set(t,e)}return Array.from(d.values())}(e.nodes,e.edges),o=[...e.rooms],n=new Set;let s=this._getNextRoomNumber(o)-1;for(const r of i){let i=null,a=0;for(const e of o){if(n.has(e.id))continue;const t=e.polygon.vertices,o=r.vertices,s=this._getPolygonCenter(t);if(!s)continue;const l=r.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;t.length===o.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>a&&(a=c,i=e)}if(i){n.add(i.id);if(this._verticesChanged(i.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:t.id,room_id:i.id,polygon:{vertices:r.vertices}})}catch(e){console.error("Error updating room polygon:",e)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:t.id,floor_id:e.id,name:`Room ${s}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(e){console.error("Error creating auto-detected room:",e)}}}for(const e of o)if(!n.has(e.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:e.id})}catch(e){console.error("Error deleting orphaned room:",e)}await it()}_verticesChanged(e,t){if(e.length!==t.length)return!0;for(let i=0;i<e.length;i++)if(Math.abs(e[i].x-t[i].x)>1||Math.abs(e[i].y-t[i].y)>1)return!0;return!1}_getNextRoomNumber(e){let t=0;for(const i of e){const e=i.name.match(/^Room (\d+)$/);e&&(t=Math.max(t,parseInt(e[1],10)))}return t+1}_getAssignedHaAreaIds(e){const t=new Set,i=Ne.value;if(!i)return t;for(const o of i.floors){for(const i of o.rooms)i.id!==e?.roomId&&i.ha_area_id&&t.add(i.ha_area_id);for(const i of o.zones)i.id!==e?.zoneId&&i.ha_area_id&&t.add(i.ha_area_id)}return t}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const{room:i,editName:o,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:t.id,room_id:i.id,name:o,color:n,ha_area_id:s}),await it()}catch(e){console.error("Error updating room:",e)}this._roomEditor=null,Oe.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Oe.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const e=Ne.value;if(e){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:this._roomEditor.room.id}),await it()}catch(e){console.error("Error deleting room:",e)}this._roomEditor=null,Oe.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;const e=this._getAssignedHaAreaIds({roomId:this._roomEditor.room.id}),t=this._haAreas.filter(t=>!e.has(t.area_id)||t.area_id===this._roomEditor?.editAreaId);return H`
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
            @change=${e=>{if(this._roomEditor){const t=e.target.value,i=this._haAreas.find(e=>e.area_id===t);this._roomEditor={...this._roomEditor,editAreaId:t||null,editName:i?i.name:this._roomEditor.editName}}}}
          >
            <option value="">None</option>
            ${t.map(e=>H`
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
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(e=>H`
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
    `}_renderEdgeChains(e,t,i=null){const o=Ot(e);let n=o.map(e=>({id:e.id,start_node:e.start_node,end_node:e.end_node,startPos:e.startPos,endPos:e.endPos,thickness:e.thickness,type:e.type,opening_parts:e.opening_parts,opening_type:e.opening_type,swing_direction:e.swing_direction,entity_id:e.entity_id}));if(this._draggingNode){const{positions:t,blocked:i,blockedBy:s}=Tt(e.nodes,e.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);i?s&&this._blinkEdges(s):n=o.map(e=>({id:e.id,start_node:e.start_node,end_node:e.end_node,startPos:t.get(e.start_node)??e.startPos,endPos:t.get(e.end_node)??e.endPos,thickness:e.thickness,type:e.type,opening_parts:e.opening_parts,opening_type:e.opening_type,swing_direction:e.swing_direction,entity_id:e.entity_id}))}const s=function(e){const t=e.filter(e=>"wall"===e.type);if(0===t.length)return[];const i=new Set,o=[];for(const e of t){if(i.has(e.id))continue;const n=[e];i.add(e.id);let s=e.end_node,r=!0;for(;r;){r=!1;for(const e of t)if(!i.has(e.id)){if(e.start_node===s){n.push(e),i.add(e.id),s=e.end_node,r=!0;break}if(e.end_node===s){n.push({...e,start_node:e.end_node,end_node:e.start_node,startPos:e.endPos,endPos:e.startPos}),i.add(e.id),s=e.start_node,r=!0;break}}}let a=e.start_node;for(r=!0;r;){r=!1;for(const e of t)if(!i.has(e.id)){if(e.end_node===a){n.unshift(e),i.add(e.id),a=e.start_node,r=!0;break}if(e.start_node===a){n.unshift({...e,start_node:e.end_node,end_node:e.start_node,startPos:e.endPos,endPos:e.startPos}),i.add(e.id),a=e.end_node,r=!0;break}}}o.push(n)}return o}(n),r="edge"===t.type?n.filter(e=>t.ids.includes(e.id)):[],a=Ke.value.get(e.id),l=a?new Set(a.map(e=>e.edgeId)):new Set,d=n.filter(e=>"door"===e.type||"window"===e.type),c=[];for(const e of s)if(i){let t=[],o=!1;for(const n of e){const e=i.has(n.id);0===t.length?(t.push(n),o=e):e===o?t.push(n):(c.push({edges:t,dimClass:o?"edges-focused":"edges-dimmed"}),t=[n],o=e)}t.length>0&&c.push({edges:t,dimClass:o?"edges-focused":"edges-dimmed"})}else c.push({edges:e,dimClass:""});return j`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(e=>j`
        <path class="wall ${e.dimClass}"
              d="${function(e){if(0===e.length)return"";const t=e[0].thickness/2,i=[e[0].start];for(const t of e)i.push(t.end);const o=i.length>2&&Math.abs(i[0].x-i[i.length-1].x)<1&&Math.abs(i[0].y-i[i.length-1].y)<1,n=[],s=[];for(let e=0;e<i.length;e++){const r=i[e];let a,l=null,d=null;if(e>0||o){const t=i[e>0?e-1:i.length-2],o=r.x-t.x,n=r.y-t.y,s=Math.sqrt(o*o+n*n);s>0&&(l={x:o/s,y:n/s})}if(e<i.length-1||o){const t=i[e<i.length-1?e+1:1],o=t.x-r.x,n=t.y-r.y,s=Math.sqrt(o*o+n*n);s>0&&(d={x:o/s,y:n/s})}if(l&&d){const e={x:-l.y,y:l.x},t={x:-d.y,y:d.x},i=e.x+t.x,o=e.y+t.y,n=Math.sqrt(i*i+o*o);if(n<.01)a=e;else{a={x:i/n,y:o/n};const t=e.x*a.x+e.y*a.y;if(Math.abs(t)>.1){const e=1/t,i=Math.min(Math.abs(e),3)*Math.sign(e);a={x:a.x*i,y:a.y*i}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:r.x+a.x*t,y:r.y+a.y*t}),s.push({x:r.x-a.x*t,y:r.y-a.y*t})}const r=Math.min(.8*t,4);let a=`M${n[0].x},${n[0].y}`;for(let e=1;e<n.length;e++)if(e<n.length-1&&n.length>2){const t=n[e-1],i=n[e],o=n[e+1],s=i.x-t.x,l=i.y-t.y,d=Math.sqrt(s*s+l*l),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=i.x-s/d*g,t=i.y-l/d*g,o=i.x+c/p*u,n=i.y+h/p*u;a+=` L${e},${t} Q${i.x},${i.y} ${o},${n}`}else a+=` L${i.x},${i.y}`}else a+=` L${n[e].x},${n[e].y}`;const l=[...s].reverse();if(o){a+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let e=s.length-2;e>=0;e--){const t=s.length-1-e;if(t>0&&t<s.length-1){const t=s[e+1],i=s[e],o=s[e-1],n=i.x-t.x,l=i.y-t.y,d=Math.sqrt(n*n+l*l),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=i.x-n/d*g,t=i.y-l/d*g,o=i.x+c/p*u,s=i.y+h/p*u;a+=` L${e},${t} Q${i.x},${i.y} ${o},${s}`}else a+=` L${i.x},${i.y}`}else a+=` L${s[e].x},${s[e].y}`}}else for(let e=0;e<l.length;e++)if(e>0&&e<l.length-1&&l.length>2){const t=l[e-1],i=l[e],o=l[e+1],n=i.x-t.x,s=i.y-t.y,d=Math.sqrt(n*n+s*s),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const e=i.x-n/d*g,t=i.y-s/d*g,o=i.x+c/p*u,r=i.y+h/p*u;a+=` L${e},${t} Q${i.x},${i.y} ${o},${r}`}else a+=` L${i.x},${i.y}`}else a+=` L${l[e].x},${l[e].y}`;return a+=" Z",a}(e.edges.map(e=>({start:e.startPos,end:e.endPos,thickness:e.thickness})))}"/>
      `)}

      <!-- Door and window openings -->
      ${d.map(e=>{const t=this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness}),o=!!i&&i.has(e.id),n=i?o?"edges-focused":"edges-dimmed":"";let s=0;if(e.entity_id&&this.hass?.states[e.entity_id]){const t=this.hass.states[e.entity_id],i=t.state;if("on"===i||"open"===i){const i="door"===e.type?ei:Math.PI/2,o=t.attributes.current_position;s=void 0!==o&&o>=0&&o<=100?o/100*i:i}}const r=this._swingAngles.get(e.id)??0;let a=r;const l=s-r;Math.abs(l)>.001?(a=r+.15*l,this._swingAngles.set(e.id,a),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):a!==s&&(a=s,this._swingAngles.set(e.id,s));const d=e.endPos.x-e.startPos.x,c=e.endPos.y-e.startPos.y,h=Math.sqrt(d*d+c*c);if(0===h)return null;const p=d/h,g=c/h,u=-g,f=p,_=e.opening_parts??"single",y=e.opening_type??"swing",v="window"===e.type?"window":"door";if("swing"===y){const t=.5*e.thickness,i=.7*e.thickness,o=1.5,s=(e,o)=>{const n=e.x,s=e.y,r=n+p*o*t,a=s+g*o*t;return`M${n-u*i},${s-f*i}\n                    L${n+u*i},${s+f*i}\n                    L${r+u*i},${a+f*i}\n                    L${r-u*i},${a-f*i} Z`},r=t+o,l={x:e.startPos.x+p*r,y:e.startPos.y+g*r},d={x:e.endPos.x-p*r,y:e.endPos.y-g*r},c=e.swing_direction??"left",y="right"===c?e.endPos:e.startPos,m="right"===c?-1:1,x=y.x+p*m*t+u*(e.thickness/2),b=y.y+g*m*t+f*(e.thickness/2);if("door"===v){const t=e.thickness/2,i=y.x+u*t,o=y.y+f*t,r="right"===c?e.startPos:e.endPos,p=r.x+u*t,g=r.y+f*t,_=ti(i,o,p,g,85,"left"===c),v=`M${i},${o} L${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy} Z`,m=Math.cos(a),w=Math.sin(a),$="left"===c?1:-1,k=e=>{const t=e.x-x,i=e.y-b;return{x:x+m*t-$*w*i,y:b+$*w*t+m*i}},E=k(l),P=k(d),S=this._singleEdgePath({start:E,end:P,thickness:e.thickness});return j`
              <g class="${n}">
                ${this._fadedWedge(e.id,v,i,o,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy}"/>
                <path class="opening-stop" d="${s(e.startPos,1)}"/>
                <path class="opening-stop" d="${s(e.endPos,-1)}"/>
                <path class="door-closed-segment" d="${S}"/>
                <circle class="metal-hinge" cx="${x}" cy="${b}" r="2.5"/>
              </g>
            `}const w=e.thickness/2,$=y.x+u*w,k=y.y+f*w,E="right"===c?e.startPos:e.endPos,P=E.x+u*w,S=E.y+f*w,M=$+u*h,I=k+f*h,C=.5522847498,z=P+C*(M-$),A=S+C*(I-k),L=M+C*(P-$),D=I+C*(S-k),T=`M${P},${S} C${z},${A} ${L},${D} ${M},${I}`,N=`M${$},${k} L${P},${S} C${z},${A} ${L},${D} ${M},${I} Z`;if("double"===_){const i=(l.x+d.x)/2,r=(l.y+d.y)/2,c=.5*o,_=(e.startPos.x+e.endPos.x)/2,y=(e.startPos.y+e.endPos.y)/2,v=h/2,m=e.startPos.x+u*w,x=e.startPos.y+f*w,b=e.endPos.x+u*w,$=e.endPos.y+f*w,k=_+u*w,E=y+f*w,P=m+u*v,S=x+f*v,M=b+u*v,I=$+f*v,z=k+C*(P-m),A=E+C*(S-x),L=P+C*(k-m),D=S+C*(E-x),T=k+C*(M-b),N=E+C*(I-$),F=M+C*(k-b),W=I+C*(E-$),R=`M${m},${x} L${k},${E} C${z},${A} ${L},${D} ${P},${S} Z`,O=`M${b},${$} L${k},${E} C${T},${N} ${F},${W} ${M},${I} Z`,B=Math.cos(a),U=Math.sin(a),Z=(e,t,i,o)=>{const n=e.x-t,s=e.y-i;return{x:t+B*n-o*U*s,y:i+o*U*n+B*s}},H=e.startPos.x+p*t+u*(e.thickness/2),V=e.startPos.y+g*t+f*(e.thickness/2),q=e.endPos.x-p*t+u*(e.thickness/2),K=e.endPos.y-g*t+f*(e.thickness/2),Y={x:i-p*c,y:r-g*c},X={x:i+p*c,y:r+g*c},G=this._singleEdgePath({start:Z(l,H,V,1),end:Z(Y,H,V,1),thickness:e.thickness}),J=this._singleEdgePath({start:Z(X,q,K,-1),end:Z(d,q,K,-1),thickness:e.thickness});return j`
              <g class="${n}">
                ${this._fadedWedge(`${e.id}-l`,R,m,x,v,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${e.id}-r`,O,b,$,v,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${k},${E} C${z},${A} ${L},${D} ${P},${S}"/>
                <path class="door-swing"
                      d="M${k},${E} C${T},${N} ${F},${W} ${M},${I}"/>
                <path class="opening-stop" d="${s(e.startPos,1)}"/>
                <path class="opening-stop" d="${s(e.endPos,-1)}"/>
                <path class="window-closed-segment" d="${G}"/>
                <path class="window-closed-segment" d="${J}"/>
              </g>
            `}const F=Math.cos(a),W=Math.sin(a),R="left"===c?1:-1,O=e=>{const t=e.x-x,i=e.y-b;return{x:x+F*t-R*W*i,y:b+R*W*t+F*i}},B=this._singleEdgePath({start:O(l),end:O(d),thickness:e.thickness});return j`
            <g class="${n}">
              ${this._fadedWedge(e.id,N,$,k,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${T}"/>
              <path class="opening-stop" d="${s(e.startPos,1)}"/>
              <path class="opening-stop" d="${s(e.endPos,-1)}"/>
              <path class="window-closed-segment" d="${B}"/>
            </g>
          `}if("sliding"===y){const i=.3*e.thickness,o=3,s=e.endPos.x+u*i,r=e.endPos.y+f*i,a=e.startPos.x-u*i,l=e.startPos.y-f*i;return j`
            <g class="${n}">
              <path class="${v}" d="${t}"/>
              <line class="door-swing"
                    x1="${e.startPos.x+u*i}" y1="${e.startPos.y+f*i}"
                    x2="${s}" y2="${r}"/>
              <polygon class="sliding-arrow"
                       points="${s},${r} ${s-p*o+u*o*.5},${r-g*o+f*o*.5} ${s-p*o-u*o*.5},${r-g*o-f*o*.5}"/>
              <line class="door-swing"
                    x1="${e.endPos.x-u*i}" y1="${e.endPos.y-f*i}"
                    x2="${a}" y2="${l}"/>
              <polygon class="sliding-arrow"
                       points="${a},${l} ${a+p*o+u*o*.5},${l+g*o+f*o*.5} ${a+p*o-u*o*.5},${l+g*o-f*o*.5}"/>
              ${"window"===v?j`
                <line class="window-pane"
                      x1="${e.startPos.x}" y1="${e.startPos.y}"
                      x2="${e.endPos.x}" y2="${e.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${e.startPos.x-u*e.thickness/2}" y1="${e.startPos.y-f*e.thickness/2}" x2="${e.startPos.x+u*e.thickness/2}" y2="${e.startPos.y+f*e.thickness/2}"/>
              <line class="door-jamb" x1="${e.endPos.x-u*e.thickness/2}" y1="${e.endPos.y-f*e.thickness/2}" x2="${e.endPos.x+u*e.thickness/2}" y2="${e.endPos.y+f*e.thickness/2}"/>
            </g>
          `}if("tilt"===y){const i=(e.startPos.x+e.endPos.x)/2,o=(e.startPos.y+e.endPos.y)/2,s=.25*h;return j`
            <g class="${n}">
              <path class="${v}" d="${t}"/>
              <line class="window-pane"
                    x1="${e.startPos.x}" y1="${e.startPos.y}"
                    x2="${e.endPos.x}" y2="${e.endPos.y}"/>
              <line class="door-swing"
                    x1="${e.startPos.x}" y1="${e.startPos.y}"
                    x2="${i+u*s}" y2="${o+f*s}"/>
              <line class="door-swing"
                    x1="${e.endPos.x}" y1="${e.endPos.y}"
                    x2="${i+u*s}" y2="${o+f*s}"/>
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
    `}_fadedWedge(e,t,i,o,n,s){return j`
      <defs>
        <radialGradient id="wg-${e}" cx="${i}" cy="${o}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path d="${t}" fill="url(#wg-${e})" stroke="none"/>
    `}_singleEdgePath(e){const{start:t,end:i,thickness:o}=e,n=i.x-t.x,s=i.y-t.y,r=Math.sqrt(n*n+s*s);if(0===r)return"";const a=-s/r*(o/2),l=n/r*(o/2);return`M${t.x+a},${t.y+l}\n            L${i.x+a},${i.y+l}\n            L${i.x-a},${i.y-l}\n            L${t.x-a},${t.y-l}\n            Z`}_blinkEdges(e){this._blinkTimer&&clearTimeout(this._blinkTimer);const t=Array.isArray(e)?e:[e];this._blinkingEdgeIds=t;const i=Fe.value;if(i){const e=t.map(e=>{const t=i.edges.find(t=>t.id===e);if(!t)return e.slice(0,8)+"…";const o=i.nodes.find(e=>e.id===t.start_node),n=i.nodes.find(e=>e.id===t.end_node),s=o&&n?Math.sqrt((n.x-o.x)**2+(n.y-o.y)**2).toFixed(1):"?",r=[];return"free"!==t.direction&&r.push(t.direction),t.length_locked&&r.push("len-locked"),t.angle_group&&r.push(`ang:${t.angle_group.slice(0,4)}`),`${e.slice(0,8)}… (${s}cm${r.length?" "+r.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${t.length} blocked edge(s):\n  ${e.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(e,t){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))}_formatLength(e){return e>=100?`${(e/100).toFixed(2)}m`:`${Math.round(e)}cm`}_getRoomEdgeIds(e,t){const i=t.rooms.find(t=>t.id===e);if(!i)return new Set;const o=i.polygon.vertices;if(o.length<2)return new Set;const n=[];for(const e of o){const i=Ut(e,t.nodes,5);i&&n.push(i.id)}if(n.length<2)return new Set;const s=new Map;for(const e of t.edges)s.set(`${e.start_node}|${e.end_node}`,e.id),s.set(`${e.end_node}|${e.start_node}`,e.id);const r=new Set;for(let e=0;e<n.length;e++){const t=n[e],i=n[(e+1)%n.length],o=s.get(`${t}|${i}`);o&&r.add(o)}return r}_renderFloor(){const e=Fe.value;if(!e)return null;const t=Oe.value,i=je.value,o=this._focusedRoomId,n=o?this._getRoomEdgeIds(o,e):null,s=i.find(e=>"background"===e.id),r=i.find(e=>"structure"===e.id),a=i.find(e=>"furniture"===e.id),l=i.find(e=>"labels"===e.id),d="furniture"===this._canvasMode&&("zone"===Re.value||!!this._zoneEditor),c=a?.visible?j`
      <g class="furniture-layer-container" opacity="${a.opacity??1}">
        ${this._renderFurnitureLayer()}
      </g>
    `:null,h=r?.visible?j`
      <g class="structure-layer" opacity="${r.opacity??1}">
        <!-- Edges (rendered as chains for proper corners) -->
        ${this._renderEdgeChains(e,t,n)}
      </g>
    `:null;return j`
      <!-- Background layer -->
      ${s?.visible&&e.background_image?j`
        <image href="${e.background_image}"
               x="0" y="0"
               width="${1e3*e.background_scale}"
               height="${800*e.background_scale}"
               opacity="${s.opacity??1}"
               class="${o?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer (rooms) -->
      ${r?.visible?j`
        <g class="structure-layer" opacity="${r.opacity??1}">
          <!-- Rooms -->
          ${e.rooms.map(e=>j`
            <path class="room ${"room"===t.type&&t.ids.includes(e.id)?"selected":""} ${o?e.id===o?"room-focused":"room-dimmed":""}"
                  d="${ot(e.polygon)}"
                  fill="${e.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}
        </g>
      `:null}

      ${d?h:c}
      ${d?c:h}

      <!-- Labels layer -->
      ${l?.visible?j`
        <g class="labels-layer" opacity="${l.opacity??1}">
          ${e.rooms.map(e=>{const t=this._getPolygonCenter(e.polygon.vertices);if(!t)return null;const i=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name,n=!!e.ha_area_id;return j`
              <g class="room-label-group ${o?e.id===o?"label-focused":"label-dimmed":""}" transform="translate(${t.x}, ${t.y})">
                <text class="room-label" x="0" y="0">
                  ${i}
                </text>
                ${n?j`
                  <g class="room-link-icon" transform="translate(${3.8*i.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}
    `}_renderDeviceLayer(e){const t=je.value,i=this._focusedRoomId;return t.find(e=>"devices"===e.id)?.visible?j`
      <g class="devices-layer" opacity="${t.find(e=>"devices"===e.id)?.opacity??1}">
        ${Ve.value.filter(t=>t.floor_id===e.id).map(e=>j`
            <g class="${i?e.room_id===i?"device-focused":"device-dimmed":""}">
              ${this._renderLight(e)}
            </g>
          `)}
        ${qe.value.filter(t=>t.floor_id===e.id).map(e=>j`
            <g class="${i?e.room_id===i?"device-focused":"device-dimmed":""}">
              ${this._renderSwitch(e)}
            </g>
          `)}
        ${this._renderMmwaveLayer(e)}
      </g>
    `:null}_renderDeviceIcon(e,t,i,o,n,s,r,a,l){const d=Oe.value,c=this._getIconData("mdi:devices"),h=l??c,p=h?.viewBox??"0 0 24 24";return j`
      <g class="device-marker ${i?"on":"off"} ${d.type===o&&d.ids.includes(n)?"selected":""}"
         transform="translate(${e}, ${t})">
        <circle r="${14}" fill="${i?r:"#e0e0e0"}" stroke="#333" stroke-width="2"/>
        ${h?.path?j`
          <svg x="${-9}" y="${-9}" width="${18}" height="${18}" viewBox="${p}">
            <path d="${h.path}" fill="${a}"></path>
            ${h.secondaryPath?j`<path d="${h.secondaryPath}" fill="${a}"></path>`:null}
          </svg>
        `:null}
        <text y="${26}" text-anchor="middle" font-size="10" fill="#333">${s}</text>
      </g>
    `}_renderLight(e){const t=this.hass?.states[e.entity_id],i="on"===t?.state,o=e.label||t?.attributes.friendly_name||e.entity_id,n=this._getEntityIconData(t,"mdi:lightbulb");return this._renderDeviceIcon(e.position.x,e.position.y,i,"light",e.id,o,"#ffd600",i?"#333":"#616161",n)}_renderSwitch(e){const t=this.hass?.states[e.entity_id],i="on"===t?.state,o=e.label||t?.attributes.friendly_name||e.entity_id,n=this._getEntityIconData(t,"mdi:toggle-switch");return this._renderDeviceIcon(e.position.x,e.position.y,i,"switch",e.id,o,"#4caf50",i?"#fff":"#616161",n)}_renderMmwaveLayer(e){const t=Je.value.filter(t=>t.floor_id===e.id);if(0===t.length)return null;const i=Oe.value,o="viewing"!==this._canvasMode;return j`
      <g class="mmwave-layer">
        ${t.map(e=>{const t="mmwave"===i.type&&i.ids.includes(e.id),n=e.field_of_view/2,s=e.detection_range,r=e.position.x,a=e.position.y,l=(e.angle-n)*Math.PI/180,d=(e.angle+n)*Math.PI/180,c=r+s*Math.cos(l),h=a+s*Math.sin(l),p=r+s*Math.cos(d),g=a+s*Math.sin(d),u=e.field_of_view>180?1:0,f=e.angle*Math.PI/180,_=r+30*Math.cos(f),y=a+30*Math.sin(f);return j`
            <g class="mmwave-placement ${t?"selected":""}">
              ${o?j`
                <!-- FOV cone -->
                <path
                  d="M ${r} ${a} L ${c} ${h} A ${s} ${s} 0 ${u} 1 ${p} ${g} Z"
                  fill="rgba(33, 150, 243, 0.1)"
                  stroke="rgba(33, 150, 243, 0.4)"
                  stroke-width="1"
                  stroke-dasharray="4 2"
                />
              `:null}
              <!-- Sensor icon -->
              <circle cx="${r}" cy="${a}" r="8"
                fill="#2196f3" stroke="#fff" stroke-width="2"/>
              <text x="${r}" y="${a+3}" text-anchor="middle"
                font-size="8" fill="#fff" font-weight="bold">R</text>
              ${o&&t?j`
                <!-- Rotation handle -->
                <g class="rotation-handle"
                   data-mmwave-id="${e.id}"
                   @pointerdown=${t=>this._startMmwaveRotation(t,e)}>
                  <line class="rotation-handle-line"
                    x1="${r}" y1="${a}" x2="${_}" y2="${y}" />
                  <circle class="rotation-handle-dot"
                    cx="${_}" cy="${y}" r="4.5" />
                </g>
              `:null}
            </g>
          `})}
      </g>
    `}_renderNodeGuideDots(){const e=Fe.value;if(!e||0===e.nodes.length)return null;const t=new Set;for(const i of e.edges)t.add(i.start_node),t.add(i.end_node);const i=e.nodes.filter(e=>t.has(e.id));return 0===i.length?null:j`
      <g class="node-guide-dots">
        ${i.map(e=>j`
          <circle cx="${e.x}" cy="${e.y}" r="4"
            fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        `)}
      </g>
    `}_renderNodeEndpoints(){const e=Fe.value;if(!e||0===e.nodes.length)return null;const t=new Set;for(const i of e.edges)t.add(i.start_node),t.add(i.end_node);const i=[];for(const o of e.nodes)o.pinned&&t.has(o.id)&&i.push({node:o,coords:{x:o.x,y:o.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&t.has(this._draggingNode.node.id)){const t=i.findIndex(e=>e.node.id===this._draggingNode.node.id);t>=0&&i.splice(t,1);const{positions:o,blocked:n}=Tt(e.nodes,e.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:o.get(this._draggingNode.node.id)??this._cursorPos;i.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&t.has(this._hoveredNode.id)&&(i.some(e=>e.node.id===this._hoveredNode.id)||i.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===i.length)return null;return j`
      <g class="wall-endpoints-layer">
        ${i.map(e=>e.isPinned?j`
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
    `}_renderDraggedEdgeLengths(e){if(!this._draggingNode)return null;const t=this._cursorPos,{positions:i,blocked:o}=Tt(e.nodes,e.edges,this._draggingNode.node.id,t.x,t.y);if(o)return null;const n=Ot(e),s=[];for(const e of n){const t=i.get(e.start_node),o=i.get(e.end_node);if(!t&&!o)continue;const n=t??e.startPos,r=o??e.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:e.startPos,origEnd:e.endPos,length:a,angle:l,thickness:e.thickness})}const r=[];for(let e=0;e<s.length;e++)for(let i=e+1;i<s.length;i++){const o=Math.abs(s[e].angle-s[i].angle)%Math.PI;Math.abs(o-Math.PI/2)<.02&&r.push({point:t,angle:Math.min(s[e].angle,s[i].angle)})}return j`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:e,origEnd:t,thickness:i})=>{const o=t.x-e.x,n=t.y-e.y,s=Math.sqrt(o*o+n*n);if(0===s)return null;const r=-n/s*(i/2),a=o/s*(i/2);return j`
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
      ${s.map(({start:e,end:t,length:i})=>{const o=(e.x+t.x)/2,n=(e.y+t.y)/2,s=Math.atan2(t.y-e.y,t.x-e.x)*(180/Math.PI);return j`
          <g transform="translate(${o}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
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
    `}_handleNodePointerDown(e,t){if(2===e.button)return;e.stopPropagation(),e.preventDefault();const i=this._hoveredNode||t;if("wall"===Re.value){const t={x:i.x,y:i.y};return void this._handleWallClick(t,e.shiftKey)}if(i.pinned)return this._wallStartPoint={x:i.x,y:i.y},Re.value="wall",void(this._hoveredNode=null);this._draggingNode={node:i,originalCoords:{x:i.x,y:i.y},startX:e.clientX,startY:e.clientY,hasMoved:!1},this._svg?.setPointerCapture(e.pointerId)}_handleZonePolyClick(e){const t=this._zonePolyPoints;if(t.length>=3){const i=t[0];if(Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2)<15)return this._pendingZonePolygon=[...t],this._zonePolyPoints=[],void this._saveZone("Zone")}this._zonePolyPoints=[...t,e]}async _saveZone(e){if(!this.hass||!this._pendingZonePolygon)return;const t=Fe.value,i=Ne.value;if(t&&i){try{await this.hass.callWS({type:"inhabit/zones/add",floor_plan_id:i.id,floor_id:t.id,name:e,polygon:{vertices:this._pendingZonePolygon.map(e=>({x:e.x,y:e.y}))},color:"#a1c4fd"}),await it()}catch(e){console.error("Error saving zone:",e)}this._pendingZonePolygon=null}}_renderFurnitureLayer(){const e=Fe.value;if(!e||!e.zones||0===e.zones.length)return null;const t=Oe.value,i=this._focusedRoomId,o=e.zones;return j`
      <g class="furniture-layer">
        ${o.map(e=>{if(!e.polygon?.vertices?.length)return null;const o=ot(e.polygon),n="zone"===t.type&&t.ids.includes(e.id),s=this._getPolygonCenter(e.polygon.vertices),r=i?e.room_id===i?"":"room-dimmed":"";return j`
            <g class="${r}">
              <path class="zone-shape ${n?"selected":""}"
                    d="${o}"
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
      ${t.map((t,i)=>j`
        <circle
          class="zone-vertex-handle"
          cx="${t.x}" cy="${t.y}" r="6"
          fill="white" stroke="${e.color||"#2196f3"}" stroke-width="1.5"
          style="cursor: grab"
          @pointerdown=${o=>{o.stopPropagation(),o.preventDefault(),this._draggingZoneVertex={zone:e,vertexIndex:i,originalCoords:{x:t.x,y:t.y},pointerId:o.pointerId},this._svg?.setPointerCapture(o.pointerId)}}
        />
      `)}
    `:null}_renderFurnitureDrawingPreview(){if("zone"===Re.value&&this._zonePolyPoints.length>0){const e=this._zonePolyPoints,t=this._cursorPos;let i=`M ${e[0].x} ${e[0].y}`;for(let t=1;t<e.length;t++)i+=` L ${e[t].x} ${e[t].y}`;i+=` L ${t.x} ${t.y}`;let o=null;if(e.length>=3){const i=e[0];Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2)<15&&(o=j`<circle cx="${i.x}" cy="${i.y}" r="8" fill="rgba(76, 175, 80, 0.3)" stroke="#4caf50" stroke-width="2"/>`)}return j`
        <g class="furniture-preview">
          <path class="furniture-poly-preview" d="${i}"/>
          ${e.map(e=>j`
            <circle cx="${e.x}" cy="${e.y}" r="4" fill="var(--primary-color, #2196f3)" stroke="white" stroke-width="1.5"/>
          `)}
          ${o}
        </g>
      `}return null}_renderZoneEditor(){if(!this._zoneEditor)return null;const e=this._getAssignedHaAreaIds({zoneId:this._zoneEditor.zone.id}),t=this._haAreas.filter(t=>!e.has(t.area_id)||t.area_id===this._zoneEditor?.editAreaId);return H`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Zone</span>
          <button class="wall-editor-close" @click=${()=>{this._zoneEditor=null,Oe.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Area</span>
          <select class="wall-editor-select"
            .value=${this._zoneEditor.editAreaId??""}
            @change=${e=>{if(!this._zoneEditor)return;const t=e.target.value,i=this._haAreas.find(e=>e.area_id===t);this._zoneEditor={...this._zoneEditor,editAreaId:t||null,editName:i?i.name:this._zoneEditor.editName}}}
          >
            <option value="">None</option>
            ${t.map(e=>H`
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
            @keydown=${e=>{"Enter"===e.key?this._handleZoneEditorSave():"Escape"===e.key&&(this._zoneEditor=null,Oe.value={type:"none",ids:[]})}}
          />
        </div>

        ${this._zoneEditor.zone.polygon?.vertices?.length?H`
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
            ${["#a1c4fd","#c5e1a5","#ffe0b2","#d1c4e9","#ffccbc","#b0bec5","#e0e0e0","#f8bbd0"].map(e=>H`
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
    `}_getZoneBBoxWidth(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const e=this._zoneEditor.zone.polygon.vertices.map(e=>e.x);return Math.round(Math.max(...e)-Math.min(...e))}_getZoneBBoxHeight(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const e=this._zoneEditor.zone.polygon.vertices.map(e=>e.y);return Math.round(Math.max(...e)-Math.min(...e))}_handleZoneSizeChange(e,t){if(!this._zoneEditor||!this.hass||t<=0)return;const i=this._zoneEditor.zone,o=i.polygon?.vertices;if(!o?.length)return;const n=o.map(e=>e.x),s=o.map(e=>e.y),r=Math.min(...n),a=Math.max(...n),l=Math.min(...s),d=Math.max(...s),c=(r+a)/2,h=(l+d)/2,p=a-r,g=d-l;if(0===p||0===g)return;const u="width"===e?t/p:1,f="height"===e?t/g:1,_=o.map(e=>({x:c+(e.x-c)*u,y:h+(e.y-h)*f}));for(let e=0;e<o.length;e++)o[e]=_[e];this.requestUpdate();const y=Ne.value;y&&this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:y.id,zone_id:i.id,polygon:{vertices:_.map(e=>({x:e.x,y:e.y}))}}).then(()=>it()).catch(e=>console.error("Error resizing zone:",e))}async _handleZoneEditorSave(){if(!this._zoneEditor||!this.hass)return;const e=Ne.value;if(e){try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:this._zoneEditor.zone.id,name:this._zoneEditor.editName,color:this._zoneEditor.editColor,ha_area_id:this._zoneEditor.editAreaId??""}),await it()}catch(e){console.error("Error updating zone:",e)}this._zoneEditor=null,Oe.value={type:"none",ids:[]}}}async _handleZoneDelete(){if(!this._zoneEditor||!this.hass)return;const e=Ne.value;if(e){try{await this.hass.callWS({type:"inhabit/zones/delete",floor_plan_id:e.id,zone_id:this._zoneEditor.zone.id}),await it()}catch(e){console.error("Error deleting zone:",e)}this._zoneEditor=null,Oe.value={type:"none",ids:[]}}}async _finishZoneDrag(){if(!this._draggingZone||!this.hass)return;const e=Ne.value;if(!e)return;const t=this._draggingZone.zone;if(t.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:t.id,polygon:{vertices:t.polygon.vertices.map(e=>({x:e.x,y:e.y}))}}),await it()}catch(e){if(console.error("Error moving zone:",e),t.polygon?.vertices&&this._draggingZone.originalVertices)for(let e=0;e<t.polygon.vertices.length;e++)t.polygon.vertices[e]=this._draggingZone.originalVertices[e]}}async _finishZoneVertexDrag(){if(!this._draggingZoneVertex||!this.hass)return;const e=Ne.value;if(!e)return;const t=this._draggingZoneVertex.zone;if(t.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:e.id,zone_id:t.id,polygon:{vertices:t.polygon.vertices.map(e=>({x:e.x,y:e.y}))}}),await it()}catch(e){console.error("Error moving zone vertex:",e),t.polygon?.vertices&&this._draggingZoneVertex&&(t.polygon.vertices[this._draggingZoneVertex.vertexIndex]=this._draggingZoneVertex.originalCoords)}}_renderDrawingPreview(){if("wall"===Re.value&&this._wallStartPoint){const e=this._wallStartPoint,t=this._cursorPos,i=this._calculateWallLength(e,t),o=(e.x+t.x)/2,n=(e.y+t.y)/2,s=Math.atan2(t.y-e.y,t.x-e.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return j`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${e.x}" y1="${e.y}"
                x2="${t.x}" y2="${t.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${e.x}" cy="${e.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${o}, ${n}) rotate(${r})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${t.x}" cy="${t.y}" r="4" opacity="0.5"/>
        </g>
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const e=Re.value;if("door"!==e&&"window"!==e)return null;const{position:t,startPos:i,endPos:o,thickness:n}=this._openingPreview,s="door"===e?80:100,r=o.x-i.x,a=o.y-i.y,l=Math.sqrt(r*r+a*a);if(0===l)return null;const d=r/l,c=a/l,h=-c,p=d,g=s/2,u=n/2,f=t.x,_=t.y,y=`M${f-d*g+h*u},${_-c*g+p*u}\n                      L${f+d*g+h*u},${_+c*g+p*u}\n                      L${f+d*g-h*u},${_+c*g-p*u}\n                      L${f-d*g-h*u},${_-c*g-p*u}\n                      Z`;if("window"===e)return j`
        <g class="opening-ghost">
          <path class="window" d="${y}"/>
          <line class="window-pane"
                x1="${f}" y1="${_}"
                x2="${f+h*n}" y2="${_+p*n}"/>
        </g>
      `;const v=f-d*g,m=_-c*g,x=f+d*g,b=_+c*g,w=ti(v,m,x,b,85,!0),$=w.ox-v,k=w.oy-m,E=Math.sqrt($*$+k*k),P=E>0?-k/E*1.25:0,S=E>0?$/E*1.25:0,M=`M${v+P},${m+S} L${w.ox+P},${w.oy+S} L${w.ox-P},${w.oy-S} L${v-P},${m-S} Z`,I=`M${v},${m} L${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy} Z`,C=f-d*g,z=_-c*g,A=f+d*g,L=_+c*g;return j`
      <g class="opening-ghost">
        <path class="door" d="${y}"/>
        <path class="swing-wedge" d="${I}"/>
        <path class="door-leaf-panel" d="${M}"/>
        <path class="door-swing"
              d="M${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy}"/>
        <line class="door-jamb" x1="${C-h*u}" y1="${z-p*u}" x2="${C+h*u}" y2="${z+p*u}"/>
        <line class="door-jamb" x1="${A-h*u}" y1="${L-p*u}" x2="${A+h*u}" y2="${L+p*u}"/>
        <circle class="hinge-glow" cx="${v}" cy="${m}" r="5"/>
        <circle class="hinge-dot" cx="${v}" cy="${m}" r="3"/>
      </g>
    `}_getPolygonCenter(e){if(0===e.length)return null;if(e.length<3){let t=0,i=0;for(const o of e)t+=o.x,i+=o.y;return{x:t/e.length,y:i/e.length}}let t=0,i=0,o=0;const n=e.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=e[s].x*e[r].y-e[r].x*e[s].y;t+=a,i+=(e[s].x+e[r].x)*a,o+=(e[s].y+e[r].y)*a}if(t/=2,Math.abs(t)<1e-6){let t=0,i=0;for(const o of e)t+=o.x,i+=o.y;return{x:t/n,y:i/n}}const s=1/(6*t);return{x:i*s,y:o*s}}_svgToScreen(e){if(!this._svg)return e;const t=this._svg.getScreenCTM();if(t){const i=t.a*e.x+t.c*e.y+t.e,o=t.b*e.x+t.d*e.y+t.f,n=this._svg.getBoundingClientRect();return{x:i-n.left,y:o-n.top}}const i=this._svg.getBoundingClientRect(),o=i.width/this._viewBox.width,n=i.height/this._viewBox.height;return{x:(e.x-this._viewBox.x)*o,y:(e.y-this._viewBox.y)*n}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const e=this._edgeEditor.edge,t="door"===e.type,i="window"===e.type,o=t||i;return H`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t?"Door Properties":i?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e.link_group?(()=>{const t=Fe.value,i=e.link_group,o=t?t.edges.filter(e=>e.link_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${oi(i)};">
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

        ${e.collinear_group?(()=>{const t=Fe.value,i=e.collinear_group,o=t?t.edges.filter(e=>e.collinear_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${oi(i)};">
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

        ${o?(()=>{const t=Fe.value;if(!t)return null;const i=Wt(t.nodes),o=i.get(e.start_node),n=i.get(e.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=n.x-o.x,l=n.y-o.y,d=Math.sqrt(a*a+l*l);if(0===d)return null;const c=-l/d,h=a/d,p=e.thickness/2+5,g={x:s+c*p,y:r+h*p},u={x:s-c*p,y:r-h*p},f=t.rooms.find(e=>e.polygon.vertices.length>=3&&this._pointInPolygon(g,e.polygon.vertices)),_=t.rooms.find(e=>e.polygon.vertices.length>=3&&this._pointInPolygon(u,e.polygon.vertices)),y=f?.name||(e.is_exterior?"Outside":null),v=_?.name||(e.is_exterior?"Outside":null);return y||v?H`
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

        ${o?(()=>{const e=t?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],i="swing"===this._editingOpeningType,o="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return H`
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
                ${e.map(e=>H`
                  <button
                    class="constraint-btn ${this._editingOpeningType===e.value?"active":""}"
                    @click=${()=>{this._editingOpeningType=e.value}}
                  >${e.label}</button>
                `)}
              </div>
            </div>

            ${i?H`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===o.length?H`
                    <button class="constraint-btn active">${o[0].label}</button>
                  `:o.map(e=>H`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===e.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=e.value}}
                    >${e.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${o?H`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const e=this.hass?.states[this._editingEntityId],t=e?.attributes.friendly_name||this._editingEntityId,i=e?.attributes.icon||"mdi:radiobox-marked";return H`
                <div class="wall-editor-row" style="gap:6px; align-items:center;">
                  <ha-icon icon=${i} style="--mdc-icon-size:18px; color:${"on"===e?.state?"var(--state-light-active-color, #ffd600)":"var(--secondary-text-color, #999)"};"></ha-icon>
                  <span style="flex:1; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t}</span>
                  <span style="font-size:11px; color:var(--secondary-text-color, #999); font-weight:500;">${e?.state??"?"}</span>
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
                  @input=${e=>{this._openingSensorSearch=e.target.value}}
                  @keydown=${e=>{"Escape"===e.key&&(this._openingSensorPickerOpen=!1)}}
                  style="width:100%; padding:6px 8px; border:1px solid var(--divider-color, #e0e0e0); border-radius:8px; font-size:12px; background:var(--primary-background-color, #fafafa); color:var(--primary-text-color, #333); box-sizing:border-box;"
                />
                <div style="max-height:160px; overflow-y:auto;">
                  ${this._getOpeningSensorEntities().map(e=>H`
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
              @input=${e=>this._editingLength=e.target.value}
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

        ${e.angle_group?(()=>{const t=Fe.value,i=e.angle_group,o=t?t.edges.filter(e=>e.angle_group===i).length:0;return H`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${oi(i)};">
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
    `}async _applyDirection(e,t){if(!this.hass)return!1;const i=Fe.value,o=Ne.value;if(!i||!o)return!1;const n=i.edges.map(t=>t.id===e.id?{...t,direction:"free",length_locked:!1,angle_group:void 0}:t),s=Nt(xt(i.nodes,n),e.id,t);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await it(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const e=this._nodeEditor.node,t=Fe.value,i=t?Bt(e.id,t.edges).length:0;return H`
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
          ${2===i?H`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._nodeEditor.node,o=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(o)&&!isNaN(n))try{const s=At(xt(e.nodes,e.edges),i.id,o,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:s.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await it(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(i.id)}catch(e){console.error("Error updating node position:",e),alert(`Failed to update node: ${e}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._nodeEditor.node,o=!i.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:[{node_id:i.id,x:i.x,y:i.y,pinned:o}]}),await it(),this._refreshNodeEditor(i.id)}catch(e){console.error("Error toggling node pin:",e),alert(`Failed to toggle pin: ${e}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(e&&t)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:t.id,floor_id:e.id,node_id:this._nodeEditor.node.id}),await it(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(e){console.error("Failed to dissolve node:",e),alert(`Failed to dissolve node: ${e}`)}}_refreshNodeEditor(e){const t=Fe.value;if(t){const i=t.nodes.find(t=>t.id===e);i&&(this._nodeEditor={node:i,editX:Math.round(i.x).toString(),editY:Math.round(i.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const e=["binary_sensor","cover"];let t=Object.values(this.hass.states).filter(t=>e.some(e=>t.entity_id.startsWith(e+".")));const i=Fe.value,o=this._edgeEditor?.edge.id;if(i){const e=new Set(i.edges.filter(e=>e.entity_id&&e.id!==o).map(e=>e.entity_id));t=t.filter(t=>!e.has(t.entity_id))}if(this._openingSensorSearch){const e=this._openingSensorSearch.toLowerCase();t=t.filter(t=>t.entity_id.toLowerCase().includes(e)||(t.attributes.friendly_name||"").toLowerCase().includes(e))}return t.slice(0,30)}_getFilteredEntities(){if(!this.hass)return[];const e=Re.value,t="light"===e?"light":"switch"===e?"switch":null;if(!t)return[];let i=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith(t+"."));if(this._entitySearch){const e=this._entitySearch.toLowerCase();i=i.filter(t=>t.entity_id.toLowerCase().includes(e)||(t.attributes.friendly_name||"").toLowerCase().includes(e))}return i.slice(0,30)}_getEntityIcon(e){const t=e.entity_id.split(".")[0];return"light"===t?e.attributes.icon||"mdi:lightbulb":"switch"===t?e.attributes.icon||"mdi:toggle-switch":e.attributes.icon||"mdi:devices"}_getEntityIconData(e,t){if(!e)return this._getIconData(t);const i=this.hass,o=i?.entities?.[e.entity_id]?.icon,n=e.attributes.icon;if(o||n)return this._getIconData(o??n??t);const s=this._getStateIconCacheKey(e),r=this._stateIconCache.get(s);return r||(this._queueStateIconLoad(e,s),this._getIconData(t))}_openEntityDetails(e){this.hass&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}_getStateIconCacheKey(e){const t=e.attributes.device_class;return`${e.entity_id}:${e.state}:${t??""}`}_queueStateIconLoad(e,t){if(this._stateIconLoaders.has(t))return;const i=this._loadStateIcon(e,t).catch(t=>{console.warn("Failed to load state icon",e.entity_id,t)}).finally(()=>{this._stateIconLoaders.delete(t)});this._stateIconLoaders.set(t,i)}async _ensureHaStateIconDefined(){if(customElements.get("ha-state-icon"))return;await this._ensureHaIconDefined();const e=new Function("path","return import(path);"),t=["/frontend_latest/ha-state-icon.js","/frontend_es5/ha-state-icon.js"];for(const i of t){try{await e(i)}catch(e){console.warn("Failed to load ha-state-icon module",i,e)}if(customElements.get("ha-state-icon"))break}customElements.get("ha-state-icon")&&await customElements.whenDefined("ha-state-icon")}async _loadStateIcon(e,t){if(!this.hass)return;if(await this._ensureHaStateIconDefined(),!customElements.get("ha-state-icon"))return;const i=document.createElement("ha-state-icon");i.hass=this.hass,i.stateObj=e,i.style.display="none";const o=this.isConnected?this:document.body;o?.appendChild(i);try{i.updateComplete&&await i.updateComplete;let e=null;for(let t=0;t<20;t++){const t=i.shadowRoot?.querySelector("ha-svg-icon");if(t?.path){e={path:t.path,secondaryPath:t.secondaryPath,viewBox:t.viewBox};break}const o=i.shadowRoot?.querySelector("ha-icon"),n=o?.shadowRoot?.querySelector("ha-svg-icon");if(n?.path){e={path:n.path,secondaryPath:n.secondaryPath,viewBox:n.viewBox};break}await new Promise(e=>setTimeout(e,50))}e&&(this._stateIconCache.set(t,e),this.requestUpdate())}finally{i.remove()}}_getIconData(e){const t=this._iconCache.get(e);if(t)return t;this._queueIconLoad(e)}_queueIconLoad(e){if(this._iconLoaders.has(e))return;const t=this._loadIcon(e).catch(t=>{console.warn("Failed to load icon",e,t)}).finally(()=>{this._iconLoaders.delete(e)});this._iconLoaders.set(e,t)}async _ensureHaIconDefined(){if(customElements.get("ha-icon"))return;const e=new Function("path","return import(path);"),t=["/frontend_latest/ha-icon.js","/frontend_es5/ha-icon.js"];for(const i of t){try{await e(i)}catch(e){console.warn("Failed to load ha-icon module",i,e)}if(customElements.get("ha-icon"))break}customElements.get("ha-icon")&&await customElements.whenDefined("ha-icon")}async _loadIcon(e){if(await this._ensureHaIconDefined(),!customElements.get("ha-icon"))return;const t=document.createElement("ha-icon");t.icon=e,t.style.display="none";const i=this.isConnected?this:document.body;i?.appendChild(t);try{t.updateComplete&&await t.updateComplete;let i=null;for(let e=0;e<10;e++){const e=t.shadowRoot?.querySelector("ha-svg-icon");if(e?.path){i={path:e.path,secondaryPath:e.secondaryPath,viewBox:e.viewBox};break}await new Promise(e=>setTimeout(e,50))}i&&(this._iconCache.set(e,i),this.requestUpdate())}finally{t.remove()}}async _placeDevice(e){if(!this.hass||!this._pendingDevice)return;const t=Fe.value,i=Ne.value;if(!t||!i)return;const o="light"===Re.value,n=o?"inhabit/lights/place":"inhabit/switches/place",s=o?"inhabit/lights/remove":"inhabit/switches/remove",r=this.hass,a=i.id,l=t.id,d={...this._pendingDevice.position},c={id:""};try{const t=await r.callWS({type:n,floor_plan_id:a,floor_id:l,entity_id:e,position:d});c.id=t.id,await it(),Xt({type:o?"light_place":"switch_place",description:o?"Place light":"Place switch",undo:async()=>{await r.callWS({type:s,[o?"light_id":"switch_id"]:c.id}),await it()},redo:async()=>{const t=await r.callWS({type:n,floor_plan_id:a,floor_id:l,entity_id:e,position:d});c.id=t.id,await it()}})}catch(e){console.error(`Error placing ${o?"light":"switch"}:`,e),alert(`Failed to place ${o?"light":"switch"}: ${e}`)}this._pendingDevice=null}async _placeMmwave(e){if(!this.hass)return;const t=Fe.value,i=Ne.value;if(!t||!i)return;const o=this.hass,n=i.id,s=t.id,r={...e},a={id:""};try{const e=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=e.id,await it(),Xt({type:"mmwave_place",description:"Place mmWave sensor",undo:async()=>{await o.callWS({type:"inhabit/mmwave/delete",placement_id:a.id}),await it()},redo:async()=>{const e=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=e.id,await it()}})}catch(e){console.error("Error placing mmWave sensor:",e),alert(`Failed to place mmWave sensor: ${e}`)}}async _finishPlacementDrag(){if(!this.hass||!this._draggingPlacement)return;const e=this._draggingPlacement,t=this.hass;if(!Ne.value)return;let i;if(i="light"===e.type?Ve.value.find(t=>t.id===e.id)?.position:"switch"===e.type?qe.value.find(t=>t.id===e.id)?.position:Je.value.find(t=>t.id===e.id)?.position,!i)return;const o={...i},n={...e.originalPosition};try{"light"===e.type?await t.callWS({type:"inhabit/lights/update",light_id:e.id,position:o}):"switch"===e.type?await t.callWS({type:"inhabit/switches/update",switch_id:e.id,position:o}):await t.callWS({type:"inhabit/mmwave/update",placement_id:e.id,position:o});const i=e.type,s=e.id;Xt({type:`${i}_move`,description:`Move ${i}`,undo:async()=>{"light"===i?await t.callWS({type:"inhabit/lights/update",light_id:s,position:n}):"switch"===i?await t.callWS({type:"inhabit/switches/update",switch_id:s,position:n}):await t.callWS({type:"inhabit/mmwave/update",placement_id:s,position:n}),await it()},redo:async()=>{"light"===i?await t.callWS({type:"inhabit/lights/update",light_id:s,position:o}):"switch"===i?await t.callWS({type:"inhabit/switches/update",switch_id:s,position:o}):await t.callWS({type:"inhabit/mmwave/update",placement_id:s,position:o}),await it()}})}catch(t){console.error(`Error moving ${e.type}:`,t),await it()}}async _deleteSelectedPlacement(){if(!this.hass)return;const e=Oe.value;if(1!==e.ids.length)return;const t=this.hass;if(!Ne.value)return;const i=e.ids[0];try{if("light"===e.type)await t.callWS({type:"inhabit/lights/remove",light_id:i}),Ve.value=Ve.value.filter(e=>e.id!==i);else if("switch"===e.type)await t.callWS({type:"inhabit/switches/remove",switch_id:i}),qe.value=qe.value.filter(e=>e.id!==i);else{if("mmwave"!==e.type)return;await t.callWS({type:"inhabit/mmwave/delete",placement_id:i}),Je.value=Je.value.filter(e=>e.id!==i)}Oe.value={type:"none",ids:[]}}catch(e){console.error("Error deleting placement:",e)}}async _rotateMmwave(e){if(!this.hass)return;const t=Oe.value;if("mmwave"!==t.type||1!==t.ids.length)return;const i=t.ids[0],o=Je.value.find(e=>e.id===i);if(!o)return;const n=(o.angle+e+360)%360;try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:i,angle:n}),Je.value=Je.value.map(e=>e.id===i?{...e,angle:n}:e)}catch(e){console.error("Error rotating mmWave:",e)}}_startMmwaveRotation(e,t){e.stopPropagation(),e.preventDefault(),this._rotatingMmwave={id:t.id,originalAngle:t.angle,pointerId:e.pointerId},this._svg?.setPointerCapture(e.pointerId)}_handleMmwaveRotationMove(e){if(!this._rotatingMmwave)return;const t=Je.value.find(e=>e.id===this._rotatingMmwave.id);if(!t)return;const i=e.x-t.position.x,o=e.y-t.position.y;let n=180*Math.atan2(o,i)/Math.PI;n=(n%360+360)%360,n=15*Math.round(n/15),Je.value=Je.value.map(e=>e.id===this._rotatingMmwave.id?{...e,angle:n}:e)}async _finishMmwaveRotation(){if(!this._rotatingMmwave||!this.hass)return;const e=this._rotatingMmwave,t=Je.value.find(t=>t.id===e.id);if(!t)return void(this._rotatingMmwave=null);const i=t.angle;if(i!==e.originalAngle){try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:e.id,angle:i})}catch(t){console.error("Error committing mmWave rotation:",t),Je.value=Je.value.map(t=>t.id===e.id?{...t,angle:e.originalAngle}:t)}this._rotatingMmwave=null}else this._rotatingMmwave=null}_cancelDevicePlacement(){this._pendingDevice=null}_renderEntityPicker(){if(!this._pendingDevice)return null;const e=this._svgToScreen(this._pendingDevice.position),t=this._getFilteredEntities();return H`
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
          ${t.map(e=>H`
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
    `}render(){const e=this._canvasMode,t=[this._isPanning?"panning":"","select"===Re.value?"select-tool":"","viewing"===e?"view-mode":"",`mode-${e}`].filter(Boolean).join(" ");return H`
      <svg
        class="${t}"
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
        ${"walls"===e?this._renderEdgeAnnotations():null}
        ${"walls"===e?this._renderAngleConstraints():null}
        ${"walls"===e?this._renderNodeEndpoints():null}
        ${"furniture"===e&&"zone"===Re.value?this._renderNodeGuideDots():null}
        ${Fe.value?this._renderDeviceLayer(Fe.value):null}
        ${"viewing"!==e&&"occupancy"!==e&&"simulate"!==e?this._renderDrawingPreview():null}
        ${"furniture"===e?this._renderFurnitureDrawingPreview():null}
        ${"walls"===e?this._renderOpeningPreview():null}
        ${"placement"===e?this._renderDevicePreview():null}
        ${"simulate"===e&&Fe.value?this._renderSimulationLayer(Fe.value):null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"occupancy"!==e?this._renderZoneEditor():null}
      ${"placement"===e?this._renderEntityPicker():null}
    `;var i}_getVisibleAnnotationEdgeIds(){const e=Oe.value;if("edge"!==e.type||0===e.ids.length)return null;const t=Fe.value;if(!t)return null;const i=new Set(e.ids),o=t.edges.filter(t=>e.ids.includes(t.id)),n=new Set,s=new Set,r=new Set;for(const e of o)e.link_group&&n.add(e.link_group),e.collinear_group&&s.add(e.collinear_group),e.angle_group&&r.add(e.angle_group);for(const e of t.edges)i.has(e.id)||(e.link_group&&n.has(e.link_group)&&i.add(e.id),e.collinear_group&&s.has(e.collinear_group)&&i.add(e.id),e.angle_group&&r.has(e.angle_group)&&i.add(e.id));return i}_renderEdgeAnnotations(){const e=Fe.value;if(!e||0===e.edges.length)return null;const t=this._getVisibleAnnotationEdgeIds();if(!t)return null;const i=Ot(e);return j`
      <g class="wall-annotations-layer">
        ${i.map(e=>{if(!t.has(e.id))return null;const i=(e.startPos.x+e.endPos.x)/2,o=(e.startPos.y+e.endPos.y)/2,n=this._calculateWallLength(e.startPos,e.endPos),s=Math.atan2(e.endPos.y-e.startPos.y,e.endPos.x-e.startPos.x)*(180/Math.PI),r=s>90||s<-90?s+180:s,a=[];e.length_locked&&a.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===e.direction&&a.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===e.direction&&a.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),p=-(e.thickness/2+6);return j`
            <g transform="translate(${i}, ${o}) rotate(${r})">
              ${e.link_group?j`
                <circle cx="${h}" cy="${p-1}" r="3.5"
                  fill="${oi(e.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${e.collinear_group?j`
                <g transform="translate(${h-(e.link_group?10:0)}, ${p-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${oi(e.collinear_group)}"
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
    `}_renderAngleConstraints(){const e=Fe.value;if(!e||0===e.edges.length)return null;const t=this._getVisibleAnnotationEdgeIds();if(!t)return null;const i=Wt(e.nodes),o=new Map;for(const t of e.edges)t.angle_group&&(o.has(t.angle_group)||o.set(t.angle_group,[]),o.get(t.angle_group).push(t));for(const[e,i]of o)i.some(e=>t.has(e.id))||o.delete(e);const n=[];for(const[,e]of o){if(2!==e.length)continue;const t=new Set([e[0].start_node,e[0].end_node]),o=new Set([e[1].start_node,e[1].end_node]);let s=null;for(const e of t)if(o.has(e)){s=e;break}if(!s)continue;const r=s,a=i.get(r);if(!a)continue;const l=[];for(const t of e){const e=t.start_node===r?t.end_node:t.start_node,o=i.get(e);o&&l.push(Math.atan2(o.y-a.y,o.x-a.x))}if(l.length<2)continue;l.sort((e,t)=>e-t);const d=l.length;for(let e=0;e<d;e++){const t=l[e],i=l[(e+1)%d],o=(i-t+2*Math.PI)%(2*Math.PI);if(Math.PI-o<.01)continue;const s=t+Math.PI,r=i+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):n.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return j`
      <g class="angle-constraints-layer">
        ${n.map(e=>{const t=e.angle1,i=e.angle2,o=i-t,n=180*o/Math.PI;if(n>85&&n<95){const n=.7*s,r=e.x+n*Math.cos(t),a=e.y+n*Math.sin(t),l=e.x+n*Math.cos(i),d=e.y+n*Math.sin(i),c=(t+i)/2,h=n/Math.cos(o/2),p=e.x+h*Math.cos(c),g=e.y+h*Math.sin(c);return j`
              <path d="M${r},${a} L${p},${g} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=e.x+s*Math.cos(t),a=e.y+s*Math.sin(t),l=e.x+s*Math.cos(i),d=e.y+s*Math.sin(i),c=o>Math.PI?1:0;return j`
            <path d="M${r},${a} A${s},${s} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const e=this._multiEdgeEditor.edges,t=this._multiEdgeEditor.collinear??!1;return H`
      <div class="wall-editor"
           @click=${e=>e.stopPropagation()}
           @pointerdown=${e=>e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Oe.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t?H`
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
            ${(()=>{const t=e.map(e=>e.angle_group).filter(Boolean);if(t.length===e.length&&1===new Set(t).size)return H`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===e.length&&(()=>{const t=new Set([e[0].start_node,e[0].end_node]);return t.has(e[1].start_node)||t.has(e[1].end_node)})()?H`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:H`<button
                class="constraint-btn"
                disabled
                title="${2!==e.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const t=e.map(e=>e.link_group).filter(Boolean);return t.length===e.length&&1===new Set(t).size?H`<button
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
            ${(()=>{const i=e.map(e=>e.collinear_group).filter(Boolean);return i.length===e.length&&1===new Set(i).size?H`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:t?H`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}}catch(e){console.error("Error angle linking edges:",e)}}async _angleUnlinkEdges(){if(!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o)if(this._multiEdgeEditor){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}else if(this._edgeEditor){const e=o.edges.find(e=>e.id===i[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error angle unlinking edges:",e)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={edges:e}}}catch(e){console.error("Error linking edges:",e)}}async _unlinkEdges(){if(!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o)if(this._multiEdgeEditor){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={edges:e}}else if(this._edgeEditor){const e=o.edges.find(e=>e.id===i[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error unlinking edges:",e)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=parseFloat(this._editingTotalLength);if(isNaN(i)||i<=0)return;const o=this._multiEdgeEditor.edges.map(e=>e.id),n=function(e,t,i){const o=new Set,n=[];for(const i of t){const t=e.edges.get(i);if(t){if(t.length_locked)return{updates:[],blocked:!0,blockedBy:[t.id]};n.push(t),o.add(t.start_node),o.add(t.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const t of o){const i=e.nodes.get(t);i&&s.push({x:i.x,y:i.y})}const{anchor:r,dir:a}=at(s),l=new Map;for(const t of o){const i=e.nodes.get(t);if(!i)continue;const o=i.x-r.x,n=i.y-r.y,s=o*a.x+n*a.y;l.set(t,s)}let d=1/0,c=-1/0,h="";for(const[e,t]of l)t<d&&(d=t,h=e),t>c&&(c=t);const p=c-d;if(p<1e-9)return{updates:[],blocked:!1};const g=wt(e),u=new Set;for(const[e,t]of l){if(u.add(e),e===h)continue;const o=d+i/p*(t-d);g.set(e,{x:r.x+o*a.x,y:r.y+o*a.y})}const f=new Set(u);for(const[t,i]of e.nodes)i.pinned&&f.add(t);const _=Pt(e,f,g);for(const t of u){const i=g.get(t),o=e.nodes.get(t);i&&(Math.abs(i.x-o.x)>dt||Math.abs(i.y-o.y)>dt)&&(_.updates.some(e=>e.nodeId===t)||_.updates.push({nodeId:t,x:i.x,y:i.y}))}return _.blocked=!1,delete _.blockedBy,_}(xt(e.nodes,e.edges),o,i);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:t.id,floor_id:e.id,updates:n.updates.map(e=>({node_id:e.nodeId,x:e.x,y:e.y}))}),await it();Fe.value&&this._updateEdgeEditorForSelection(o)}catch(e){console.error("Error applying total length:",e)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor.edges.map(e=>e.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}}catch(e){console.error("Error collinear linking edges:",e)}}async _collinearUnlinkEdges(){if(!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(e=>e.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:t.id,floor_id:e.id,edge_ids:i}),await it();const o=Fe.value;if(o)if(this._multiEdgeEditor){const e=i.map(e=>o.edges.find(t=>t.id===e)).filter(e=>!!e);this._multiEdgeEditor={...this._multiEdgeEditor,edges:e}}else if(this._edgeEditor){const e=o.edges.find(e=>e.id===i[0]);e&&(this._edgeEditor={...this._edgeEditor,edge:e})}}catch(e){console.error("Error collinear unlinking edges:",e)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const e=Fe.value,t=Ne.value;if(!e||!t)return;const i=this._multiEdgeEditor.edges;try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:t.id,floor_id:e.id,edge_id:o.id});await it(),await this._syncRoomsWithEdges()}catch(e){console.error("Error deleting edges:",e)}this._multiEdgeEditor=null,Oe.value={type:"none",ids:[]}}_renderDevicePreview(){const e=Re.value;if("light"!==e&&"switch"!==e&&"mmwave"!==e||this._pendingDevice)return null;const t="light"===e?"#ffd600":"switch"===e?"#4caf50":"#2196f3";return j`
      <g class="device-preview">
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="${"mmwave"===e?8:12}"
          fill="${t}"
          fill-opacity="0.3"
          stroke="${t}"
          stroke-width="2"
          stroke-dasharray="4,2"
        />
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="3"
          fill="${t}"
        />
      </g>
    `}}e([pe({attribute:!1})],ni.prototype,"hass",void 0),e([
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function(e){return(t,i,o)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}("svg")],ni.prototype,"_svg",void 0),e([ge()],ni.prototype,"_viewBox",void 0),e([ge()],ni.prototype,"_isPanning",void 0),e([ge()],ni.prototype,"_panStart",void 0),e([ge()],ni.prototype,"_cursorPos",void 0),e([ge()],ni.prototype,"_wallStartPoint",void 0),e([ge()],ni.prototype,"_roomEditor",void 0),e([ge()],ni.prototype,"_haAreas",void 0),e([ge()],ni.prototype,"_hoveredNode",void 0),e([ge()],ni.prototype,"_draggingNode",void 0),e([ge()],ni.prototype,"_nodeEditor",void 0),e([ge()],ni.prototype,"_edgeEditor",void 0),e([ge()],ni.prototype,"_multiEdgeEditor",void 0),e([ge()],ni.prototype,"_editingTotalLength",void 0),e([ge()],ni.prototype,"_editingLength",void 0),e([ge()],ni.prototype,"_editingLengthLocked",void 0),e([ge()],ni.prototype,"_editingDirection",void 0),e([ge()],ni.prototype,"_editingOpeningParts",void 0),e([ge()],ni.prototype,"_editingOpeningType",void 0),e([ge()],ni.prototype,"_editingSwingDirection",void 0),e([ge()],ni.prototype,"_editingEntityId",void 0),e([ge()],ni.prototype,"_openingSensorSearch",void 0),e([ge()],ni.prototype,"_openingSensorPickerOpen",void 0),e([ge()],ni.prototype,"_blinkingEdgeIds",void 0),e([ge()],ni.prototype,"_focusedRoomId",void 0),e([ge()],ni.prototype,"_pendingDevice",void 0),e([ge()],ni.prototype,"_entitySearch",void 0),e([ge()],ni.prototype,"_openingPreview",void 0),e([ge(),ge()],ni.prototype,"_zonePolyPoints",void 0),e([ge()],ni.prototype,"_pendingZonePolygon",void 0),e([ge()],ni.prototype,"_zoneEditor",void 0),e([ge()],ni.prototype,"_draggingZone",void 0),e([ge()],ni.prototype,"_draggingZoneVertex",void 0),e([ge()],ni.prototype,"_draggingPlacement",void 0),e([ge()],ni.prototype,"_rotatingMmwave",void 0),e([ge()],ni.prototype,"_draggingSimTarget",void 0),e([ge()],ni.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",ni);const si=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"}],ri=[{id:"zone",icon:"mdi:vector-polygon",label:"Zone"}],ai=[{id:"light",icon:"mdi:lightbulb",label:"Light"},{id:"switch",icon:"mdi:toggle-switch",label:"Switch"},{id:"mmwave",icon:"mdi:access-point",label:"mmWave"}];class li extends le{constructor(){super(...arguments),this.floorPlans=[],this._addMenuOpen=!1,this._floorMenuOpen=!1,this._canvasMode="walls",this._renamingFloorId=null,this._renameValue="",this._cleanupEffects=[],this._renameCommitted=!1,this._documentListenerAttached=!1,this._handleDocumentClick=e=>{e.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
    :host {
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 4px;
      height: var(--header-height, 56px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-sizing: border-box;
      overflow: visible;
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
      background: var(--primary-color);
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

    /* --- Mode switcher --- */
    .mode-group {
      display: flex;
      gap: 2px;
      background: rgba(0, 0, 0, 0.06);
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
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .mode-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .mode-button.active {
      background: var(--primary-color);
      color: #fff;
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
      background: var(--primary-color);
      color: #fff;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }

    .add-button:hover {
      opacity: 0.85;
    }

    .add-button.menu-open {
      opacity: 0.85;
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
  `}_selectFloor(e){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:e},bubbles:!0,composed:!0}))}_handleToolSelect(e){Re.value=e,this._addMenuOpen=!1}_handleUndo(){Gt()}_handleRedo(){Jt()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(e,t,i){e.stopPropagation(),confirm(`Delete "${i}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:t},bubbles:!0,composed:!0})))}_startRename(e,t,i){e.stopPropagation(),this._renamingFloorId=t,this._renameValue=i,this._renameCommitted=!1,this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelector(".rename-input");e&&(e.focus(),e.select())})}_commitRename(){if(this._renameCommitted)return;this._renameCommitted=!0;const e=this._renamingFloorId,t=this._renameValue.trim();this._renamingFloorId=null,e&&t&&this.dispatchEvent(new CustomEvent("rename-floor",{detail:{id:e,name:t},bubbles:!0,composed:!0}))}_cancelRename(){this._renamingFloorId=null}_handleRenameKeyDown(e){"Enter"===e.key?this._commitRename():"Escape"===e.key&&this._cancelRename()}_openImportExport(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("open-import-export",{bubbles:!0,composed:!0}))}_toggleAddMenu(){this._addMenuOpen=!this._addMenuOpen,this._floorMenuOpen=!1}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen,this._addMenuOpen=!1}_closeMenus(){this._addMenuOpen=!1,this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),this._documentListenerAttached||(document.addEventListener("click",this._handleDocumentClick),this._documentListenerAttached=!0),this._cleanupEffects.push(De(()=>{this._canvasMode=We.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._documentListenerAttached=!1,this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}render(){const e=Ne.value,t=Fe.value,i=Re.value,o=this._canvasMode,n=e?.floors||[],s="walls"===o?si:"furniture"===o?ri:"placement"===o?ai:[];return H`
      <!-- Floor Selector -->
      ${n.length>0?H`
        <div class="floor-selector">
          <button
            class="floor-trigger ${this._floorMenuOpen?"open":""}"
            @click=${this._toggleFloorMenu}
          >
            ${t?.name||"Select floor"}
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          ${this._floorMenuOpen?H`
            <div class="floor-dropdown">
              ${n.map(e=>this._renamingFloorId===e.id?H`
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
                  `:H`
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
          class="mode-button ${"walls"===o?"active":""}"
          @click=${()=>tt("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"furniture"===o?"active":""}"
          @click=${()=>tt("furniture")}
          title="Zones mode"
        >
          <ha-icon icon="mdi:vector-square"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===o?"active":""}"
          @click=${()=>tt("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
        <button
          class="mode-button ${"occupancy"===o?"active":""}"
          @click=${()=>tt("occupancy")}
          title="Occupancy mode"
        >
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
        </button>
        <button
          class="mode-button ${"simulate"===o?"active":""}"
          @click=${()=>tt("simulate")}
          title="Simulate mode"
        >
          <ha-icon icon="mdi:radar"></ha-icon>
        </button>
      </div>

      <div class="spacer"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!Kt.value}
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

      <div class="divider"></div>

      <!-- Simulate mode: hitbox toggle -->
      ${"simulate"===o?H`
        <div class="tool-group">
          <button
            class="tool-button ${et.value?"active":""}"
            @click=${()=>{et.value=!et.value}}
            title="${et.value?"Hitbox detection enabled":"Hitbox detection disabled"}"
          >
            <ha-icon icon="${et.value?"mdi:vector-square-edit":"mdi:vector-square-remove"}"></ha-icon>
          </button>
        </div>
      `:null}

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
                  ${s.map(e=>H`
                      <button
                        class="add-menu-item ${i===e.id?"active":""}"
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
    `}}e([pe({attribute:!1})],li.prototype,"hass",void 0),e([pe({attribute:!1})],li.prototype,"floorPlans",void 0),e([ge()],li.prototype,"_addMenuOpen",void 0),e([ge()],li.prototype,"_floorMenuOpen",void 0),e([ge()],li.prototype,"_canvasMode",void 0),e([ge()],li.prototype,"_renamingFloorId",void 0),e([ge()],li.prototype,"_renameValue",void 0),customElements.get("fpb-toolbar")||customElements.define("fpb-toolbar",li);class di extends le{constructor(){super(...arguments),this.open=!1,this._mode="export",this._exportSelection=new Set,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1,this._error=null}static{this.styles=r`
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
  `}show(e){this._mode=e||"export",this._error=null,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1;const t=Ne.value;t&&(this._exportSelection=new Set(t.floors.map(e=>e.id))),this.open=!0}close(){this.open=!1}_setMode(e){this._mode=e,this._error=null}_toggleExportFloor(e){const t=new Set(this._exportSelection);t.has(e)?t.delete(e):t.add(e),this._exportSelection=t}_toggleExportAll(){const e=Ne.value;e&&(this._exportSelection.size===e.floors.length?this._exportSelection=new Set:this._exportSelection=new Set(e.floors.map(e=>e.id)))}async _doExport(){if(!this.hass)return;const e=Ne.value;if(e&&0!==this._exportSelection.size){this._exporting=!0,this._error=null;try{const t=[];for(const i of this._exportSelection){const o=await this.hass.callWS({type:"inhabit/floors/export",floor_plan_id:e.id,floor_id:i});t.push(o)}const i=1===t.length?t[0]:{inhabit_version:"1.0",export_type:"floors",exported_at:(new Date).toISOString(),floors:t},o=JSON.stringify(i,null,2),n=new Blob([o],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s;const a=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),l=1===t.length?(t[0].floor?.name||"floor").toLowerCase().replace(/[^a-z0-9]+/g,"-"):"floors";r.download=`inhabit-${a}-${l}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s),this.close()}catch(e){console.error("Export error:",e),this._error=`Export failed: ${e?.message||e}`}finally{this._exporting=!1}}}_pickFile(){const e=document.createElement("input");e.type="file",e.accept=".json",e.style.display="none",document.body.appendChild(e),e.addEventListener("change",async()=>{const t=e.files?.[0];if(document.body.removeChild(e),t)try{const e=await t.text(),i=JSON.parse(e);this._parseImportFile(i)}catch{this._error="Could not read file. Make sure it's a valid Inhabit JSON export."}}),e.click()}_parseImportFile(e){if(this._error=null,!e||"object"!=typeof e)return void(this._error="Invalid file format.");const t=e;if("floors"===t.export_type&&Array.isArray(t.floors)){const e=t.floors;return this._importData=e,void(this._importEntries=e.map((e,t)=>{const i=e.floor,o=e.devices;return{index:t,name:i?.name||`Floor ${t+1}`,level:i?.level??t,roomCount:Array.isArray(i?.rooms)?i.rooms.length:0,wallCount:Array.isArray(i?.edges)?i.edges.length:Array.isArray(i?.walls)?i.walls.length:0,deviceCount:Array.isArray(o)?o.length:0,selected:!0}}))}if("floor"===t.export_type){this._importData=[t];const e=t.floor,i=t.devices;return void(this._importEntries=[{index:0,name:e?.name||"Imported Floor",level:e?.level??0,roomCount:Array.isArray(e?.rooms)?e.rooms.length:0,wallCount:Array.isArray(e?.edges)?e.edges.length:Array.isArray(e?.walls)?e.walls.length:0,deviceCount:Array.isArray(i)?i.length:0,selected:!0}])}this._error="Invalid file: not an Inhabit floor export."}_toggleImportFloor(e){this._importEntries=this._importEntries.map(t=>t.index===e?{...t,selected:!t.selected}:t)}_toggleImportAll(){const e=this._importEntries.every(e=>e.selected);this._importEntries=this._importEntries.map(t=>({...t,selected:!e}))}async _doImport(){if(!this.hass)return;const e=Ne.value;if(!e)return;const t=this._importEntries.filter(e=>e.selected);if(0!==t.length){this._importing=!0,this._error=null;try{let i=null;const o=[];for(const n of t){const t=this._importData[n.index],s=await this.hass.callWS({type:"inhabit/floors/import",floor_plan_id:e.id,data:t});o.push(s),i=s}const n={...e,floors:[...e.floors,...o]};this.dispatchEvent(new CustomEvent("floors-imported",{detail:{floorPlan:n,switchTo:i},bubbles:!0,composed:!0})),this.close()}catch(e){console.error("Import error:",e),this._error=`Import failed: ${e?.message||e}`}finally{this._importing=!1}}}_onOverlayClick(e){e.target.classList.contains("overlay")&&this.close()}render(){if(!this.open)return q;const e=Ne.value,t=e?.floors||[];return H`
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

          ${this._error?H`<div class="error-msg" style="margin: 0 16px 8px;">${this._error}</div>`:q}

          <div class="dialog-content">
            ${"export"===this._mode?this._renderExport(t):this._renderImport()}
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
    `}_renderExport(e){if(0===e.length)return H`<div class="empty-msg">No floors to export.</div>`;const t=this._exportSelection.size===e.length;return H`
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
        ${e.map(e=>H`
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
    `}_renderImport(){if(0===this._importEntries.length)return H`
        <div class="file-drop" @click=${this._pickFile}>
          <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          <span>Choose an Inhabit JSON file</span>
        </div>
      `;const e=this._importEntries.every(e=>e.selected);return H`
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
        ${this._importEntries.map(e=>H`
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
    `}}e([pe({attribute:!1})],di.prototype,"hass",void 0),e([pe({type:Boolean,reflect:!0})],di.prototype,"open",void 0),e([ge()],di.prototype,"_mode",void 0),e([ge()],di.prototype,"_exportSelection",void 0),e([ge()],di.prototype,"_importEntries",void 0),e([ge()],di.prototype,"_importData",void 0),e([ge()],di.prototype,"_importing",void 0),e([ge()],di.prototype,"_exporting",void 0),e([ge()],di.prototype,"_error",void 0),customElements.get("fpb-import-export-dialog")||customElements.define("fpb-import-export-dialog",di);class ci extends le{constructor(){super(...arguments),this.targetId="",this.targetName="",this.targetType="room",this._config=null,this._occupancyState=null,this._loading=!0}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._loadConfig(),this._startPolling()}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}updated(e){e.has("targetId")&&this.targetId&&this._loadConfig()}_startPolling(){this._pollTimer=window.setInterval(()=>this._loadOccupancyState(),2e3)}_stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}async _loadConfig(){if(this.hass&&this.targetId){this._loading=!0;try{const e=await this.hass.callWS({type:"inhabit/sensor_config/get",room_id:this.targetId});this._config=e}catch{this._config=null}await this._loadOccupancyState(),this._loading=!1}}async _loadOccupancyState(){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/occupancy_states"});this._occupancyState=e[this.targetId]??null}catch{}}async _updateConfig(e){if(this.hass&&this._config)try{const t=await this.hass.callWS({type:"inhabit/sensor_config/update",room_id:this.targetId,...e});this._config=t}catch(e){console.error("Failed to update sensor config:",e)}}async _addSensor(e,t){if(!this._config||!t)return;const i=`${e}_sensors`,o=this._config[i];if(o.some(e=>e.entity_id===t))return;const n=[...o,{entity_id:t,sensor_type:e,weight:1,inverted:!1}];await this._updateConfig({[i]:n})}async _removeSensor(e,t){if(!this._config)return;const i=`${e}_sensors`,o=this._config[i].filter(e=>e.entity_id!==t);await this._updateConfig({[i]:o})}_renderSensorSection(e,t,i){const o=`add-${t}-input`;return H`
      <div class="section">
        <div class="section-title">${e}</div>
        <div class="sensor-list">
          ${i.map(e=>H`
            <div class="sensor-item">
              <ha-icon icon=${"motion"===t?"mdi:motion-sensor":"presence"===t?"mdi:account-eye":"mdi:door"} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${e.entity_id}</span>
              <button class="remove-btn" @click=${()=>this._removeSensor(t,e.entity_id)}>x</button>
            </div>
          `)}
        </div>
        <div class="add-sensor-row">
          <input
            id=${o}
            type="text"
            placeholder="binary_sensor.xxx"
            @keydown=${e=>{if("Enter"===e.key){const i=e.target;this._addSensor(t,i.value.trim()),i.value=""}}}
          />
          <button @click=${()=>{const e=this.shadowRoot?.querySelector(`#${o}`);e&&(this._addSensor(t,e.value.trim()),e.value="")}}>Add</button>
        </div>
      </div>
    `}_renderStatus(){const e=this._occupancyState;if(!e)return q;const t=e.state,i=e.state.charAt(0).toUpperCase()+e.state.slice(1),o=Math.round(100*e.confidence);return H`
      <div class="section">
        <div class="section-title">Live Status</div>
        <div class="status-section">
          <div>
            <span class="state-badge ${t}">${i}</span>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--secondary-text-color);">Confidence: ${o}%</label>
            <div class="confidence-bar">
              <div class="confidence-bar-fill" style="width: ${o}%;"></div>
            </div>
          </div>
          ${e.contributing_sensors.length>0?H`
            <div class="contributing-sensors">
              Contributing: ${e.contributing_sensors.join(", ")}
            </div>
          `:q}
        </div>
      </div>
    `}render(){return H`
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
              @change=${e=>this._updateConfig({enabled:e.target.checked})}
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
                @change=${e=>this._updateConfig({presence_affects:e.target.checked})}
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
        `:H`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `}
      </div>
    `}}e([pe({attribute:!1})],ci.prototype,"hass",void 0),e([pe({type:String})],ci.prototype,"targetId",void 0),e([pe({type:String})],ci.prototype,"targetName",void 0),e([pe({type:String})],ci.prototype,"targetType",void 0),e([ge()],ci.prototype,"_config",void 0),e([ge()],ci.prototype,"_occupancyState",void 0),e([ge()],ci.prototype,"_loading",void 0),customElements.define("fpb-occupancy-panel",ci);class hi extends le{constructor(){super(...arguments),this.placementId="",this._placement=null,this._loading=!0}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._loadPlacement()}updated(e){e.has("placementId")&&this.placementId&&this._loadPlacement()}async _loadPlacement(){if(!this.hass||!this.placementId)return;this._loading=!0;const e=Je.value.find(e=>e.id===this.placementId);this._placement=e??null,this._loading=!1}async _update(e){if(this.hass&&this._placement)try{const t=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...e});this._placement=t,Je.value=Je.value.map(e=>e.id===t.id?t:e)}catch(e){console.error("Failed to update mmWave placement:",e)}}async _deletePlacement(){if(this.hass&&this._placement)try{await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),Je.value=Je.value.filter(e=>e.id!==this.placementId),this.dispatchEvent(new CustomEvent("close-panel"))}catch(e){console.error("Failed to delete mmWave placement:",e)}}render(){return H`
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

          <!-- Delete -->
          <div class="section">
            <button class="delete-btn" @click=${this._deletePlacement}>Delete Sensor</button>
          </div>
        `:H`<p>Placement not found.</p>`}
      </div>
    `}}e([pe({attribute:!1})],hi.prototype,"hass",void 0),e([pe({type:String})],hi.prototype,"placementId",void 0),e([ge()],hi.prototype,"_placement",void 0),e([ge()],hi.prototype,"_loading",void 0),customElements.define("fpb-mmwave-panel",hi);class pi extends le{constructor(){super(...arguments),this.placementId="",this.deviceType="light",this._entitySearch="",this._rebinding=!1}static{this.styles=r`
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

    .entity-search {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      box-sizing: border-box;
    }

    .entity-list {
      max-height: 200px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .entity-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 6px;
      font-size: 13px;
      color: var(--primary-text-color);
      text-align: left;
    }

    .entity-option:hover {
      background: var(--secondary-background-color);
    }

    .entity-option .friendly-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-option .entity-id-small {
      color: var(--secondary-text-color);
      font-size: 11px;
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

    .delete-btn:hover {
      opacity: 0.9;
    }
  `}_getPlacement(){return"light"===this.deviceType?Ve.value.find(e=>e.id===this.placementId)??null:"switch"===this.deviceType?qe.value.find(e=>e.id===this.placementId)??null:Je.value.find(e=>e.id===this.placementId)??null}_getFilteredEntities(){if(!this.hass)return[];const e="mmwave"===this.deviceType?"":`${this.deviceType}.`,t=this._entitySearch.toLowerCase();return Object.keys(this.hass.states).filter(i=>{if(e&&!i.startsWith(e))return!1;if(!t)return!0;const o=String(this.hass.states[i].attributes?.friendly_name??"");return i.toLowerCase().includes(t)||o.toLowerCase().includes(t)}).slice(0,50).map(e=>({entity_id:e,friendly_name:String(this.hass.states[e].attributes?.friendly_name??e)}))}async _rebindEntity(e){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/update",light_id:this.placementId,entity_id:e}),Ve.value=Ve.value.map(t=>t.id===this.placementId?{...t,entity_id:e}:t)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/update",switch_id:this.placementId,entity_id:e}),qe.value=qe.value.map(t=>t.id===this.placementId?{...t,entity_id:e}:t)):(await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,entity_id:e}),Je.value=Je.value.map(t=>t.id===this.placementId?{...t,entity_id:e}:t)),this._rebinding=!1,this._entitySearch="",this.requestUpdate()}catch(e){console.error("Failed to rebind entity:",e)}}async _updateMmwave(e){if(this.hass)try{const t=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...e});Je.value=Je.value.map(e=>e.id===t.id?t:e),this.requestUpdate()}catch(e){console.error("Failed to update mmWave placement:",e)}}async _deletePlacement(){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/remove",light_id:this.placementId}),Ve.value=Ve.value.filter(e=>e.id!==this.placementId)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/remove",switch_id:this.placementId}),qe.value=qe.value.filter(e=>e.id!==this.placementId)):(await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),Je.value=Je.value.filter(e=>e.id!==this.placementId)),Oe.value={type:"none",ids:[]},Ge.value=null}catch(e){console.error("Failed to delete placement:",e)}}_close(){Ge.value=null}_getIcon(){return"light"===this.deviceType?"mdi:lightbulb":"switch"===this.deviceType?"mdi:toggle-switch":"mdi:access-point"}_getTitle(){return"light"===this.deviceType?"Light":"switch"===this.deviceType?"Switch":"mmWave Sensor"}render(){const e=this._getPlacement();if(!e)return H`
        <div class="panel-header">
          <h3>${this._getTitle()}</h3>
          <button class="close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="panel-body"><p>Placement not found.</p></div>
      `;const t="entity_id"in e?e.entity_id:void 0,i=t&&this.hass?.states[t]?this.hass.states[t].attributes?.friendly_name??t:t??"No entity";return H`
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
        <!-- Entity binding -->
        <div class="section">
          <div class="section-title">Entity</div>
          ${this._rebinding?H`
            <input
              class="entity-search"
              type="text"
              placeholder="Search entities..."
              .value=${this._entitySearch}
              @input=${e=>{this._entitySearch=e.target.value,this.requestUpdate()}}
              @keydown=${e=>{"Escape"===e.key&&(this._rebinding=!1,this._entitySearch="")}}
            />
            <div class="entity-list">
              ${this._getFilteredEntities().map(e=>H`
                <button class="entity-option" @click=${()=>this._rebindEntity(e.entity_id)}>
                  <span class="friendly-name">${e.friendly_name}</span>
                  <span class="entity-id-small">${e.entity_id}</span>
                </button>
              `)}
            </div>
          `:H`
            <div class="entity-row">
              <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${i}</span>
              <button class="rebind-btn" @click=${()=>{this._rebinding=!0}}>Change</button>
            </div>
          `}
        </div>

        ${"mmwave"===this.deviceType?this._renderMmwaveSettings(e):null}

        <!-- Delete -->
        <div class="section">
          <button class="delete-btn" @click=${this._deletePlacement}>
            Delete ${this._getTitle()}
          </button>
        </div>
      </div>
    `}_renderMmwaveSettings(e){return H`
      <div class="section">
        <div class="section-title">Sensor Settings</div>

        <div class="slider-row">
          <label>Facing Angle <span>${e.angle.toFixed(0)}&deg;</span></label>
          <input type="range" min="0" max="360" step="1"
            .value=${String(e.angle)}
            @input=${t=>{const i=Number(t.target.value);Je.value=Je.value.map(t=>t.id===e.id?{...t,angle:i}:t),this.requestUpdate()}}
            @change=${e=>this._updateMmwave({angle:Number(e.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Field of View <span>${e.field_of_view.toFixed(0)}&deg;</span></label>
          <input type="range" min="30" max="180" step="5"
            .value=${String(e.field_of_view)}
            @input=${t=>{const i=Number(t.target.value);Je.value=Je.value.map(t=>t.id===e.id?{...t,field_of_view:i}:t),this.requestUpdate()}}
            @change=${e=>this._updateMmwave({field_of_view:Number(e.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Detection Range <span>${e.detection_range.toFixed(0)}cm</span></label>
          <input type="range" min="50" max="1200" step="25"
            .value=${String(e.detection_range)}
            @input=${t=>{const i=Number(t.target.value);Je.value=Je.value.map(t=>t.id===e.id?{...t,detection_range:i}:t),this.requestUpdate()}}
            @change=${e=>this._updateMmwave({detection_range:Number(e.target.value)})}
          />
        </div>
      </div>
    `}}e([pe({attribute:!1})],pi.prototype,"hass",void 0),e([pe({type:String})],pi.prototype,"placementId",void 0),e([pe({type:String})],pi.prototype,"deviceType",void 0),e([ge()],pi.prototype,"_entitySearch",void 0),e([ge()],pi.prototype,"_rebinding",void 0),customElements.define("fpb-device-panel",pi);class gi extends le{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1,this._haAreas=[],this._focusedRoomId=null,this._occupancyPanelTarget=null,this._devicePanelTarget=null,this._cleanupEffects=[]}static{this.styles=r`
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
  `}connectedCallback(){var e;super.connectedCallback(),Ne.value=null,Fe.value=null,We.value="walls",Re.value="select",Oe.value={type:"none",ids:[]},Be.value={x:0,y:0,width:1e3,height:800},Ue.value=10,Ze.value=!0,He.value=!0,je.value=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}],Ve.value=[],qe.value=[],Ke.value=new Map,Ye.value=null,Xe.value=null,Ge.value=null,Je.value=[],Qe.value=[],et.value=!0,Te._reloadFloorData=null,We.value="walls",Qt(),e=()=>this._reloadCurrentFloor(),Te._reloadFloorData=e,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(De(()=>{this._focusedRoomId=Ye.value}),De(()=>{this._occupancyPanelTarget=Xe.value}),De(()=>{this._devicePanelTarget=Ge.value}),De(()=>{Fe.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(e=>e()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const e=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=e}catch(e){console.error("Error loading HA areas:",e)}}async _reloadCurrentFloor(){if(!this.hass)return;const e=Ne.value;if(e)try{const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t;const i=t.find(t=>t.id===e.id);if(i){Ne.value=i;const e=Fe.value?.id;if(e){const t=i.floors.find(t=>t.id===e);t?Fe.value=t:i.floors.length>0&&(Fe.value=i.floors[0])}else i.floors.length>0&&(Fe.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(e){console.error("Error reloading floor data:",e)}}_detectFloorConflicts(e){const t=new Map;for(const i of e.floors){const e=Ft(i.nodes,i.edges);e.length>0&&(t.set(i.id,e),console.warn(`[inhabit] Detected ${e.length} constraint conflict(s) on floor "${i.id}":`,e.map(e=>`${e.edgeId} (${e.type})`)))}Ke.value=t}updated(e){e.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e,e.length>0&&(Ne.value=e[0],e[0].floors.length>0&&(Fe.value=e[0].floors[0],Ue.value=e[0].grid_size),this._detectFloorConflicts(e[0]),await this._loadDevicePlacements(e[0].id)),this._loading=!1}catch(e){this._loading=!1,this._error=`Failed to load floor plans: ${e instanceof Error?e.message:e}`,console.error("Error loading floor plans:",e)}}async _loadDevicePlacements(e){if(this.hass)try{const[t,i,o]=await Promise.all([this.hass.callWS({type:"inhabit/lights/list",floor_plan_id:e}),this.hass.callWS({type:"inhabit/switches/list",floor_plan_id:e}),this.hass.callWS({type:"inhabit/mmwave/list",floor_plan_id:e})]);Ve.value=t,qe.value=i,Je.value=o}catch(e){console.error("Error loading device placements:",e)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(e){if(this.hass)try{const t=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});t.floors=[];for(let i=0;i<e;i++){const e=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:`Floor ${i+1}`,level:i});t.floors.push(e)}this._floorPlans=[t],Ne.value=t,Fe.value=t.floors[0],Ue.value=t.grid_size}catch(e){console.error("Error creating floors:",e),alert(`Failed to create floors: ${e instanceof Error?e.message:e}`)}}async _addFloor(){if(!this.hass)return;const e=Ne.value;if(!e)return;const t=prompt("Floor name:",`Floor ${e.floors.length+1}`);if(t)try{const i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:t,level:e.floors.length}),o={...e,floors:[...e.floors,i]};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?o:t),Ne.value=o,Fe.value=i}catch(e){console.error("Error adding floor:",e),alert(`Failed to add floor: ${e instanceof Error?e.message:e}`)}}async _deleteFloor(e){if(!this.hass)return;const t=Ne.value;if(t)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:t.id,floor_id:e});const i=t.floors.filter(t=>t.id!==e),o={...t,floors:i};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?o:e),Ne.value=o,Fe.value?.id===e&&(Qt(),Fe.value=i.length>0?i[0]:null)}catch(e){console.error("Error deleting floor:",e),alert(`Failed to delete floor: ${e instanceof Error?e.message:e}`)}}async _renameFloor(e,t){if(!this.hass)return;const i=Ne.value;if(i)try{await this.hass.callWS({type:"inhabit/floors/update",floor_plan_id:i.id,floor_id:e,name:t});const o=i.floors.map(i=>i.id===e?{...i,name:t}:i),n={...i,floors:o};this._floorPlans=this._floorPlans.map(e=>e.id===i.id?n:e),Ne.value=n,Fe.value?.id===e&&(Fe.value={...Fe.value,name:t})}catch(e){console.error("Error renaming floor:",e)}}_openImportExport(){const e=this.shadowRoot?.querySelector("fpb-import-export-dialog");e?.show()}async _handleFloorsImported(e){const{floorPlan:t,switchTo:i}=e.detail;this._floorPlans=this._floorPlans.map(e=>e.id===t.id?t:e),Ne.value=t,i&&(Qt(),Fe.value=i),await this._loadDevicePlacements(t.id)}_handleFloorSelect(e){const t=Ne.value;if(t){const i=t.floors.find(t=>t.id===e);i&&(Fe.value?.id!==i.id&&(Qt(),Ye.value=null),Fe.value=i)}}_handleRoomChipClick(e){Ye.value===e?Ye.value=null:Ye.value=e}_renderRoomChips(){const e=Fe.value;if(!e||0===e.rooms.length)return null;const t=Ne.value?.unit,i=e=>{switch(t){case"cm":return e/1e4;case"m":default:return e;case"in":return 64516e-8*e;case"ft":return.092903*e}},o=[...e.rooms].sort((e,t)=>{const o=i(Math.abs(rt(e.polygon))),n=i(Math.abs(rt(t.polygon)));return o===n?e.name.localeCompare(t.name):n-o});return H`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${o.map(e=>{const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id):null,i=t?.icon||"mdi:floor-plan",o=t?.name??e.name;return H`
            <button
              class="room-chip ${this._focusedRoomId===e.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(e.id)}
            >
              <ha-icon icon=${i} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${o}</span>
            </button>
          `})}
      </div>
    `}render(){return this._loading?H`
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
              @input=${e=>{const t=parseInt(e.target.value,10);t>=1&&t<=10&&(this._floorCount=t)}}
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
            @floor-select=${e=>this._handleFloorSelect(e.detail.id)}
            @add-floor=${this._addFloor}
            @delete-floor=${e=>this._deleteFloor(e.detail.id)}
            @rename-floor=${e=>this._renameFloor(e.detail.id,e.detail.name)}
            @open-import-export=${this._openImportExport}
          ></fpb-toolbar>

          ${this._renderRoomChips()}

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
            ${this._occupancyPanelTarget?H`
              <fpb-occupancy-panel
                class="floating-panel"
                .hass=${this.hass}
                .targetId=${this._occupancyPanelTarget.id}
                .targetName=${this._occupancyPanelTarget.name}
                .targetType=${this._occupancyPanelTarget.type}
                @close-panel=${()=>{Xe.value=null}}
              ></fpb-occupancy-panel>
            `:null}
            ${this._devicePanelTarget?H`
              <fpb-device-panel
                class="floating-panel"
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
    `}}e([pe({attribute:!1})],gi.prototype,"hass",void 0),e([pe({type:Boolean})],gi.prototype,"narrow",void 0),e([ge()],gi.prototype,"_floorPlans",void 0),e([ge()],gi.prototype,"_loading",void 0),e([ge()],gi.prototype,"_error",void 0),e([ge()],gi.prototype,"_floorCount",void 0),e([ge()],gi.prototype,"_haAreas",void 0),e([ge()],gi.prototype,"_focusedRoomId",void 0),e([ge()],gi.prototype,"_occupancyPanelTarget",void 0),e([ge()],gi.prototype,"_devicePanelTarget",void 0),customElements.define("ha-floorplan-builder",gi);export{gi as HaFloorplanBuilder};
