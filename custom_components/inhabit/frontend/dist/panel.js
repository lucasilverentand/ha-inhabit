function t(t,e,i,o){var n,s=arguments.length,r=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(s<3?n(r):s>3?n(e,i,r):n(e,i))||r);return s>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new s(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,f=u.trustedTypes,_=f?f.emptyScript:"",y=u.reactiveElementPolyfillSupport,v=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&d(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const s=o?.call(this);n?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=o;const s=n.fromAttribute(e,t.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const s=this.constructor;if(!1===o&&(n=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??x)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $=globalThis,k=t=>t,E=$.trustedTypes,P=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+M,C=`<${I}>`,z=document,A=()=>z.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,L="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,W=/-->/g,F=/>/g,R=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,B=/"/g,U=/^(?:script|style|textarea|title)$/i,Z=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),V=Z(1),H=Z(2),j=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),Y=new WeakMap,X=z.createTreeWalker(z,129);function K(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}class G{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,s=0;const r=t.length-1,a=this.parts,[l,d]=((t,e)=>{const i=t.length-1,o=[];let n,s=2===e?"<svg>":3===e?"<math>":"",r=N;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===N?"!--"===l[1]?r=W:void 0!==l[1]?r=F:void 0!==l[2]?(U.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=R):void 0!==l[3]&&(r=R):r===R?">"===l[0]?(r=n??N,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?R:'"'===l[3]?B:O):r===B||r===O?r=R:r===W||r===F?r=N:(r=R,n=void 0);const h=r===R&&t[e+1].startsWith("/>")?" ":"";s+=r===N?i+C:d>=0?(o.push(a),i.slice(0,d)+S+i.slice(d)+M+h):i+M+(-2===d?e:h)}return[K(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]})(t,e);if(this.el=G.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=X.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(S)){const e=d[s++],i=o.getAttribute(t).split(M),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?it:"?"===r[1]?ot:"@"===r[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(M)&&(a.push({type:6,index:n}),o.removeAttribute(t));if(U.test(o.tagName)){const t=o.textContent.split(M),e=t.length-1;if(e>0){o.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],A()),X.nextNode(),a.push({type:2,index:++n});o.append(t[e],A())}}}else if(8===o.nodeType)if(o.data===I)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(M,t+1));)a.push({type:7,index:n}),t+=M.length-1}n++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){if(e===j)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=T(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=J(t,n._$AS(t,e.values),n,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??z).importNode(e,!0);X.currentNode=o;let n=X.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=i[++r]}s!==a?.index&&(n=X.nextNode(),s++)}return X.currentNode=z,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),T(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==j&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&T(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new Q(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new G(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(A()),this.O(A()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,o){const n=this.strings;let s=!1;if(void 0===n)t=J(this,t,e,0),s=!T(t)||t!==this._$AH&&t!==j,s&&(this._$AH=t);else{const o=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=J(this,o[i+r],e,r),a===j&&(a=this._$AH[r]),s||=!T(a)||a!==this._$AH[r],a===q?t=q:t!==q&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class ot extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??q)===j)return;const i=this._$AH,o=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==q&&(i===q||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const rt=$.litHtmlPolyfillSupport;rt?.(G,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let lt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(A(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const dt=at.litElementPolyfillSupport;dt?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:x},ht=(t=ct,e,i)=>{const{kind:o,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,n,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];e.call(this,i),this.requestUpdate(o,n,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};function pt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t){return pt({...t,state:!0,attribute:!1})}
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
function ut(t,e){return(e,i,o)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}const ft=Symbol.for("preact-signals");function _t(){if(xt>1)return void xt--;let t,e=!1;for(;void 0!==vt;){let i=vt;for(vt=void 0,bt++;void 0!==i;){const o=i.o;if(i.o=void 0,i.f&=-3,!(8&i.f)&&Pt(i))try{i.c()}catch(i){e||(t=i,e=!0)}i=o}}if(bt=0,xt--,e)throw t}let yt,vt;function mt(t){const e=yt;yt=void 0;try{return t()}finally{yt=e}}let xt=0,bt=0,wt=0;function $t(t){if(void 0===yt)return;let e=t.n;return void 0===e||e.t!==yt?(e={i:0,S:t,p:yt.s,n:void 0,t:yt,e:void 0,x:void 0,r:e},void 0!==yt.s&&(yt.s.n=e),yt.s=e,t.n=e,32&yt.f&&t.S(e),e):-1===e.i?(e.i=0,void 0!==e.n&&(e.n.p=e.p,void 0!==e.p&&(e.p.n=e.n),e.p=yt.s,e.n=void 0,yt.s.n=e,yt.s=e),e):void 0}function kt(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Et(t,e){return new kt(t,e)}function Pt(t){for(let e=t.s;void 0!==e;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function St(t){for(let e=t.s;void 0!==e;e=e.n){const i=e.S.n;if(void 0!==i&&(e.r=i),e.S.n=e,e.i=-1,void 0===e.n){t.s=e;break}}}function Mt(t){let e,i=t.s;for(;void 0!==i;){const t=i.p;-1===i.i?(i.S.U(i),void 0!==t&&(t.n=i.n),void 0!==i.n&&(i.n.p=t)):e=i,i.S.n=i.r,void 0!==i.r&&(i.r=void 0),i=t}t.s=e}function It(t,e){kt.call(this,void 0),this.x=t,this.s=void 0,this.g=wt-1,this.f=4,this.W=null==e?void 0:e.watched,this.Z=null==e?void 0:e.unwatched,this.name=null==e?void 0:e.name}function Ct(t,e){return new It(t,e)}function zt(t){const e=t.u;if(t.u=void 0,"function"==typeof e){xt++;const i=yt;yt=void 0;try{e()}catch(e){throw t.f&=-2,t.f|=8,At(t),e}finally{yt=i,_t()}}}function At(t){for(let e=t.s;void 0!==e;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,zt(t)}function Tt(t){if(yt!==this)throw new Error("Out-of-order effect");Mt(this),yt=t,this.f&=-2,8&this.f&&At(this),_t()}function Dt(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=null==e?void 0:e.name}function Lt(t,e){const i=new Dt(t,e);try{i.c()}catch(t){throw i.d(),t}const o=i.d.bind(i);return o[Symbol.dispose]=o,o}kt.prototype.brand=ft,kt.prototype.h=function(){return!0},kt.prototype.S=function(t){const e=this.t;e!==t&&void 0===t.e&&(t.x=e,this.t=t,void 0!==e?e.e=t:mt(()=>{var t;null==(t=this.W)||t.call(this)}))},kt.prototype.U=function(t){if(void 0!==this.t){const e=t.e,i=t.x;void 0!==e&&(e.x=i,t.e=void 0),void 0!==i&&(i.e=e,t.x=void 0),t===this.t&&(this.t=i,void 0===i&&mt(()=>{var t;null==(t=this.Z)||t.call(this)}))}},kt.prototype.subscribe=function(t){return Lt(()=>{const e=this.value,i=yt;yt=void 0;try{t(e)}finally{yt=i}},{name:"sub"})},kt.prototype.valueOf=function(){return this.value},kt.prototype.toString=function(){return this.value+""},kt.prototype.toJSON=function(){return this.value},kt.prototype.peek=function(){const t=yt;yt=void 0;try{return this.value}finally{yt=t}},Object.defineProperty(kt.prototype,"value",{get(){const t=$t(this);return void 0!==t&&(t.i=this.i),this.v},set(t){if(t!==this.v){if(bt>100)throw new Error("Cycle detected");this.v=t,this.i++,wt++,xt++;try{for(let t=this.t;void 0!==t;t=t.x)t.t.N()}finally{_t()}}}}),It.prototype=new kt,It.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if(32==(36&this.f))return!0;if(this.f&=-5,this.g===wt)return!0;if(this.g=wt,this.f|=1,this.i>0&&!Pt(this))return this.f&=-2,!0;const t=yt;try{St(this),yt=this;const t=this.x();(16&this.f||this.v!==t||0===this.i)&&(this.v=t,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return yt=t,Mt(this),this.f&=-2,!0},It.prototype.S=function(t){if(void 0===this.t){this.f|=36;for(let t=this.s;void 0!==t;t=t.n)t.S.S(t)}kt.prototype.S.call(this,t)},It.prototype.U=function(t){if(void 0!==this.t&&(kt.prototype.U.call(this,t),void 0===this.t)){this.f&=-33;for(let t=this.s;void 0!==t;t=t.n)t.S.U(t)}},It.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(let t=this.t;void 0!==t;t=t.x)t.t.N()}},Object.defineProperty(It.prototype,"value",{get(){if(1&this.f)throw new Error("Cycle detected");const t=$t(this);if(this.h(),void 0!==t&&(t.i=this.i),16&this.f)throw this.v;return this.v}}),Dt.prototype.c=function(){const t=this.S();try{if(8&this.f)return;if(void 0===this.x)return;const t=this.x();"function"==typeof t&&(this.u=t)}finally{t()}},Dt.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,zt(this),St(this),xt++;const t=yt;return yt=this,Tt.bind(this,t)},Dt.prototype.N=function(){2&this.f||(this.f|=2,this.o=vt,vt=this)},Dt.prototype.d=function(){this.f|=8,1&this.f||At(this)},Dt.prototype.dispose=function(){this.d()},window.__inhabit_signals||(window.__inhabit_signals={currentFloorPlan:Et(null),currentFloor:Et(null),canvasMode:Et("walls"),activeTool:Et("select"),selection:Et({type:"none",ids:[]}),viewBox:Et({x:0,y:0,width:1e3,height:800}),gridSize:Et(10),snapToGrid:Et(!0),showGrid:Et(!0),layers:Et([{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}]),lightPlacements:Et([]),switchPlacements:Et([]),buttonPlacements:Et([]),otherPlacements:Et([]),constraintConflicts:Et(new Map),focusedRoomId:Et(null),occupancyPanelTarget:Et(null),devicePanelTarget:Et(null),mmwavePlacements:Et([]),simulatedTargets:Et([]),simHitboxEnabled:Et(!1),_reloadFloorData:null});const Nt=window.__inhabit_signals,Wt=Nt.currentFloorPlan,Ft=Nt.currentFloor,Rt=Nt.canvasMode,Ot=Nt.activeTool,Bt=Nt.selection,Ut=Nt.viewBox,Zt=Nt.gridSize,Vt=Nt.snapToGrid,Ht=Nt.showGrid,jt=Nt.layers,qt=Nt.lightPlacements,Yt=Nt.switchPlacements,Xt=Nt.buttonPlacements,Kt=Nt.otherPlacements,Gt=Nt.constraintConflicts,Jt=Nt.focusedRoomId,Qt=Nt.occupancyPanelTarget,te=Nt.devicePanelTarget,ee=Nt.mmwavePlacements,ie=Nt.simulatedTargets,oe=Nt.simHitboxEnabled;function ne(t){Rt.value=t,Ot.value="select",Bt.value={type:"none",ids:[]},"occupancy"!==t&&(Qt.value=null,ie.value=[],oe.value=!1),"placement"!==t&&(te.value=null)}async function se(){Nt._reloadFloorData&&await Nt._reloadFloorData()}function re(t){const e=t.vertices;if(0===e.length)return"";const i=e.map((t,e)=>`${0===e?"M":"L"}${t.x},${t.y}`);return i.join(" ")+" Z"}function ae(t,e){const i=e.x-t.x,o=e.y-t.y;return Math.sqrt(i*i+o*o)}function le(t,e){return{x:Math.round(t.x/e)*e,y:Math.round(t.y/e)*e}}function de(t){const e=t.vertices;if(e.length<3)return 0;let i=0;const o=e.length;for(let t=0;t<o;t++){const n=(t+1)%o;i+=e[t].x*e[n].y,i-=e[n].x*e[t].y}return i/2}function ce(t){if(t.length<2)return{anchor:t[0]||{x:0,y:0},dir:{x:1,y:0}};let e=0,i=t[0],o=t[1];for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const r=ae(t[n],t[s]);r>e&&(e=r,i=t[n],o=t[s])}if(e<1e-9)return{anchor:i,dir:{x:1,y:0}};return{anchor:i,dir:{x:(o.x-i.x)/e,y:(o.y-i.y)/e}}}function he(t,e,i){const o=t.x-e.x,n=t.y-e.y,s=o*i.x+n*i.y;return{x:e.x+s*i.x,y:e.y+s*i.y}}const pe=.05,ge=.2,ue="undefined"!=typeof localStorage&&"1"===localStorage.getItem("inhabit_debug_solver"),fe="%c[constraint]",_e="color:#8b5cf6;font-weight:bold",ye="color:#888",ve="color:#ef4444;font-weight:bold",me="color:#22c55e;font-weight:bold";function xe(t){return`(${t.x.toFixed(1)},${t.y.toFixed(1)})`}function be(t,e){const i=e.get(t.start_node),o=e.get(t.end_node),n=[];"free"!==t.direction&&n.push(t.direction),t.length_locked&&n.push("len🔒"),t.angle_group&&n.push(`ang:${t.angle_group.slice(0,4)}`);const s=n.length>0?` [${n.join(",")}]`:"",r=i&&o?ae(i,o).toFixed(1):"?";return`${t.id.slice(0,8)}… (${r}cm${s})`}function we(t){return t.slice(0,8)+"…"}function $e(t,e){const i=new Map,o=new Map,n=new Map;for(const e of t)i.set(e.id,e);for(const t of e)o.set(t.id,t),n.has(t.start_node)||n.set(t.start_node,[]),n.get(t.start_node).push({edgeId:t.id,endpoint:"start"}),n.has(t.end_node)||n.set(t.end_node,[]),n.get(t.end_node).push({edgeId:t.id,endpoint:"end"});return{nodes:i,edges:o,nodeToEdges:n}}function ke(t){return"free"!==t.direction||t.length_locked}function Ee(t){const e=new Map;for(const[i,o]of t.nodes)e.set(i,{x:o.x,y:o.y});return e}function Pe(t,e,i,o,n){let s={x:o.x,y:o.y};if("horizontal"===t.direction?s={x:s.x,y:i.y}:"vertical"===t.direction&&(s={x:i.x,y:s.y}),t.length_locked){const e=ae(n.nodes.get(t.start_node),n.nodes.get(t.end_node)),o=s.x-i.x,r=s.y-i.y,a=Math.sqrt(o*o+r*r);if(a>0&&e>0){const t=e/a;s={x:i.x+o*t,y:i.y+r*t}}}return s}function Se(t,e,i,o,n){const s=o.has(t.start_node),r=o.has(t.end_node);if(s&&r)return{idealStart:e,idealEnd:i};if(s){return{idealStart:e,idealEnd:Pe(t,t.start_node,e,i,n)}}if(r){return{idealStart:Pe(t,t.end_node,i,e,n),idealEnd:i}}return function(t,e,i,o){const n=ae(o.nodes.get(t.start_node),o.nodes.get(t.end_node));let s={x:e.x,y:e.y},r={x:i.x,y:i.y};if("horizontal"===t.direction){const t=(s.y+r.y)/2;s={x:s.x,y:t},r={x:r.x,y:t}}else if("vertical"===t.direction){const t=(s.x+r.x)/2;s={x:t,y:s.y},r={x:t,y:r.y}}if(t.length_locked){const t=(s.x+r.x)/2,e=(s.y+r.y)/2,i=r.x-s.x,o=r.y-s.y,a=Math.sqrt(i*i+o*o);if(a>0&&n>0){const l=n/2/(a/2);s={x:t-i/2*l,y:e-o/2*l},r={x:t+i/2*l,y:e+o/2*l}}}return{idealStart:s,idealEnd:r}}(t,e,i,n)}function Me(t,e){let i=0;const o=[],n=new Map;for(const[s,r]of t.edges){if(!ke(r))continue;const a=e.get(r.start_node),l=e.get(r.end_node);if(!a||!l)continue;let d=0;if("horizontal"===r.direction?d=Math.max(d,Math.abs(a.y-l.y)):"vertical"===r.direction&&(d=Math.max(d,Math.abs(a.x-l.x))),r.length_locked){const e=ae(t.nodes.get(r.start_node),t.nodes.get(r.end_node)),i=ae(a,l);d=Math.max(d,Math.abs(i-e))}n.set(s,d),d>ge&&o.push(s),d>i&&(i=d)}const s=Ce(t,e);for(const[,r]of s){let s=0;for(const t of r.nodeIds){const i=e.get(t);if(!i)continue;const o=ae(i,he(i,r.anchor,r.dir));s=Math.max(s,o)}for(const[e,i]of t.edges)if(i.collinear_group&&r.nodeIds.has(i.start_node)){const t=n.get(e)??0;n.set(e,Math.max(t,s)),s>ge&&(o.includes(e)||o.push(e));break}i=Math.max(i,s)}const r=ze(t);for(const[,s]of r){const r=e.get(s.sharedNodeId);if(!r)continue;let a=0;for(let i=0;i<s.edgeIds.length;i++){const o=t.edges.get(s.edgeIds[i]),n=o.start_node===s.sharedNodeId?o.end_node:o.start_node,l=e.get(n);if(!l)continue;let d=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[i];for(;d>Math.PI;)d-=2*Math.PI;for(;d<-Math.PI;)d+=2*Math.PI;const c=ae(r,l);for(let o=i+1;o<s.edgeIds.length;o++){const i=t.edges.get(s.edgeIds[o]),n=i.start_node===s.sharedNodeId?i.end_node:i.start_node,l=e.get(n);if(!l)continue;let h=Math.atan2(l.y-r.y,l.x-r.x)-s.originalAngles[o];for(;h>Math.PI;)h-=2*Math.PI;for(;h<-Math.PI;)h+=2*Math.PI;let p=d-h;for(;p>Math.PI;)p-=2*Math.PI;for(;p<-Math.PI;)p+=2*Math.PI;const g=(c+ae(r,l))/2;a=Math.max(a,Math.abs(p)*g)}}const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>ge&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}const a=Te(t);for(const[,s]of a){const r=[];for(const i of s.edgeIds){const o=t.edges.get(i),n=e.get(o.start_node),s=e.get(o.end_node);n&&s?r.push(ae(n,s)):r.push(0)}let a=0;for(const t of r)a=Math.max(a,Math.abs(t-s.targetLength));const l=n.get(s.edgeIds[0])??0;n.set(s.edgeIds[0],Math.max(l,a)),a>ge&&(o.includes(s.edgeIds[0])||o.push(s.edgeIds[0]),i=Math.max(i,a))}return{maxViolation:i,violatingEdgeIds:o,magnitudes:n}}function Ie(t,e,i,o){const n=function(t,e){const i=[],o=new Set,n=new Set,s=[];for(const t of e)s.push(t),n.add(t);for(;s.length>0;){const e=s.shift(),r=t.nodeToEdges.get(e)||[];for(const{edgeId:a}of r){if(o.has(a))continue;o.add(a);const r=t.edges.get(a);if(!r)continue;i.push(r);const l=r.start_node===e?r.end_node:r.start_node;n.has(l)||(n.add(l),s.push(l))}}return i}(t,e),s=n.filter(ke),r=Ce(t,i),a=ze(t),l=Te(t);let d=0,c=0;ue&&(console.groupCollapsed(fe+" solveIterative: %c%d constrained edges, %d pinned nodes",_e,ye,s.length,e.size),console.log("  Pinned nodes:",[...e].map(we).join(", ")||"(none)"),console.log("  Constrained edges:",s.map(e=>be(e,t.nodes)).join(" | ")||"(none)"),o&&o.size>0&&console.log("  Pre-existing violations:",[...o.entries()].map(([e,i])=>{const o=t.edges.get(e);return(o?be(o,t.nodes):e.slice(0,8)+"…")+` (${i.toFixed(2)})`}).join(" | ")));for(let o=0;o<100;o++){d=0,c=o+1;const s=0===o?new Set(e):e;for(const r of n){if(!ke(r))continue;const n=i.get(r.start_node),a=i.get(r.end_node);if(!n||!a)continue;const{idealStart:l,idealEnd:c}=Se(r,n,a,s,t);if(!e.has(r.start_node)){const t=Math.max(Math.abs(l.x-n.x),Math.abs(l.y-n.y));d=Math.max(d,t),i.set(r.start_node,l)}if(!e.has(r.end_node)){const t=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y));d=Math.max(d,t),i.set(r.end_node,c)}0===o&&(s.add(r.start_node),s.add(r.end_node))}for(const[,t]of r)for(const o of t.nodeIds){if(e.has(o))continue;const n=i.get(o);if(!n)continue;const s=he(n,t.anchor,t.dir),r=Math.max(Math.abs(s.x-n.x),Math.abs(s.y-n.y));r>pe&&(d=Math.max(d,r),i.set(o,s))}const h=Ae(t,a,e,i);d=Math.max(d,h);const p=De(t,l,e,i);if(d=Math.max(d,p),d<pe)break}const h=[];for(const[e,o]of i){const i=t.nodes.get(e);(Math.abs(o.x-i.x)>pe||Math.abs(o.y-i.y)>pe)&&h.push({nodeId:e,x:o.x,y:o.y})}if(d<pe)ue&&console.log(fe+" %cConverged%c in %d iteration(s), %d node(s) moved",_e,me,"",c,h.length);else{const{violatingEdgeIds:e,maxViolation:n,magnitudes:s}=Me(t,i),r=[];for(const t of e)if(o){const e=o.get(t);if(void 0===e)r.push(t);else{(s.get(t)??0)>e+pe&&r.push(t)}}else r.push(t);if(r.length>0)return ue&&(console.log(`${fe} %cBLOCKED%c — ${c} iterations, maxDelta=${d.toFixed(3)}, maxViolation=${n.toFixed(3)}`,_e,ve,""),console.log("  All violating edges:",e.map(e=>{const i=t.edges.get(e);return i?be(i,t.nodes):e.slice(0,8)+"…"}).join(" | ")),console.log("  NEW violations (blocking):",r.map(e=>{const o=t.edges.get(e);if(!o)return e.slice(0,8)+"…";const n=i.get(o.start_node),s=i.get(o.end_node),r=n&&s?` now ${xe(n)}→${xe(s)}`:"";return be(o,t.nodes)+r}).join(" | ")),console.groupEnd()),{updates:h,blocked:!0,blockedBy:r};ue&&console.log(`${fe} %cDID NOT CONVERGE%c but no new violations — ${c} iters, maxDelta=${d.toFixed(3)}`,_e,"color:#f59e0b;font-weight:bold","")}return ue&&console.groupEnd(),{updates:h,blocked:!1}}function Ce(t,e){const i=new Map,o=new Map;for(const[,e]of t.edges){if(!e.collinear_group)continue;o.has(e.collinear_group)||o.set(e.collinear_group,new Set);const t=o.get(e.collinear_group);t.add(e.start_node),t.add(e.end_node)}for(const[t,n]of o){const o=[];for(const t of n){const i=e.get(t);i&&o.push(i)}if(o.length<2)continue;const{anchor:s,dir:r}=ce(o);i.set(t,{nodeIds:n,anchor:s,dir:r})}return i}function ze(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.angle_group&&(i.has(e.angle_group)||i.set(e.angle_group,[]),i.get(e.angle_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;const i=n.map(e=>t.edges.get(e)),s=new Map;for(const t of i)s.set(t.start_node,(s.get(t.start_node)??0)+1),s.set(t.end_node,(s.get(t.end_node)??0)+1);let r=null;for(const[t,e]of s)if(e===n.length){r=t;break}if(!r)continue;const a=t.nodes.get(r);if(!a)continue;const l=[];let d=!0;for(const e of i){const i=e.start_node===r?e.end_node:e.start_node,o=t.nodes.get(i);if(!o){d=!1;break}l.push(Math.atan2(o.y-a.y,o.x-a.x))}d&&e.set(o,{edgeIds:n,sharedNodeId:r,originalAngles:l})}return e}function Ae(t,e,i,o){let n=0;for(const[,s]of e){const e=o.get(s.sharedNodeId);if(!e)continue;const r=s.edgeIds.length,a=[],l=[],d=[];let c=!0;for(let i=0;i<r;i++){const n=t.edges.get(s.edgeIds[i]),r=n.start_node===s.sharedNodeId?n.end_node:n.start_node,h=o.get(r);if(!h){c=!1;break}a.push(r),l.push(h),d.push(Math.atan2(h.y-e.y,h.x-e.x))}if(!c)continue;const h=[];for(let t=0;t<r;t++){let e=d[t]-s.originalAngles[t];for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;h.push(e)}const p=a.map(t=>i.has(t)),g=p.filter(Boolean).length;if(g===r)continue;let u=0,f=0;if(g>0)for(let t=0;t<r;t++)p[t]&&(u+=Math.sin(h[t]),f+=Math.cos(h[t]));else for(let t=0;t<r;t++)u+=Math.sin(h[t]),f+=Math.cos(h[t]);const _=Math.atan2(u,f);for(let t=0;t<r;t++){if(p[t])continue;const i=s.originalAngles[t]+_,r=ae(e,l[t]),d={x:e.x+Math.cos(i)*r,y:e.y+Math.sin(i)*r},c=Math.max(Math.abs(d.x-l[t].x),Math.abs(d.y-l[t].y));n=Math.max(n,c),o.set(a[t],d)}}return n}function Te(t){const e=new Map,i=new Map;for(const[,e]of t.edges)e.link_group&&(i.has(e.link_group)||i.set(e.link_group,[]),i.get(e.link_group).push(e.id));for(const[o,n]of i){if(n.length<2)continue;let i=0;for(const e of n){const o=t.edges.get(e);i+=ae(t.nodes.get(o.start_node),t.nodes.get(o.end_node))}e.set(o,{edgeIds:n,targetLength:i/n.length})}return e}function De(t,e,i,o){let n=0;for(const[,s]of e)for(const e of s.edgeIds){const r=t.edges.get(e),a=o.get(r.start_node),l=o.get(r.end_node);if(!a||!l)continue;const d=ae(a,l);if(0===d)continue;if(Math.abs(d-s.targetLength)<=pe)continue;const c=i.has(r.start_node),h=i.has(r.end_node);if(c&&h)continue;const p=l.x-a.x,g=l.y-a.y,u=s.targetLength/d;if(c){const t={x:a.x+p*u,y:a.y+g*u},e=Math.max(Math.abs(t.x-l.x),Math.abs(t.y-l.y));n=Math.max(n,e),o.set(r.end_node,t)}else if(h){const t={x:l.x-p*u,y:l.y-g*u},e=Math.max(Math.abs(t.x-a.x),Math.abs(t.y-a.y));n=Math.max(n,e),o.set(r.start_node,t)}else{const t=(a.x+l.x)/2,e=(a.y+l.y)/2,i=s.targetLength/2/(d/2),c={x:t-p/2*i,y:e-g/2*i},h={x:t+p/2*i,y:e+g/2*i},u=Math.max(Math.abs(c.x-a.x),Math.abs(c.y-a.y),Math.abs(h.x-l.x),Math.abs(h.y-l.y));n=Math.max(n,u),o.set(r.start_node,c),o.set(r.end_node,h)}}return n}function Le(t,e,i,o){let n=i,s=o;const r=function(t,e){const i=t.nodeToEdges.get(e);if(!i)return null;for(const{edgeId:e}of i){const i=t.edges.get(e);if(i?.collinear_group)return i.collinear_group}return null}(t,e);if(r){const e=function(t,e){const i=new Set;for(const[,o]of t.edges)o.collinear_group===e&&(i.add(o.start_node),i.add(o.end_node));return i}(t,r),a=[];for(const i of e){const e=t.nodes.get(i);e&&a.push({x:e.x,y:e.y})}if(a.length>=2){const{anchor:t,dir:e}=ce(a),r=he({x:i,y:o},t,e);n=r.x,s=r.y}}const a=Ee(t),{magnitudes:l}=Me(t,a),d=Ee(t);d.set(e,{x:n,y:s});const c=new Set([e]);for(const[i,o]of t.nodes)o.pinned&&i!==e&&c.add(i);const h=Ie(t,c,d,l),p=h.updates.some(t=>t.nodeId===e);if(!p){const i=t.nodes.get(e);i.x===n&&i.y===s||h.updates.unshift({nodeId:e,x:n,y:s})}const g=h.updates.find(t=>t.nodeId===e);if(g&&(g.x=n,g.y=s),h.updates=h.updates.filter(i=>i.nodeId===e||!t.nodes.get(i.nodeId)?.pinned),!h.blocked){const{violatingEdgeIds:e,magnitudes:i}=Me(t,d),o=[];for(const t of e){const e=l.get(t);if(void 0===e)o.push(t);else{(i.get(t)??0)>e+pe&&o.push(t)}}o.length>0&&(h.blocked=!0,h.blockedBy=o)}return h}function Ne(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};if(ue&&console.log(fe+" solveEdgeLengthChange: %c%s → %scm",_e,ye,be(o,t.nodes),i.toFixed(1)),o.length_locked)return ue&&console.log(fe+" %c→ BLOCKED: edge is length-locked",_e,ve),{updates:[],blocked:!0,blockedBy:[o.id]};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);if(!n||!s)return{updates:[],blocked:!1};if(0===ae(n,s))return{updates:[],blocked:!1};const r=(n.x+s.x)/2,a=(n.y+s.y)/2,l=function(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return Math.atan2(o.y-i.y,o.x-i.x)}(o,t.nodes),d=i/2,c={x:r-Math.cos(l)*d,y:a-Math.sin(l)*d},h={x:r+Math.cos(l)*d,y:a+Math.sin(l)*d},p=Ee(t);p.set(o.start_node,c),p.set(o.end_node,h);const g=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&g.add(e);const u=Ie(t,g,p);return u.updates.some(t=>t.nodeId===o.start_node)||u.updates.unshift({nodeId:o.start_node,x:c.x,y:c.y}),u.updates.some(t=>t.nodeId===o.end_node)||u.updates.push({nodeId:o.end_node,x:h.x,y:h.y}),u.updates=u.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),u.blocked=!1,delete u.blockedBy,u}function We(t){const e=new Map;for(const i of t)e.set(i.nodeId,{x:i.x,y:i.y});return e}function Fe(t,e,i,o,n){const s=Le($e(t,e),i,o,n);return{positions:We(s.updates),blocked:s.blocked,blockedBy:s.blockedBy}}function Re(t,e,i){const o=t.edges.get(e);if(!o)return{updates:[],blocked:!1};const n=t.nodes.get(o.start_node),s=t.nodes.get(o.end_node);ue&&(console.group(fe+" solveConstraintSnap: %csnap %s → %s",_e,ye,be(o,t.nodes),i),console.log(`  Nodes: ${we(o.start_node)} ${xe(n)} → ${we(o.end_node)} ${xe(s)}`));const r=function(t,e,i){if("free"===e)return null;const o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=ae(o,n)/2;if("horizontal"===e){if(Math.round(o.y)===Math.round(n.y))return null;const e=o.x<=n.x;return{nodeUpdates:[{nodeId:t.start_node,x:e?s-a:s+a,y:r},{nodeId:t.end_node,x:e?s+a:s-a,y:r}]}}if("vertical"===e){if(Math.round(o.x)===Math.round(n.x))return null;const e=o.y<=n.y;return{nodeUpdates:[{nodeId:t.start_node,x:s,y:e?r-a:r+a},{nodeId:t.end_node,x:s,y:e?r+a:r-a}]}}return null}(o,i,t.nodes);if(!r)return ue&&(console.log(fe+" %cAlready satisfies %s — no-op",_e,me,i),console.groupEnd()),{updates:[],blocked:!1};const a=Ee(t),{magnitudes:l}=Me(t,a),d=r.nodeUpdates.find(t=>t.nodeId===o.start_node),c=r.nodeUpdates.find(t=>t.nodeId===o.end_node);ue&&console.log(`  Snap target: ${we(o.start_node)} ${xe(d)} → ${we(o.end_node)} ${xe(c)}`);const h=Ee(t);h.set(o.start_node,{x:d.x,y:d.y}),h.set(o.end_node,{x:c.x,y:c.y});const p=new Set([o.start_node,o.end_node]);for(const[e,i]of t.nodes)i.pinned&&p.add(e);const g=Ie(t,p,h,l);return g.updates.some(t=>t.nodeId===o.start_node)||g.updates.unshift({nodeId:o.start_node,x:d.x,y:d.y}),g.updates.some(t=>t.nodeId===o.end_node)||g.updates.push({nodeId:o.end_node,x:c.x,y:c.y}),g.updates=g.updates.filter(e=>e.nodeId===o.start_node||e.nodeId===o.end_node||!t.nodes.get(e.nodeId)?.pinned),ue&&(g.blocked?console.log(fe+" %c→ SNAP BLOCKED by: %s",_e,ve,(g.blockedBy||[]).map(e=>{const i=t.edges.get(e);return i?be(i,t.nodes):e.slice(0,8)+"…"}).join(" | ")):console.log(fe+" %c→ Snap OK%c, %d node(s) to update",_e,me,"",g.updates.length),console.groupEnd()),g}function Oe(t,e,i=.2){const o=new Map;for(const e of t)o.set(e.id,e);const n=[];for(const t of e){const e=o.get(t.start_node),s=o.get(t.end_node);if(e&&s)if("horizontal"===t.direction){const o=Math.abs(e.y-s.y);o>i&&n.push({edgeId:t.id,type:"direction",expected:0,actual:o})}else if("vertical"===t.direction){const o=Math.abs(e.x-s.x);o>i&&n.push({edgeId:t.id,type:"direction",expected:0,actual:o})}}const s=new Map,r=new Map;for(const t of e)t.collinear_group&&(s.has(t.collinear_group)||(s.set(t.collinear_group,new Set),r.set(t.collinear_group,t.id)),s.get(t.collinear_group).add(t.start_node),s.get(t.collinear_group).add(t.end_node));for(const[t,e]of s){const s=[];for(const t of e){const e=o.get(t);e&&s.push({x:e.x,y:e.y})}if(s.length<2)continue;const{anchor:a,dir:l}=ce(s);let d=0;for(const t of s){const e=he(t,a,l);d=Math.max(d,ae(t,e))}d>i&&n.push({edgeId:r.get(t),type:"collinear",expected:0,actual:d})}const a=new Map;for(const t of e)t.link_group&&(a.has(t.link_group)||a.set(t.link_group,[]),a.get(t.link_group).push(t.id));for(const[,t]of a){if(t.length<2)continue;const s=[];for(const i of t){const t=e.find(t=>t.id===i),n=o.get(t.start_node),r=o.get(t.end_node);n&&r?s.push(ae(n,r)):s.push(0)}const r=s.reduce((t,e)=>t+e,0)/s.length;let a=0;for(const t of s)a=Math.max(a,Math.abs(t-r));a>i&&n.push({edgeId:t[0],type:"link_group",expected:r,actual:a})}return n}function Be(t){const e=new Map;for(const i of t)e.set(i.id,i);return e}function Ue(t,e){const i=e.get(t.start_node),o=e.get(t.end_node);return i&&o?{...t,startPos:{x:i.x,y:i.y},endPos:{x:o.x,y:o.y}}:null}function Ze(t){const e=Be(t.nodes),i=[];for(const o of t.edges){const t=Ue(o,e);t&&i.push(t)}return i}function Ve(t,e){return e.filter(e=>e.start_node===t||e.end_node===t)}function He(t,e,i){let o=null,n=i;for(const i of e){const e=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);e<n&&(n=e,o=i)}return o}function je(t){let e=0;const i=t.length;for(let o=0;o<i;o++){const n=(o+1)%i;e+=t[o].x*t[n].y,e-=t[n].x*t[o].y}return e/2}function qe(t){const e=t.length;if(e<3){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}let i=0,o=0,n=0;for(let s=0;s<e;s++){const r=(s+1)%e,a=t[s].x*t[r].y-t[r].x*t[s].y;i+=a,o+=(t[s].x+t[r].x)*a,n+=(t[s].y+t[r].y)*a}if(i/=2,Math.abs(i)<1e-6){let i=0,o=0;for(const e of t)i+=e.x,o+=e.y;return{x:i/e,y:o/e}}const s=1/(6*i);return{x:o*s,y:n*s}}const Ye=Et([]),Xe=Et([]),Ke=Et(!1),Ge=Ct(()=>Ye.value.length>0&&!Ke.value),Je=Ct(()=>Xe.value.length>0&&!Ke.value);function Qe(t){Ye.value=[...Ye.value.slice(-99),t],Xe.value=[]}async function ti(){const t=Ye.value;if(0===t.length||Ke.value)return;const e=t[t.length-1];Ke.value=!0;try{await e.undo()}finally{Ke.value=!1}Ye.value=t.slice(0,-1),Xe.value=[...Xe.value,e]}async function ei(){const t=Xe.value;if(0===t.length||Ke.value)return;const e=t[t.length-1];Ke.value=!0;try{await e.redo()}finally{Ke.value=!1}Xe.value=t.slice(0,-1),Ye.value=[...Ye.value,e]}function ii(){Ye.value=[],Xe.value=[]}class oi extends lt{constructor(){super(...arguments),this.domains=[],this.exclude=[],this.excludeDomains=[],this.multi=!1,this.title="Select Entity",this.placeholder="Search entities...",this._search="",this._staged=new Set}static{this.styles=r`
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
  `}firstUpdated(){requestAnimationFrame(()=>this._input?.focus())}_getIcon(t){if(t.startsWith("binary_sensor.")){const e=this.hass?.states[t],i=e?.attributes?.device_class??"";return"motion"===i?"mdi:motion-sensor":"occupancy"===i?"mdi:account-eye":"door"===i?"mdi:door":"window"===i?"mdi:window-closed":"presence"===i?"mdi:account-eye":"mdi:checkbox-blank-circle-outline"}return t.startsWith("event.")?"mdi:bell-ring":t.startsWith("button.")||t.startsWith("input_button.")?"mdi:gesture-tap-button":t.startsWith("switch.")||t.startsWith("input_boolean.")?"mdi:toggle-switch":t.startsWith("light.")?"mdi:lightbulb":t.startsWith("sensor.")?"mdi:eye":"mdi:ray-vertex"}_scoreMatch(t,e){if(0===e.length)return 1;const i=t.friendly_name.toLowerCase(),o=t.entity_id.toLowerCase();let n=0;for(const t of e){const e=i.indexOf(t),s=o.indexOf(t);if(-1===e&&-1===s)return-1;0===e||e>0&&" "===i[e-1]?n+=3:e>=0&&(n+=2),0===s||s>0&&("."===o[s-1]||"_"===o[s-1])?n+=3:s>=0&&(n+=1)}return n}_getFilteredEntities(){if(!this.hass)return[];const t=new Set(this.exclude),e=new Set(this.domains),i=new Set(this.excludeDomains),o=this._search.toLowerCase().split(/\s+/).filter(Boolean),n=[];for(const s of Object.keys(this.hass.states)){if(t.has(s))continue;const r=s.split(".")[0];if(e.size>0&&!e.has(r))continue;if(i.size>0&&i.has(r))continue;const a={entity_id:s,friendly_name:String(this.hass.states[s].attributes?.friendly_name??s),domain:r},l=this._scoreMatch(a,o);l>=0&&n.push({...a,score:l})}return n.sort((t,e)=>{if(this.multi){const i=this._staged.has(t.entity_id)?1:0,o=this._staged.has(e.entity_id)?1:0;if(i!==o)return o-i}return e.score-t.score||t.friendly_name.localeCompare(e.friendly_name)}),n.slice(0,50)}_toggleStaged(t){const e=new Set(this._staged);e.has(t)?e.delete(t):e.add(t),this._staged=e}_onItemClick(t){this.multi?this._toggleStaged(t):this._confirm([t])}_confirm(t){this.dispatchEvent(new CustomEvent("entities-confirmed",{detail:{entityIds:t},bubbles:!0,composed:!0})),this._close()}_close(){this._search="",this._staged=new Set,this.dispatchEvent(new CustomEvent("picker-closed",{bubbles:!0,composed:!0}))}_onOverlayClick(t){t.target.classList.contains("overlay")&&this._close()}render(){const t=this._getFilteredEntities(),e=this._staged.size;return V`
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
            ${t.length>0?t.map(t=>{const e=this._staged.has(t.entity_id);return V`
                <button
                  class="result-item ${e?"selected":""}"
                  @click=${()=>this._onItemClick(t.entity_id)}
                >
                  ${this.multi?V`
                    <div class="check">
                      ${e?V`<span class="check-mark">✓</span>`:q}
                    </div>
                  `:V`
                    <ha-icon icon=${this._getIcon(t.entity_id)} style="--mdc-icon-size: 18px;"></ha-icon>
                  `}
                  <div class="text">
                    <span class="name">${t.friendly_name}</span>
                    <span class="eid">${t.entity_id}</span>
                  </div>
                </button>
              `}):V`
              <div class="empty-state">
                ${this._search?"No matching entities":"No entities available"}
              </div>
            `}
          </div>

          ${this.multi?V`
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
          `:q}
        </div>
      </div>
    `}}t([pt({attribute:!1})],oi.prototype,"hass",void 0),t([pt({type:Array})],oi.prototype,"domains",void 0),t([pt({type:Array})],oi.prototype,"exclude",void 0),t([pt({type:Array})],oi.prototype,"excludeDomains",void 0),t([pt({type:Boolean})],oi.prototype,"multi",void 0),t([pt({type:String})],oi.prototype,"title",void 0),t([pt({type:String})],oi.prototype,"placeholder",void 0),t([gt()],oi.prototype,"_search",void 0),t([gt()],oi.prototype,"_staged",void 0),t([ut(".search-input")],oi.prototype,"_input",void 0),customElements.define("fpb-entity-picker",oi);const ni=85*Math.PI/180;function si(t,e,i,o,n,s){const r=n*Math.PI/180,a=s?1:-1,l=Math.cos(r),d=a*Math.sin(r),c=i-t,h=o-e,p=t+l*c-d*h,g=e+d*c+l*h,u=p-t,f=g-e,_=a*(4/3)*Math.tan(r/4);return{ox:p,oy:g,cp1x:i-_*h,cp1y:o+_*c,cp2x:p+_*f,cp2y:g-_*u}}const ri=["#e91e63","#9c27b0","#3f51b5","#00bcd4","#4caf50","#ff9800","#795548","#607d8b","#f44336","#673ab7"];function ai(t){let e=0;for(let i=0;i<t.length;i++)e=(e<<5)-e+t.charCodeAt(i);return ri[Math.abs(e)%ri.length]}class li extends lt{constructor(){super(...arguments),this._viewBox={x:0,y:0,width:1e3,height:800},this._isPanning=!1,this._spaceHeld=!1,this._panStart={x:0,y:0},this._activePointers=new Map,this._pinchStartDist=0,this._pinchStartMid={x:0,y:0},this._pinchStartViewBox=null,this._cursorPos={x:0,y:0},this._wallStartPoint=null,this._wallChainStart=null,this._roomEditor=null,this._haAreas=[],this._iconCache=new Map,this._iconLoaders=new Map,this._stateIconCache=new Map,this._stateIconLoaders=new Map,this._hoveredNode=null,this._draggingNode=null,this._nodeEditor=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._editingTotalLength="",this._editingLength="",this._editingLengthLocked=!1,this._editingDirection="free",this._editingOpeningParts="single",this._editingOpeningType="swing",this._editingSwingDirection="left",this._editingEntityId=null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1,this._blinkingEdgeIds=[],this._blinkTimer=null,this._swingAngles=new Map,this._swingRaf=null,this._focusedRoomId=null,this._viewBoxAnimation=null,this._pendingDevice=null,this._showEntityPickerModal=!1,this._longPressTimer=null,this._longPressTriggered=!1,this._viewingPointerStart=null,this._viewingClickedDevice=null,this._openingPreview=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,this._zoneEditor=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave=null,this._draggingSimTarget=null,this._simMoveThrottle=null,this._canvasMode="walls",this._lastFittedFloorId=null,this._cleanupEffects=[]}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._lastFittedFloorId=null,this._cleanupEffects.push(Lt(()=>{this._viewBox=Ut.value}),Lt(()=>{const t=Rt.value,e=this._canvasMode;this._canvasMode=t,"occupancy"===e&&"occupancy"!==t&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Lt(()=>{!oe.value&&this.hass&&this.hass.callWS({type:"inhabit/simulate/target/clear"}).catch(()=>{})}),Lt(()=>{const t=Ft.value;t&&t.id!==this._lastFittedFloorId&&(this._lastFittedFloorId=t.id,requestAnimationFrame(()=>this._fitToFloor(t)))}),Lt(()=>{const t=Jt.value,e=this._focusedRoomId;this._focusedRoomId=t,t&&"__reset__"!==t?requestAnimationFrame(()=>this._animateToRoom(t)):null!==e&&requestAnimationFrame(()=>this._animateToFloor())})),this._loadHaAreas(),this._onSpaceDown=t=>{"Space"!==t.code||t.repeat||t.target instanceof HTMLInputElement||t.target instanceof HTMLTextAreaElement||(t.preventDefault(),this._spaceHeld=!0)},this._onSpaceUp=t=>{"Space"===t.code&&(this._spaceHeld=!1,this._isPanning&&(this._isPanning=!1))},window.addEventListener("keydown",this._onSpaceDown),window.addEventListener("keyup",this._onSpaceUp),this._resizeObserver=new ResizeObserver(()=>{const t=Ft.value;t&&this._fitToFloor(t)}),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._cancelViewBoxAnimation(),null!==this._swingRaf&&(cancelAnimationFrame(this._swingRaf),this._swingRaf=null),null!==this._blinkTimer&&(clearTimeout(this._blinkTimer),this._blinkTimer=null),this._onSpaceDown&&window.removeEventListener("keydown",this._onSpaceDown),this._onSpaceUp&&window.removeEventListener("keyup",this._onSpaceUp),this._spaceHeld=!1,this._resizeObserver?.disconnect(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}_handleWheel(t){t.preventDefault(),this._cancelViewBoxAnimation();const e=t.deltaY>0?1.1:.9,i=this._screenToSvg({x:t.clientX,y:t.clientY}),o=this._viewBox.width*e,n=this._viewBox.height*e;if(o<100||o>1e4)return;const s={x:i.x-(i.x-this._viewBox.x)*e,y:i.y-(i.y-this._viewBox.y)*e,width:o,height:n};Ut.value=s,this._viewBox=s}_handlePointerDown(t){if(this._activePointers.set(t.pointerId,{x:t.clientX,y:t.clientY}),2===this._activePointers.size){this._isPanning&&(this._isPanning=!1);const[e,i]=[...this._activePointers.values()],o=i.x-e.x,n=i.y-e.y;return this._pinchStartDist=Math.sqrt(o*o+n*n),this._pinchStartMid={x:(e.x+i.x)/2,y:(e.y+i.y)/2},this._pinchStartViewBox={...this._viewBox},this._cancelViewBoxAnimation(),void this._svg?.setPointerCapture(t.pointerId)}const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ot.value,o=this._getSnappedPoint(e,"light"===i||"switch"===i||"button"===i||"other"===i||"mmwave"===i||"wall"===i||"zone"===i),n=this._canvasMode;if(this._pendingDevice&&"light"!==Ot.value&&"switch"!==Ot.value&&"button"!==Ot.value&&"other"!==Ot.value&&(this._pendingDevice=null,this._showEntityPickerModal=!1),1===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if(this._spaceHeld&&0===t.button)return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId);if("viewing"===n&&0===t.button){const i=Ft.value;if(i){const o=this._hitTestDevice(e,i);if(o)return this._viewingClickedDevice=o,this._viewingPointerStart={x:t.clientX,y:t.clientY},this._longPressTriggered=!1,this._longPressTimer=setTimeout(()=>{this._longPressTriggered=!0,o.entityId&&this._openEntityDetails(o.entityId)},500),void this._svg?.setPointerCapture(t.pointerId)}return this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},void this._svg?.setPointerCapture(t.pointerId)}if("occupancy"===n&&oe.value&&(0===t.button||2===t.button)){const i=ie.value,o=this._viewBox,n=.015*Math.max(o.width,o.height),s=i.find(t=>{const i=t.position.x-e.x,o=t.position.y-e.y;return Math.sqrt(i*i+o*o)<n});if(2===t.button&&s)return void this._removeSimulatedTarget(s.id);if(0===t.button&&s)return this._draggingSimTarget={targetId:s.id,pointerId:t.pointerId},void this._svg?.setPointerCapture(t.pointerId);if(0===t.button)return void this._addSimulatedTarget(e)}if(0===t.button)if("select"===i){const i=!!this._edgeEditor||!!this._multiEdgeEditor;this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null;if(this._handleSelectClick(e,t.shiftKey)){if("zone"===Bt.value.type&&1===Bt.value.ids.length){const i=Ft.value,o=i?.zones?.find(t=>t.id===Bt.value.ids[0]);o?.polygon?.vertices&&(this._draggingZone={zone:o,startPoint:e,originalVertices:o.polygon.vertices.map(t=>({x:t.x,y:t.y})),hasMoved:!1,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId))}else if(("light"===Bt.value.type||"switch"===Bt.value.type||"button"===Bt.value.type||"other"===Bt.value.type||"mmwave"===Bt.value.type)&&1===Bt.value.ids.length){const i=Bt.value.type,o=Bt.value.ids[0];let n=null;n="light"===i?qt.value.find(t=>t.id===o)?.position??null:"switch"===i?Yt.value.find(t=>t.id===o)?.position??null:"button"===i?Xt.value.find(t=>t.id===o)?.position??null:"other"===i?Kt.value.find(t=>t.id===o)?.position??null:ee.value.find(t=>t.id===o)?.position??null,n&&(this._draggingPlacement={type:i,id:o,startPoint:e,originalPosition:{...n},hasMoved:!1,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId))}}else i&&(Bt.value={type:"none",ids:[]}),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId)}else if("wall"===i){this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null;const e=this._wallStartPoint&&t.shiftKey?this._cursorPos:o;this._handleWallClick(e,t.shiftKey)}else"light"===i||"switch"===i||"button"===i||"other"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._handleDeviceClick(o)):"mmwave"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._placeMmwave(o)):"door"===i||"window"===i?this._openingPreview&&(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._placeOpening(i)):"zone"===i?(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._handleZonePolyClick(this._cursorPos)):(this._edgeEditor=null,this._multiEdgeEditor=null,this._roomEditor=null,this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY},this._svg?.setPointerCapture(t.pointerId))}_handleDeviceClick(t){this._pendingDevice={position:t},this._showEntityPickerModal=!0}async _placeOpening(t){if(!this.hass||!this._openingPreview)return;const e=Ft.value,i=Wt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,{edgeId:r,t:a,startPos:l,endPos:d,thickness:c,position:h}=this._openingPreview,p="door"===t?80:100,g=t,u={...l},f={...d},_=c,y={...h};try{const e=await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:r,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}});await se(),await this._syncRoomsWithEdges();const i=e.edges.map(t=>t.id);Qe({type:"opening_place",description:`Place ${t}`,undo:async()=>{for(const t of i)try{await o.callWS({type:"inhabit/edges/delete",floor_plan_id:n,floor_id:s,edge_id:t})}catch{}await o.callWS({type:"inhabit/edges/add",floor_plan_id:n,floor_id:s,start:u,end:f,thickness:_}),await se(),await this._syncRoomsWithEdges()},redo:async()=>{const e=Ft.value;if(!e)return;const i=Ze(e).find(t=>{if("wall"!==t.type)return!1;const e=this._getClosestPointOnSegment(y,t.startPos,t.endPos);return Math.sqrt((e.x-y.x)**2+(e.y-y.y)**2)<5});i&&await o.callWS({type:"inhabit/edges/split",floor_plan_id:n,floor_id:s,edge_id:i.id,position:a,new_type:g,width:p,..."door"===t?{opening_parts:"single",opening_type:"swing",swing_direction:"left"}:{opening_parts:"single",opening_type:"swing"}}),await se(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error placing opening:",t)}}_handlePointerMove(t){if(this._activePointers.has(t.pointerId)&&this._activePointers.set(t.pointerId,{x:t.clientX,y:t.clientY}),2===this._activePointers.size&&this._pinchStartViewBox){const[t,e]=[...this._activePointers.values()],i=e.x-t.x,o=e.y-t.y,n=Math.sqrt(i*i+o*o);if(this._pinchStartDist>0){const i=this._pinchStartDist/n,o=this._pinchStartViewBox,s=o.width*i,r=o.height*i;if(s<100||s>1e4)return;const a={x:(t.x+e.x)/2,y:(t.y+e.y)/2},l=this._screenToSvgWithViewBox(this._pinchStartMid,o),d=a.x-this._pinchStartMid.x,c=a.y-this._pinchStartMid.y,h=d*(o.width/this._svg.clientWidth),p=c*(o.height/this._svg.clientHeight),g={x:l.x-(l.x-o.x)*i-h,y:l.y-(l.y-o.y)*i-p,width:s,height:r};Ut.value=g,this._viewBox=g}return}const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ot.value;let o=this._getSnappedPoint(e,"light"===i||"switch"===i||"button"===i||"other"===i||"mmwave"===i||"wall"===i||"zone"===i);if(t.shiftKey&&"wall"===i&&this._wallStartPoint){o=Math.abs(o.x-this._wallStartPoint.x)>=Math.abs(o.y-this._wallStartPoint.y)?{x:o.x,y:this._wallStartPoint.y}:{x:this._wallStartPoint.x,y:o.y}}if("zone"===i&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints[this._zonePolyPoints.length-1],e=Math.abs(o.x-t.x),i=Math.abs(o.y-t.y),n=15;i<n&&e>n?o={x:o.x,y:t.y}:e<n&&i>n&&(o={x:t.x,y:o.y})}if(this._cursorPos=o,this._longPressTimer&&this._viewingPointerStart){const e=t.clientX-this._viewingPointerStart.x,i=t.clientY-this._viewingPointerStart.y;(Math.abs(e)>5||Math.abs(i)>5)&&(clearTimeout(this._longPressTimer),this._longPressTimer=null,this._viewingClickedDevice=null,this._viewingPointerStart=null,this._cancelViewBoxAnimation(),this._isPanning=!0,this._panStart={x:t.clientX,y:t.clientY})}if(this._draggingSimTarget)return this._moveSimulatedTargetLocal(this._draggingSimTarget.targetId,e),void this._throttledMoveSimTarget(this._draggingSimTarget.targetId,e);if(this._draggingZone){const t=e.x-this._draggingZone.startPoint.x,i=e.y-this._draggingZone.startPoint.y;if(!this._draggingZone.hasMoved&&(Math.abs(t)>3||Math.abs(i)>3)&&(this._draggingZone.hasMoved=!0),this._draggingZone.hasMoved){const e=this._draggingZone.zone;if(e.polygon?.vertices){const o={x:this._draggingZone.originalVertices[0].x+t,y:this._draggingZone.originalVertices[0].y+i},n=Vt.value?le(o,Zt.value):o,s=n.x-o.x,r=n.y-o.y;for(let o=0;o<e.polygon.vertices.length;o++)e.polygon.vertices[o]={x:this._draggingZone.originalVertices[o].x+t+s,y:this._draggingZone.originalVertices[o].y+i+r}}this.requestUpdate()}return}if(this._draggingPlacement){const t=e.x-this._draggingPlacement.startPoint.x,i=e.y-this._draggingPlacement.startPoint.y;if(!this._draggingPlacement.hasMoved&&(Math.abs(t)>3||Math.abs(i)>3)&&(this._draggingPlacement.hasMoved=!0),this._draggingPlacement.hasMoved){const e={x:this._draggingPlacement.originalPosition.x+t,y:this._draggingPlacement.originalPosition.y+i},o=Vt.value?le(e,Zt.value):e,n=this._draggingPlacement;"light"===n.type?qt.value=qt.value.map(t=>t.id===n.id?{...t,position:o}:t):"switch"===n.type?Yt.value=Yt.value.map(t=>t.id===n.id?{...t,position:o}:t):"button"===n.type?Xt.value=Xt.value.map(t=>t.id===n.id?{...t,position:o}:t):"other"===n.type?Kt.value=Kt.value.map(t=>t.id===n.id?{...t,position:o}:t):ee.value=ee.value.map(t=>t.id===n.id?{...t,position:o}:t),this.requestUpdate()}return}if(this._rotatingMmwave)this._handleMmwaveRotationMove(e);else{if(this._draggingZoneVertex){let t=this._getSnappedPoint(e,!0);const i=this._draggingZoneVertex.zone;if(i.polygon?.vertices){const e=i.polygon.vertices,o=this._draggingZoneVertex.vertexIndex,n=e.length,s=e[(o-1+n)%n],r=e[(o+1)%n],a=15;for(const e of[s,r])Math.abs(t.x-e.x)<a&&(t={x:e.x,y:t.y}),Math.abs(t.y-e.y)<a&&(t={x:t.x,y:e.y});e[o]={x:t.x,y:t.y}}return void this.requestUpdate()}if(this._draggingNode){const i=t.clientX-this._draggingNode.startX,o=t.clientY-this._draggingNode.startY;return(Math.abs(i)>3||Math.abs(o)>3)&&(this._draggingNode.hasMoved=!0),this._cursorPos=this._getSnappedPointForNode(e),void this.requestUpdate()}if(this._isPanning){const e=(t.clientX-this._panStart.x)*(this._viewBox.width/this._svg.clientWidth),i=(t.clientY-this._panStart.y)*(this._viewBox.height/this._svg.clientHeight),o={...this._viewBox,x:this._viewBox.x-e,y:this._viewBox.y-i};return this._panStart={x:t.clientX,y:t.clientY},Ut.value=o,void(this._viewBox=o)}this._wallStartPoint||"select"!==i||"walls"!==this._canvasMode||this._checkNodeHover(e),"zone"===i&&this._zonePolyPoints.length>0&&this.requestUpdate(),"door"!==i&&"window"!==i||this._updateOpeningPreview(e)}}_checkNodeHover(t){const e=Ft.value;if(!e)return void(this._hoveredNode=null);const i=He(t,e.nodes,15);this._hoveredNode=i}_updateOpeningPreview(t){const e=Ft.value;if(!e)return void(this._openingPreview=null);const i=Ze(e);let o=null,n=30,s=t,r=0;for(const e of i){if("wall"!==e.type)continue;const i=this._getClosestPointOnSegment(t,e.startPos,e.endPos),a=Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2);if(a<n){n=a,o=e,s=i;const t=e.endPos.x-e.startPos.x,l=e.endPos.y-e.startPos.y,d=t*t+l*l;r=d>0?((i.x-e.startPos.x)*t+(i.y-e.startPos.y)*l)/d:0}}this._openingPreview=o?{edgeId:o.id,position:s,startPos:o.startPos,endPos:o.endPos,thickness:o.thickness,t:r}:null,this.requestUpdate()}_handlePointerUp(t){if(this._activePointers.delete(t.pointerId),this._pinchStartViewBox)return this._pinchStartViewBox=null,this._pinchStartDist=0,void this._svg?.releasePointerCapture(t.pointerId);if(this._viewingClickedDevice){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null);const e=this._viewingClickedDevice;return this._viewingClickedDevice=null,this._viewingPointerStart=null,this._svg?.releasePointerCapture(t.pointerId),this._longPressTriggered||("light"!==e.type&&"switch"!==e.type&&"button"!==e.type||!e.entityId?e.entityId&&this._openEntityDetails(e.entityId):this._toggleEntity(e.entityId)),void(this._longPressTriggered=!1)}if(this._draggingSimTarget){const e=this._screenToSvg({x:t.clientX,y:t.clientY});return this._sendSimTargetMove(this._draggingSimTarget.targetId,e),this._svg?.releasePointerCapture(t.pointerId),this._draggingSimTarget=null,void(this._simMoveThrottle&&(clearTimeout(this._simMoveThrottle),this._simMoveThrottle=null))}if(this._rotatingMmwave)return this._finishMmwaveRotation(),void this._svg?.releasePointerCapture(t.pointerId);if(this._draggingPlacement)return this._draggingPlacement.hasMoved&&this._finishPlacementDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingPlacement=null);if(this._draggingZone){if(this._draggingZone.hasMoved)this._finishZoneDrag();else if("occupancy"===this._canvasMode){const t=this._draggingZone.zone,e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name;Qt.value={id:t.id,name:e,type:"zone"},Jt.value=t.id}else{const t=this._draggingZone.zone;this._zoneEditor={zone:t,editName:t.name,editColor:t.color,editAreaId:t.ha_area_id??null}}return this._svg?.releasePointerCapture(t.pointerId),void(this._draggingZone=null)}return this._draggingZoneVertex?(this._finishZoneVertexDrag(),this._svg?.releasePointerCapture(t.pointerId),void(this._draggingZoneVertex=null)):this._draggingNode?(this._draggingNode.hasMoved?this._finishNodeDrag():this._startWallFromNode(),void this._svg?.releasePointerCapture(t.pointerId)):void(this._isPanning&&(this._isPanning=!1,this._svg?.releasePointerCapture(t.pointerId)))}_handlePointerCancel(t){this._activePointers.delete(t.pointerId),this._pinchStartViewBox&&(this._pinchStartViewBox=null,this._pinchStartDist=0)}async _handleDblClick(t){if("viewing"===this._canvasMode){const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ft.value;if(i){const t=this._hitTestDevice(e,i);t&&t.entityId&&this._openEntityDetails(t.entityId)}return}if("walls"!==this._canvasMode)return;const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ft.value,o=Wt.value;if(!i||!o||!this.hass)return;const n=He(e,i.nodes,15);if(n)return this._nodeEditor={node:n,editX:Math.round(n.x).toString(),editY:Math.round(n.y).toString()},this._edgeEditor=null,void(this._multiEdgeEditor=null);const s=Ze(i);for(const t of s){if(this._pointToSegmentDistance(e,t.startPos,t.endPos)<t.thickness/2+8){try{await this.hass.callWS({type:"inhabit/edges/split_at_point",floor_plan_id:o.id,floor_id:i.id,edge_id:t.id,point:{x:e.x,y:e.y}}),await se(),await this._syncRoomsWithEdges()}catch(t){console.error("Failed to split edge:",t)}return}}}async _handleContextMenu(t){if("viewing"===this._canvasMode){t.preventDefault();const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ft.value;if(i){const t=this._hitTestDevice(e,i);t&&t.entityId&&this._openEntityDetails(t.entityId)}return}if("occupancy"===this._canvasMode&&oe.value)return void t.preventDefault();if("walls"!==this._canvasMode)return;t.preventDefault();const e=this._screenToSvg({x:t.clientX,y:t.clientY}),i=Ft.value,o=Wt.value;if(!i||!o||!this.hass)return;const n=He(e,i.nodes,15);if(!n)return;if(2===Ve(n.id,i.edges).length)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:o.id,floor_id:i.id,node_id:n.id}),await se(),await this._syncRoomsWithEdges(),this._hoveredNode=null,Bt.value={type:"none",ids:[]},this._edgeEditor=null}catch(t){console.error("Failed to dissolve node:",t)}}_startWallFromNode(){this._draggingNode&&(this._wallStartPoint=this._draggingNode.originalCoords,Ot.value="wall",this._draggingNode=null,this._hoveredNode=null)}async _finishNodeDrag(){if(!this._draggingNode||!this.hass)return void(this._draggingNode=null);const t=Ft.value,e=Wt.value;if(!t||!e)return void(this._draggingNode=null);const i=this._cursorPos,o=this._draggingNode.originalCoords;if(Math.abs(i.x-o.x)<1&&Math.abs(i.y-o.y)<1)return void(this._draggingNode=null);const n=Le($e(t.nodes,t.edges),this._draggingNode.node.id,i.x,i.y);if(n.blocked)return n.blockedBy&&this._blinkEdges(n.blockedBy),void(this._draggingNode=null);if(0!==n.updates.length){try{await this._withNodeUndo(n.updates,"Move node",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await se()})}catch(t){console.error("Error updating node:",t),alert(`Failed to update node: ${t}`)}this._draggingNode=null,await this._removeDegenerateEdges()}else this._draggingNode=null}async _removeDegenerateEdges(){if(!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=function(t,e,i=.5){const o=new Map;for(const e of t)o.set(e.id,e);const n=[];for(const t of e){const e=o.get(t.start_node),s=o.get(t.end_node);e&&s&&ae(e,s)<=i&&n.push(t.id)}return n}(t.nodes,t.edges);if(0!==i.length){console.log("%c[degenerate]%c Removing %d zero-length edge(s): %s","color:#f59e0b;font-weight:bold","",i.length,i.map(t=>t.slice(0,8)+"…").join(", "));try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o});await se(),await this._syncRoomsWithEdges()}catch(t){console.error("Error removing degenerate edges:",t)}}}_handleKeyDown(t){if("Escape"===t.key){if(this._wallStartPoint=null,this._wallChainStart=null,this._hoveredNode=null,this._draggingNode=null,this._draggingZone=null,this._draggingZoneVertex=null,this._draggingPlacement=null,this._rotatingMmwave){const t=this._rotatingMmwave;ee.value=ee.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e),this._rotatingMmwave=null}this._pendingDevice=null,this._edgeEditor=null,this._multiEdgeEditor=null,this._nodeEditor=null,this._roomEditor=null,this._zoneEditor=null,this._zonePolyPoints=[],this._pendingZonePolygon=null,Bt.value={type:"none",ids:[]},te.value=null,Ot.value="select"}else"Backspace"!==t.key&&"Delete"!==t.key||!this._zoneEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._multiEdgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||!this._edgeEditor?"Backspace"!==t.key&&"Delete"!==t.key||"light"!==Bt.value.type&&"switch"!==Bt.value.type&&"mmwave"!==Bt.value.type?"r"===t.key&&"mmwave"===Bt.value.type?(t.preventDefault(),this._rotateMmwave(t.shiftKey?-15:15)):"z"!==t.key||!t.ctrlKey&&!t.metaKey||t.shiftKey?("z"===t.key&&(t.ctrlKey||t.metaKey)&&t.shiftKey||"y"===t.key&&(t.ctrlKey||t.metaKey))&&(t.preventDefault(),ei()):(t.preventDefault(),ti()):(t.preventDefault(),this._deleteSelectedPlacement()):(t.preventDefault(),this._handleEdgeDelete()):(t.preventDefault(),this._handleMultiEdgeDelete()):(t.preventDefault(),this._handleZoneDelete())}async _handleEditorSave(){if(!this._edgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._edgeEditor.edge,o=parseFloat(this._editingLength);if(isNaN(o)||o<=0)return;const n=Math.abs(o-this._edgeEditor.length)>=.01,s=this._editingDirection!==i.direction,r=this._editingLengthLocked!==i.length_locked,a="door"===i.type||"window"===i.type,l=a&&this._editingOpeningParts!==(i.opening_parts??"single"),d=a&&this._editingOpeningType!==(i.opening_type??"swing"),c=a&&this._editingSwingDirection!==(i.swing_direction??"left"),h=a&&(this._editingEntityId??null)!==(i.entity_id??null),p=s||r||l||d||c||h;try{if(s){if(!await this._applyDirection(i,this._editingDirection))return}if(n&&await this._updateEdgeLength(i,o),p){const o=Ft.value;if(o&&r){const t={};s&&(t.direction=this._editingDirection),r&&(t.length_locked=this._editingLengthLocked);const e=function(t,e,i,o){if(ue){const t=Object.entries(o).map(([t,e])=>`${t}=${e}`).join(", ");console.group(fe+" checkConstraintsFeasible: %cedge %s → {%s}",_e,ye,i.slice(0,8)+"…",t)}const n=$e(t,e),s=Ee(n),{magnitudes:r}=Me(n,s),a=e.map(t=>t.id!==i?t:{...t,...void 0!==o.direction&&{direction:o.direction},...void 0!==o.length_locked&&{length_locked:o.length_locked},...void 0!==o.angle_group&&{angle_group:o.angle_group??void 0}}),l=$e(t,a),d=Ee(l),c=new Set;for(const[t,e]of l.nodes)e.pinned&&c.add(t);const h=Ie(l,c,d,r);return h.blocked?(ue&&(console.log(fe+" %c→ NOT FEASIBLE%c — blocked by: %s",_e,ve,"",(h.blockedBy||[]).map(t=>{const e=l.edges.get(t);return e?be(e,l.nodes):t.slice(0,8)+"…"}).join(" | ")),console.groupEnd()),{feasible:!1,blockedBy:h.blockedBy}):(ue&&(console.log(fe+" %c→ Feasible",_e,me),console.groupEnd()),{feasible:!0})}(o.nodes,o.edges,i.id,t);if(!e.feasible)return void(e.blockedBy&&this._blinkEdges(e.blockedBy))}const n={type:"inhabit/edges/update",floor_plan_id:e.id,floor_id:t.id,edge_id:i.id};s&&(n.direction=this._editingDirection),r&&(n.length_locked=this._editingLengthLocked),l&&(n.opening_parts=this._editingOpeningParts),d&&(n.opening_type=this._editingOpeningType),c&&(n.swing_direction=this._editingSwingDirection),h&&(n.entity_id=this._editingEntityId||null),await this.hass.callWS(n),await se()}}catch(t){console.error("Error applying edge changes:",t)}this._edgeEditor=null,Bt.value={type:"none",ids:[]}}_handleEditorCancel(){this._edgeEditor=null,Bt.value={type:"none",ids:[]}}async _setDoorOpensToSide(t,e){if(!this.hass)return;if("a"===t)return;const i=Ft.value,o=Wt.value;if(!i||!o)return;const n=this._editingSwingDirection,s={left:"right",right:"left"}[n]??n;try{await this.hass.callWS({type:"inhabit/edges/update",floor_plan_id:o.id,floor_id:i.id,edge_id:e.id,swap_nodes:!0,swing_direction:s}),this._editingSwingDirection=s,await se();const t=Ft.value;if(t){const i=t.edges.find(t=>t.id===e.id);i&&this._updateEdgeEditorForSelection([i.id])}}catch(t){console.error("Error flipping door side:",t)}}async _handleEdgeDelete(){if(!this._edgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this.hass,o=e.id,n=t.id,s=this._edgeEditor.edge,r=Be(t.nodes),a=r.get(s.start_node),l=r.get(s.end_node),d={start:a?{x:a.x,y:a.y}:{x:0,y:0},end:l?{x:l.x,y:l.y}:{x:0,y:0},thickness:s.thickness,is_exterior:s.is_exterior,length_locked:s.length_locked,direction:s.direction},c={id:s.id};try{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await se(),await this._syncRoomsWithEdges(),Qe({type:"edge_delete",description:"Delete edge",undo:async()=>{const t=await i.callWS({type:"inhabit/edges/add",floor_plan_id:o,floor_id:n,...d});c.id=t.edge.id,await se(),await this._syncRoomsWithEdges()},redo:async()=>{await i.callWS({type:"inhabit/edges/delete",floor_plan_id:o,floor_id:n,edge_id:c.id}),await se(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error deleting edge:",t)}this._edgeEditor=null,Bt.value={type:"none",ids:[]}}_handleEditorKeyDown(t){"Enter"===t.key?this._handleEditorSave():"Escape"===t.key&&this._handleEditorCancel()}async _withNodeUndo(t,e,i){if(!this.hass)return;const o=Ft.value,n=Wt.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l=new Map;for(const e of t){const t=o.nodes.find(t=>t.id===e.nodeId);t&&l.set(t.id,{x:t.x,y:t.y})}await i(),await this._syncRoomsWithEdges();const d=Ft.value;if(!d)return;const c=new Map;for(const e of t){const t=d.nodes.find(t=>t.id===e.nodeId);t&&c.set(t.id,{x:t.x,y:t.y})}const h=async t=>{const e=Array.from(t.entries()).map(([t,e])=>({node_id:t,x:e.x,y:e.y}));e.length>0&&await s.callWS({type:"inhabit/nodes/update",floor_plan_id:r,floor_id:a,updates:e}),await se(),await this._syncRoomsWithEdges()};Qe({type:"node_update",description:e,undo:()=>h(l),redo:()=>h(c)})}async _updateEdgeLength(t,e){if(!this.hass)return;const i=Ft.value,o=Wt.value;if(!i||!o)return;const n=i.edges.map(e=>e.id===t.id?{...e,length_locked:!1}:e),s=Ne($e(i.nodes,n),t.id,e);if(s.blocked)s.blockedBy&&this._blinkEdges(s.blockedBy);else if(0!==s.updates.length){try{await this._withNodeUndo(s.updates,"Change edge length",async()=>{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await se()})}catch(t){console.error("Error updating edge length:",t),alert(`Failed to update edge: ${t}`)}await this._removeDegenerateEdges()}}_getSnappedPointForNode(t){const e=Ft.value;if(e){const i=this._draggingNode?.node.id,o=He(t,i?e.nodes.filter(t=>t.id!==i):e.nodes,15);if(o)return{x:o.x,y:o.y};if(i){const o=new Set(Ve(i,e.edges).map(t=>`${t.start_node}-${t.end_node}`)),n=Ze(e);let s=null,r=15;for(const e of n){const i=`${e.start_node}-${e.end_node}`;if(o.has(i))continue;const n=this._getClosestPointOnSegment(t,e.startPos,e.endPos),a=Math.sqrt((t.x-n.x)**2+(t.y-n.y)**2);a<r&&(r=a,s=n)}if(s)return s}}return{x:Math.round(t.x),y:Math.round(t.y)}}_getSnappedPoint(t,e=!1){const i=Ft.value;if(!i)return Vt.value?le(t,Zt.value):t;const o=He(t,i.nodes,15);if(o)return{x:o.x,y:o.y};if(e){const e=Ze(i);let o=null,n=15;for(const i of e){const e=this._getClosestPointOnSegment(t,i.startPos,i.endPos),s=Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));s<n&&(n=s,o=e)}if(o)return o}return Vt.value?le(t,Zt.value):t}_getClosestPointOnSegment(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return e;const r=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s));return{x:e.x+r*o,y:e.y+r*n}}_handleSelectClick(t,e=!1){const i=Ft.value;if(!i)return!1;const o=this._canvasMode;if("walls"===o){const o=Ze(i);for(const i of o){if(this._pointToSegmentDistance(t,i.startPos,i.endPos)<i.thickness/2+5){if(e&&"edge"===Bt.value.type){const t=[...Bt.value.ids],e=t.indexOf(i.id);return e>=0?t.splice(e,1):t.push(i.id),Bt.value={type:"edge",ids:t},this._updateEdgeEditorForSelection(t),!0}return Bt.value={type:"edge",ids:[i.id]},this._updateEdgeEditorForSelection([i.id]),!0}}}if("placement"===o||"viewing"===o){for(const e of qt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Bt.value={type:"light",ids:[e.id]},"placement"===o?te.value={id:e.id,type:"light"}:this._toggleEntity(e.entity_id),!0}for(const e of Yt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Bt.value={type:"switch",ids:[e.id]},"placement"===o?te.value={id:e.id,type:"switch"}:this._toggleEntity(e.entity_id),!0}for(const e of Xt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Bt.value={type:"button",ids:[e.id]},"placement"===o?te.value={id:e.id,type:"button"}:this._toggleEntity(e.entity_id),!0}for(const e of Kt.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Bt.value={type:"other",ids:[e.id]},"placement"===o?te.value={id:e.id,type:"other"}:this._openEntityDetails(e.entity_id),!0}for(const e of ee.value.filter(t=>t.floor_id===i.id)){if(Math.hypot(t.x-e.position.x,t.y-e.position.y)<15)return Bt.value={type:"mmwave",ids:[e.id]},"placement"===o?te.value={id:e.id,type:"mmwave"}:e.entity_id&&this._openEntityDetails(e.entity_id),!0}}if(("furniture"===o||"occupancy"===o)&&i.zones){const e=[...i.zones];for(const i of e)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices)){if("occupancy"===o){Bt.value={type:"zone",ids:[i.id]};const t=i.ha_area_id?this._haAreas.find(t=>t.area_id===i.ha_area_id)?.name??i.name:i.name;return Qt.value={id:i.id,name:t,type:"zone"},Jt.value=i.id,!0}return Bt.value={type:"zone",ids:[i.id]},!0}}if("walls"===o||"occupancy"===o)for(const e of i.rooms)if(this._pointInPolygon(t,e.polygon.vertices)){Bt.value={type:"room",ids:[e.id]};const t=e.ha_area_id?this._haAreas.find(t=>t.area_id===e.ha_area_id)?.name??e.name:e.name;return"occupancy"===o?(Qt.value={id:e.id,name:t,type:"room"},Jt.value=e.id):this._roomEditor={room:e,editName:t,editColor:e.color,editAreaId:e.ha_area_id??null},!0}return Bt.value={type:"none",ids:[]},te.value=null,!1}_updateEdgeEditorForSelection(t){const e=Ft.value;if(!e)return;if(0===t.length)return this._edgeEditor=null,void(this._multiEdgeEditor=null);const i=Be(e.nodes);if(1===t.length){const o=e.edges.find(e=>e.id===t[0]);if(o){const t=i.get(o.start_node),e=i.get(o.end_node);if(t&&e){const i=this._calculateWallLength(t,e);this._edgeEditor={edge:o,position:{x:(t.x+e.x)/2,y:(t.y+e.y)/2},length:i},this._editingLength=Math.round(i).toString(),this._editingLengthLocked=o.length_locked,this._editingDirection=o.direction,this._editingOpeningParts=o.opening_parts??"single",this._editingOpeningType=o.opening_type??"swing",this._editingSwingDirection=o.swing_direction??"left",this._editingEntityId=o.entity_id??null,this._openingSensorSearch="",this._openingSensorPickerOpen=!1}}return void(this._multiEdgeEditor=null)}const o=t.map(t=>e.edges.find(e=>e.id===t)).filter(t=>!!t),n=[];for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&n.push({x:e.x,y:e.y}),o&&n.push({x:o.x,y:o.y})}const s=function(t,e=2){if(t.length<2)return!0;if(2===t.length)return!0;let i=0,o=t[0],n=t[1];for(let e=0;e<t.length;e++)for(let s=e+1;s<t.length;s++){const r=ae(t[e],t[s]);r>i&&(i=r,o=t[e],n=t[s])}if(i<1e-9)return!0;const s=n.x-o.x,r=n.y-o.y,a=Math.sqrt(s*s+r*r);for(const i of t)if(Math.abs((i.x-o.x)*r-(i.y-o.y)*s)/a>e)return!1;return!0}(n);let r;if(s){r=0;for(const t of o){const e=i.get(t.start_node),o=i.get(t.end_node);e&&o&&(r+=this._calculateWallLength(e,o))}this._editingTotalLength=Math.round(r).toString()}this._multiEdgeEditor={edges:o,collinear:s,totalLength:r},this._edgeEditor=null}_pointToSegmentDistance(t,e,i){const o=i.x-e.x,n=i.y-e.y,s=o*o+n*n;if(0===s)return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));const r=Math.max(0,Math.min(1,((t.x-e.x)*o+(t.y-e.y)*n)/s)),a=e.x+r*o,l=e.y+r*n;return Math.sqrt(Math.pow(t.x-a,2)+Math.pow(t.y-l,2))}_handleWallClick(t,e=!1){if(this._wallStartPoint){let i="free";if(e){i=Math.abs(t.x-this._wallStartPoint.x)>=Math.abs(t.y-this._wallStartPoint.y)?"horizontal":"vertical"}this._completeWall(this._wallStartPoint,t,i);const o=Ft.value,n=o?.nodes.some(e=>Math.abs(t.x-e.x)<1&&Math.abs(t.y-e.y)<1);this._wallChainStart&&Math.abs(t.x-this._wallChainStart.x)<1&&Math.abs(t.y-this._wallChainStart.y)<1?(this._wallStartPoint=null,this._wallChainStart=null,Ot.value="select"):n?(this._wallStartPoint=null,this._wallChainStart=null):this._wallStartPoint=t}else this._wallStartPoint=t,this._wallChainStart=t}async _completeWall(t,e,i="free"){if(!this.hass)return;const o=Ft.value,n=Wt.value;if(!o||!n)return;const s=this.hass,r=n.id,a=o.id,l={id:""};try{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await se(),await this._syncRoomsWithEdges(),Qe({type:"edge_add",description:"Add wall",undo:async()=>{await s.callWS({type:"inhabit/edges/delete",floor_plan_id:r,floor_id:a,edge_id:l.id}),await se(),await this._syncRoomsWithEdges()},redo:async()=>{const o=await s.callWS({type:"inhabit/edges/add",floor_plan_id:r,floor_id:a,start:t,end:e,thickness:6,direction:i});l.id=o.edge.id,await se(),await this._syncRoomsWithEdges()}})}catch(t){console.error("Error creating edge:",t)}}_screenToSvg(t){if(!this._svg)return t;const e=this._svg.getScreenCTM();if(e){const i=e.inverse();return{x:i.a*t.x+i.c*t.y+i.e,y:i.b*t.x+i.d*t.y+i.f}}const i=this._svg.getBoundingClientRect(),o=this._viewBox.width/i.width,n=this._viewBox.height/i.height;return{x:this._viewBox.x+(t.x-i.left)*o,y:this._viewBox.y+(t.y-i.top)*n}}_screenToSvgWithViewBox(t,e){if(!this._svg)return t;const i=this._svg.getBoundingClientRect();return{x:e.x+(t.x-i.left)*(e.width/i.width),y:e.y+(t.y-i.top)*(e.height/i.height)}}_cancelViewBoxAnimation(){null!==this._viewBoxAnimation&&(cancelAnimationFrame(this._viewBoxAnimation),this._viewBoxAnimation=null)}_animateToRoom(t){const e=Ft.value;if(!e)return;const i=e.rooms.find(e=>e.id===t)??e.zones?.find(e=>e.id===t);if(!i||!i.polygon?.vertices?.length)return;const o=i.polygon.vertices.map(t=>t.x),n=i.polygon.vertices.map(t=>t.y),s=Math.min(...o),r=Math.max(...o),a=Math.min(...n),l=Math.max(...n),d=r-s,c=l-a,h=Qt.value?.3:.15;let p=d+2*(Math.max(d,50)*h),g=c+2*(Math.max(c,50)*h);const u=this._svg?.getBoundingClientRect(),f=u&&u.width>0&&u.height>0?u.width/u.height:1.25;p/g>f?g=p/f:p=g*f;const _=(s+r)/2,y=(a+l)/2;let v=0;if(!!Qt.value&&u&&u.width>0){v=316/u.width*p/2}this._animateViewBox({x:_-p/2+v,y:y-g/2,width:p,height:g},400)}_animateToFloor(){const t=Ft.value;if(!t)return;const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Yt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Xt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of ee.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s;let d=a+2*(.1*Math.max(a,50)),c=l+2*(.1*Math.max(l,50));const h=this._svg?.getBoundingClientRect(),p=h&&h.width>0&&h.height>0?h.width/h.height:1.25;d/c>p?c=d/p:d=c*p;const g=(o+n)/2,u=(s+r)/2;this._animateViewBox({x:g-d/2,y:u-c/2,width:d,height:c},400)}_animateViewBox(t,e){this._cancelViewBoxAnimation();const i={...this._viewBox},o=performance.now(),n=s=>{const r=s-o,a=Math.min(r/e,1),l=1-Math.pow(1-a,3),d={x:i.x+(t.x-i.x)*l,y:i.y+(t.y-i.y)*l,width:i.width+(t.width-i.width)*l,height:i.height+(t.height-i.height)*l};this._viewBox=d,Ut.value=d,this._viewBoxAnimation=a<1?requestAnimationFrame(n):null};this._viewBoxAnimation=requestAnimationFrame(n)}_fitToFloor(t){const e=[],i=[];for(const o of t.nodes)e.push(o.x),i.push(o.y);for(const o of t.rooms)for(const t of o.polygon.vertices)e.push(t.x),i.push(t.y);for(const o of qt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Yt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of Xt.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));for(const o of ee.value)o.floor_id===t.id&&(e.push(o.position.x),i.push(o.position.y));if(0===e.length)return;const o=Math.min(...e),n=Math.max(...e),s=Math.min(...i),r=Math.max(...i),a=n-o,l=r-s,d=this._svg?.getBoundingClientRect(),c=d&&d.width>0&&d.height>0?d.width/d.height:1.25;let h=a+2*(.1*Math.max(a,50)),p=l+2*(.1*Math.max(l,50));h/p>c?p=h/c:h=p*c;const g={x:(o+n)/2-h/2,y:(s+r)/2-p/2,width:h,height:p};Ut.value=g,this._viewBox=g}async _addSimulatedTarget(t){if(!this.hass)return;const e=Wt.value,i=Ft.value;if(e&&i)try{const o=await this.hass.callWS({type:"inhabit/simulate/target/add",floor_plan_id:e.id,floor_id:i.id,position:{x:t.x,y:t.y},hitbox:oe.value});ie.value=[...ie.value,o]}catch(t){console.error("Failed to add simulated target:",t)}}async _removeSimulatedTarget(t){if(this.hass)try{await this.hass.callWS({type:"inhabit/simulate/target/remove",target_id:t}),ie.value=ie.value.filter(e=>e.id!==t)}catch(t){console.error("Failed to remove simulated target:",t)}}_moveSimulatedTargetLocal(t,e){const i=Ft.value,o=ie.value,n=o.findIndex(e=>e.id===t);if(-1===n)return;const s=oe.value&&i?this._getRegionAtPoint(e,i):null,r={...o[n],position:{x:e.x,y:e.y},region_id:s?.id??null,region_name:s?.name??null},a=[...o];a[n]=r,ie.value=a}_throttledMoveSimTarget(t,e){this._simMoveThrottle||(this._simMoveThrottle=setTimeout(()=>{this._simMoveThrottle=null,this._sendSimTargetMove(t,e)},66))}async _sendSimTargetMove(t,e){if(this.hass)try{const i=await this.hass.callWS({type:"inhabit/simulate/target/move",target_id:t,position:{x:e.x,y:e.y},hitbox:oe.value}),o=ie.value,n=o.findIndex(e=>e.id===t);if(-1!==n){const t=[...o];t[n]=i,ie.value=t}}catch{}}_getRegionAtPoint(t,e){if(e.zones)for(const i of e.zones)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};for(const i of e.rooms)if(i.polygon?.vertices&&this._pointInPolygon(t,i.polygon.vertices))return{id:i.id,name:i.name};return null}_renderSimulationLayer(t){const e=ie.value,i=oe.value,o=new Set;if(i)for(const t of e)t.region_id&&o.add(t.region_id);const n=this._viewBox,s=Math.max(n.width,n.height)/100,r=.55*s,a=2.8*r,l=1.1*s,d=r+.8*l;return H`
      <defs>
        <filter id="sim-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="${.1*s}" stdDeviation="${.15*s}" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g class="simulation-layer">
        <!-- Room/zone occupation highlights -->
        ${t.rooms.map(t=>o.has(t.id)?H`
          <path d="${re(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}
        ${(t.zones||[]).map(t=>o.has(t.id)?H`
          <path d="${re(t.polygon)}"
                fill="rgba(76, 175, 80, 0.12)"
                stroke="rgba(76, 175, 80, 0.4)"
                stroke-width="${.12*s}"
                stroke-dasharray="${.4*s} ${.2*s}"
                pointer-events="none"/>
        `:null)}

        <!-- Target markers -->
        ${e.map(t=>{const e=!!t.region_id,i=e?"#4caf50":"#78909c";return H`
            <g class="sim-target" style="cursor: grab;">
              <!-- Pulse ring for detected targets -->
              ${e?H`
                <circle cx="${t.position.x}" cy="${t.position.y}" r="${a}"
                        fill="none" stroke="${i}" stroke-width="${.06*s}"
                        opacity="0.3"/>
              `:null}
              <!-- Dot -->
              <circle cx="${t.position.x}" cy="${t.position.y}" r="${r}"
                      fill="${i}"
                      filter="url(#sim-shadow)"/>
              ${t.region_name?H`
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
    `}_pointInPolygon(t,e){if(e.length<3)return!1;let i=!1;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[n],r=e[s];o.y>t.y!=r.y>t.y&&t.x<(r.x-o.x)*(t.y-o.y)/(r.y-o.y)+o.x&&(i=!i)}return i}_pointInOrNearPolygon(t,e,i){if(this._pointInPolygon(t,e))return!0;const o=e.length;for(let n=0,s=o-1;n<o;s=n++){const o=e[s].x,r=e[s].y,a=e[n].x-o,l=e[n].y-r,d=a*a+l*l;if(0===d){if(Math.hypot(t.x-o,t.y-r)<=i)return!0;continue}const c=Math.max(0,Math.min(1,((t.x-o)*a+(t.y-r)*l)/d)),h=o+c*a,p=r+c*l;if(Math.hypot(t.x-h,t.y-p)<=i)return!0}return!1}_getRandomRoomColor(){const t=["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"];return t[Math.floor(Math.random()*t.length)]}async _syncRoomsWithEdges(){if(!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=function(t,e){if(0===e.length)return[];const i=new Map;for(const e of t)i.set(e.id,e);const o=new Map,n=(t,e)=>{const n=i.get(t),s=i.get(e);if(!n||!s)return;if(t===e)return;const r=Math.atan2(s.y-n.y,s.x-n.x);o.has(t)||o.set(t,[]),o.get(t).push({targetId:e,angle:r})};for(const t of e)n(t.start_node,t.end_node),n(t.end_node,t.start_node);for(const[,t]of o)t.sort((t,e)=>t.angle-e.angle);const s=new Set,r=[],a=(t,e)=>`${t}->${e}`;for(const[t,e]of o)for(const n of e){const e=a(t,n.targetId);if(s.has(e))continue;const l=[];let d=t,c=n.targetId,h=!0;for(let e=0;e<1e3;e++){const e=a(d,c);if(s.has(e)){h=!1;break}s.add(e),l.push(d);const r=i.get(d),p=i.get(c),g=Math.atan2(r.y-p.y,r.x-p.x),u=o.get(c);if(!u||0===u.length){h=!1;break}let f=null;for(const t of u)if(t.angle>g){f=t;break}if(f||(f=u[0]),d=c,c=f.targetId,d===t&&c===n.targetId)break;if(d===t)break}h&&l.length>=3&&r.push(l.map(t=>{const e=i.get(t);return{x:e.x,y:e.y}}))}const l=[];for(const t of r){const e=je(t),i=Math.abs(e);if(i<100)continue;if(e>0)continue;const o=qe(t);l.push({vertices:t,area:i,centroid:o})}const d=new Map;for(const t of l){const e=t.vertices.map(t=>`${Math.round(t.x)},${Math.round(t.y)}`).sort().join("|");(!d.has(e)||d.get(e).area<t.area)&&d.set(e,t)}return Array.from(d.values())}(t.nodes,t.edges),o=[...t.rooms],n=new Set;let s=this._getNextRoomNumber(o)-1;for(const r of i){let i=null,a=0;for(const t of o){if(n.has(t.id))continue;const e=t.polygon.vertices,o=r.vertices,s=this._getPolygonCenter(e);if(!s)continue;const l=r.centroid,d=Math.sqrt((s.x-l.x)**2+(s.y-l.y)**2);let c=0;e.length===o.length&&(c+=.5),d<200&&(c+=.5*(1-d/200)),c>.3&&c>a&&(a=c,i=t)}if(i){n.add(i.id);if(this._verticesChanged(i.polygon.vertices,r.vertices))try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,polygon:{vertices:r.vertices}})}catch(t){console.error("Error updating room polygon:",t)}}else{s++;try{await this.hass.callWS({type:"inhabit/rooms/add",floor_plan_id:e.id,floor_id:t.id,name:`Room ${s}`,polygon:{vertices:r.vertices},color:this._getRandomRoomColor()})}catch(t){console.error("Error creating auto-detected room:",t)}}}for(const t of o)if(!n.has(t.id))try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:e.id,room_id:t.id})}catch(t){console.error("Error deleting orphaned room:",t)}await se()}_verticesChanged(t,e){if(t.length!==e.length)return!0;for(let i=0;i<t.length;i++)if(Math.abs(t[i].x-e[i].x)>1||Math.abs(t[i].y-e[i].y)>1)return!0;return!1}_getNextRoomNumber(t){let e=0;for(const i of t){const t=i.name.match(/^Room (\d+)$/);t&&(e=Math.max(e,parseInt(t[1],10)))}return e+1}_getAssignedHaAreaIds(t){const e=new Set,i=Wt.value;if(!i)return e;for(const o of i.floors){for(const i of o.rooms)i.id!==t?.roomId&&i.ha_area_id&&e.add(i.ha_area_id);for(const i of o.zones)i.id!==t?.zoneId&&i.ha_area_id&&e.add(i.ha_area_id)}return e}async _handleRoomEditorSave(){if(!this._roomEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const{room:i,editName:o,editColor:n,editAreaId:s}=this._roomEditor;try{await this.hass.callWS({type:"inhabit/rooms/update",floor_plan_id:e.id,room_id:i.id,name:o,color:n,ha_area_id:s}),await se()}catch(t){console.error("Error updating room:",t)}this._roomEditor=null,Bt.value={type:"none",ids:[]}}_handleRoomEditorCancel(){this._roomEditor=null,Bt.value={type:"none",ids:[]}}async _handleRoomDelete(){if(!this._roomEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/rooms/delete",floor_plan_id:t.id,room_id:this._roomEditor.room.id}),await se()}catch(t){console.error("Error deleting room:",t)}this._roomEditor=null,Bt.value={type:"none",ids:[]}}}_renderRoomEditor(){if(!this._roomEditor)return null;const t=this._getAssignedHaAreaIds({roomId:this._roomEditor.room.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._roomEditor?.editAreaId);return V`
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
            ${e.map(t=>V`
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
            ${["rgba(156, 156, 156, 0.3)","rgba(244, 143, 177, 0.3)","rgba(129, 199, 132, 0.3)","rgba(100, 181, 246, 0.3)","rgba(255, 183, 77, 0.3)","rgba(186, 104, 200, 0.3)","rgba(77, 208, 225, 0.3)","rgba(255, 213, 79, 0.3)"].map(t=>V`
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
    `}_renderEdgeChains(t,e,i=null){const o=Ze(t);let n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:t.startPos,endPos:t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}));if(this._draggingNode){const{positions:e,blocked:i,blockedBy:s}=Fe(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y);i?s&&this._blinkEdges(s):n=o.map(t=>({id:t.id,start_node:t.start_node,end_node:t.end_node,startPos:e.get(t.start_node)??t.startPos,endPos:e.get(t.end_node)??t.endPos,thickness:t.thickness,type:t.type,opening_parts:t.opening_parts,opening_type:t.opening_type,swing_direction:t.swing_direction,entity_id:t.entity_id}))}const s=function(t){const e=t.filter(t=>"wall"===t.type);if(0===e.length)return[];const i=new Set,o=[];for(const t of e){if(i.has(t.id))continue;const n=[t];i.add(t.id);let s=t.end_node,r=!0;for(;r;){r=!1;for(const t of e)if(!i.has(t.id)){if(t.start_node===s){n.push(t),i.add(t.id),s=t.end_node,r=!0;break}if(t.end_node===s){n.push({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),i.add(t.id),s=t.start_node,r=!0;break}}}let a=t.start_node;for(r=!0;r;){r=!1;for(const t of e)if(!i.has(t.id)){if(t.end_node===a){n.unshift(t),i.add(t.id),a=t.start_node,r=!0;break}if(t.start_node===a){n.unshift({...t,start_node:t.end_node,end_node:t.start_node,startPos:t.endPos,endPos:t.startPos}),i.add(t.id),a=t.end_node,r=!0;break}}}o.push(n)}return o}(n),r="edge"===e.type?n.filter(t=>e.ids.includes(t.id)):[],a=Gt.value.get(t.id),l=a?new Set(a.map(t=>t.edgeId)):new Set,d=n.filter(t=>"door"===t.type||"window"===t.type),c=[];for(const t of s)if(i){let e=[],o=!1;for(const n of t){const t=i.has(n.id);0===e.length?(e.push(n),o=t):t===o?e.push(n):(c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"}),e=[n],o=t)}e.length>0&&c.push({edges:e,dimClass:o?"edges-focused":"edges-dimmed"})}else c.push({edges:t,dimClass:""});return H`
      <!-- Base edges rendered as chains (split by focus state) -->
      ${c.map(t=>H`
        <path class="wall ${t.dimClass}"
              d="${function(t){if(0===t.length)return"";const e=t[0].thickness/2,i=[t[0].start];for(const e of t)i.push(e.end);const o=i.length>2&&Math.abs(i[0].x-i[i.length-1].x)<1&&Math.abs(i[0].y-i[i.length-1].y)<1,n=[],s=[];for(let t=0;t<i.length;t++){const r=i[t];let a,l=null,d=null;if(t>0||o){const e=i[t>0?t-1:i.length-2],o=r.x-e.x,n=r.y-e.y,s=Math.sqrt(o*o+n*n);s>0&&(l={x:o/s,y:n/s})}if(t<i.length-1||o){const e=i[t<i.length-1?t+1:1],o=e.x-r.x,n=e.y-r.y,s=Math.sqrt(o*o+n*n);s>0&&(d={x:o/s,y:n/s})}if(l&&d){const t={x:-l.y,y:l.x},e={x:-d.y,y:d.x},i=t.x+e.x,o=t.y+e.y,n=Math.sqrt(i*i+o*o);if(n<.01)a=t;else{a={x:i/n,y:o/n};const e=t.x*a.x+t.y*a.y;if(Math.abs(e)>.1){const t=1/e,i=Math.min(Math.abs(t),3)*Math.sign(t);a={x:a.x*i,y:a.y*i}}}}else a=l?{x:-l.y,y:l.x}:d?{x:-d.y,y:d.x}:{x:1,y:0};n.push({x:r.x+a.x*e,y:r.y+a.y*e}),s.push({x:r.x-a.x*e,y:r.y-a.y*e})}const r=Math.min(.8*e,4);let a=`M${n[0].x},${n[0].y}`;for(let t=1;t<n.length;t++)if(t<n.length-1&&n.length>2){const e=n[t-1],i=n[t],o=n[t+1],s=i.x-e.x,l=i.y-e.y,d=Math.sqrt(s*s+l*l),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=i.x-s/d*g,e=i.y-l/d*g,o=i.x+c/p*u,n=i.y+h/p*u;a+=` L${t},${e} Q${i.x},${i.y} ${o},${n}`}else a+=` L${i.x},${i.y}`}else a+=` L${n[t].x},${n[t].y}`;const l=[...s].reverse();if(o){a+=` L${s[s.length-1].x},${s[s.length-1].y}`;for(let t=s.length-2;t>=0;t--){const e=s.length-1-t;if(e>0&&e<s.length-1){const e=s[t+1],i=s[t],o=s[t-1],n=i.x-e.x,l=i.y-e.y,d=Math.sqrt(n*n+l*l),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=i.x-n/d*g,e=i.y-l/d*g,o=i.x+c/p*u,s=i.y+h/p*u;a+=` L${t},${e} Q${i.x},${i.y} ${o},${s}`}else a+=` L${i.x},${i.y}`}else a+=` L${s[t].x},${s[t].y}`}}else for(let t=0;t<l.length;t++)if(t>0&&t<l.length-1&&l.length>2){const e=l[t-1],i=l[t],o=l[t+1],n=i.x-e.x,s=i.y-e.y,d=Math.sqrt(n*n+s*s),c=o.x-i.x,h=o.y-i.y,p=Math.sqrt(c*c+h*h),g=Math.min(r,d/2),u=Math.min(r,p/2);if(d>0&&p>0){const t=i.x-n/d*g,e=i.y-s/d*g,o=i.x+c/p*u,r=i.y+h/p*u;a+=` L${t},${e} Q${i.x},${i.y} ${o},${r}`}else a+=` L${i.x},${i.y}`}else a+=` L${l[t].x},${l[t].y}`;return a+=" Z",a}(t.edges.map(t=>({start:t.startPos,end:t.endPos,thickness:t.thickness})))}"/>
      `)}

      <!-- Door and window openings -->
      ${d.map(t=>{const e=this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness}),o=!!i&&i.has(t.id),n=i?o?"edges-focused":"edges-dimmed":"";let s=0;if(t.entity_id&&this.hass?.states[t.entity_id]){const e=this.hass.states[t.entity_id],i=e.state;if("on"===i||"open"===i){const i="door"===t.type?ni:Math.PI/2,o=e.attributes.current_position;s=void 0!==o&&o>=0&&o<=100?o/100*i:i}}const r=this._swingAngles.get(t.id)??0;let a=r;const l=s-r;Math.abs(l)>.001?(a=r+.15*l,this._swingAngles.set(t.id,a),this._swingRaf||(this._swingRaf=requestAnimationFrame(()=>{this._swingRaf=null,this.requestUpdate()}))):a!==s&&(a=s,this._swingAngles.set(t.id,s));const d=t.endPos.x-t.startPos.x,c=t.endPos.y-t.startPos.y,h=Math.sqrt(d*d+c*c);if(0===h)return null;const p=d/h,g=c/h,u=-g,f=p,_=t.opening_parts??"single",y=t.opening_type??"swing",v="window"===t.type?"window":"door";if("swing"===y){const e=.5*t.thickness,i=.7*t.thickness,o=1.5,s=(t,o)=>{const n=t.x,s=t.y,r=n+p*o*e,a=s+g*o*e;return`M${n-u*i},${s-f*i}\n                    L${n+u*i},${s+f*i}\n                    L${r+u*i},${a+f*i}\n                    L${r-u*i},${a-f*i} Z`},r=e+o,l={x:t.startPos.x+p*r,y:t.startPos.y+g*r},d={x:t.endPos.x-p*r,y:t.endPos.y-g*r},c=t.swing_direction??"left",y="right"===c?t.endPos:t.startPos,m="right"===c?-1:1,x=y.x+p*m*e+u*(t.thickness/2),b=y.y+g*m*e+f*(t.thickness/2);if("door"===v){const e=t.thickness/2,i=y.x+u*e,o=y.y+f*e,r="right"===c?t.startPos:t.endPos,p=r.x+u*e,g=r.y+f*e,_=si(i,o,p,g,85,"left"===c),v=`M${i},${o} L${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy} Z`,m=Math.cos(a),w=Math.sin(a),$="left"===c?1:-1,k=t=>{const e=t.x-x,i=t.y-b;return{x:x+m*e-$*w*i,y:b+$*w*e+m*i}},E=k(l),P=k(d),S=this._singleEdgePath({start:E,end:P,thickness:t.thickness});return H`
              <g class="${n}">
                ${this._fadedWedge(t.id,v,i,o,h,"rgba(120, 144, 156, 0.08)")}
                <path class="door-swing"
                      d="M${p},${g} C${_.cp1x},${_.cp1y} ${_.cp2x},${_.cp2y} ${_.ox},${_.oy}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="door-closed-segment" d="${S}"/>
                <circle class="metal-hinge" cx="${x}" cy="${b}" r="2.5"/>
              </g>
            `}const w=t.thickness/2,$=y.x+u*w,k=y.y+f*w,E="right"===c?t.startPos:t.endPos,P=E.x+u*w,S=E.y+f*w,M=$+u*h,I=k+f*h,C=.5522847498,z=P+C*(M-$),A=S+C*(I-k),T=M+C*(P-$),D=I+C*(S-k),L=`M${P},${S} C${z},${A} ${T},${D} ${M},${I}`,N=`M${$},${k} L${P},${S} C${z},${A} ${T},${D} ${M},${I} Z`;if("double"===_){const i=(l.x+d.x)/2,r=(l.y+d.y)/2,c=.5*o,_=(t.startPos.x+t.endPos.x)/2,y=(t.startPos.y+t.endPos.y)/2,v=h/2,m=t.startPos.x+u*w,x=t.startPos.y+f*w,b=t.endPos.x+u*w,$=t.endPos.y+f*w,k=_+u*w,E=y+f*w,P=m+u*v,S=x+f*v,M=b+u*v,I=$+f*v,z=k+C*(P-m),A=E+C*(S-x),T=P+C*(k-m),D=S+C*(E-x),L=k+C*(M-b),N=E+C*(I-$),W=M+C*(k-b),F=I+C*(E-$),R=`M${m},${x} L${k},${E} C${z},${A} ${T},${D} ${P},${S} Z`,O=`M${b},${$} L${k},${E} C${L},${N} ${W},${F} ${M},${I} Z`,B=Math.cos(a),U=Math.sin(a),Z=(t,e,i,o)=>{const n=t.x-e,s=t.y-i;return{x:e+B*n-o*U*s,y:i+o*U*n+B*s}},V=t.startPos.x+p*e+u*(t.thickness/2),j=t.startPos.y+g*e+f*(t.thickness/2),q=t.endPos.x-p*e+u*(t.thickness/2),Y=t.endPos.y-g*e+f*(t.thickness/2),X={x:i-p*c,y:r-g*c},K={x:i+p*c,y:r+g*c},G=this._singleEdgePath({start:Z(l,V,j,1),end:Z(X,V,j,1),thickness:t.thickness}),J=this._singleEdgePath({start:Z(K,q,Y,-1),end:Z(d,q,Y,-1),thickness:t.thickness});return H`
              <g class="${n}">
                ${this._fadedWedge(`${t.id}-l`,R,m,x,v,"rgba(100, 181, 246, 0.06)")}
                ${this._fadedWedge(`${t.id}-r`,O,b,$,v,"rgba(100, 181, 246, 0.06)")}
                <path class="door-swing"
                      d="M${k},${E} C${z},${A} ${T},${D} ${P},${S}"/>
                <path class="door-swing"
                      d="M${k},${E} C${L},${N} ${W},${F} ${M},${I}"/>
                <path class="opening-stop" d="${s(t.startPos,1)}"/>
                <path class="opening-stop" d="${s(t.endPos,-1)}"/>
                <path class="window-closed-segment" d="${G}"/>
                <path class="window-closed-segment" d="${J}"/>
              </g>
            `}const W=Math.cos(a),F=Math.sin(a),R="left"===c?1:-1,O=t=>{const e=t.x-x,i=t.y-b;return{x:x+W*e-R*F*i,y:b+R*F*e+W*i}},B=this._singleEdgePath({start:O(l),end:O(d),thickness:t.thickness});return H`
            <g class="${n}">
              ${this._fadedWedge(t.id,N,$,k,h,"rgba(100, 181, 246, 0.06)")}
              <path class="door-swing" d="${L}"/>
              <path class="opening-stop" d="${s(t.startPos,1)}"/>
              <path class="opening-stop" d="${s(t.endPos,-1)}"/>
              <path class="window-closed-segment" d="${B}"/>
            </g>
          `}if("sliding"===y){const i=.3*t.thickness,o=3,s=t.endPos.x+u*i,r=t.endPos.y+f*i,a=t.startPos.x-u*i,l=t.startPos.y-f*i;return H`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
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
              ${"window"===v?H`
                <line class="window-pane"
                      x1="${t.startPos.x}" y1="${t.startPos.y}"
                      x2="${t.endPos.x}" y2="${t.endPos.y}"/>
              `:null}
              <line class="door-jamb" x1="${t.startPos.x-u*t.thickness/2}" y1="${t.startPos.y-f*t.thickness/2}" x2="${t.startPos.x+u*t.thickness/2}" y2="${t.startPos.y+f*t.thickness/2}"/>
              <line class="door-jamb" x1="${t.endPos.x-u*t.thickness/2}" y1="${t.endPos.y-f*t.thickness/2}" x2="${t.endPos.x+u*t.thickness/2}" y2="${t.endPos.y+f*t.thickness/2}"/>
            </g>
          `}if("tilt"===y){const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,s=.25*h;return H`
            <g class="${n}">
              <path class="${v}" d="${e}"/>
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
      ${l.size>0?n.filter(t=>l.has(t.id)).map(t=>H`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
        `):null}

      <!-- Selected edge highlights -->
      ${r.map(t=>H`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({start:t.startPos,end:t.endPos,thickness:t.thickness})}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length>0?this._blinkingEdgeIds.map(t=>{const e=n.find(e=>e.id===t);return e?H`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({start:e.startPos,end:e.endPos,thickness:e.thickness})}"/>
        `:null}):null}
    `}_fadedWedge(t,e,i,o,n,s){return H`
      <defs>
        <radialGradient id="wg-${t}" cx="${i}" cy="${o}" r="${n}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="${s}"/>
        </radialGradient>
      </defs>
      <path d="${e}" fill="url(#wg-${t})" stroke="none"/>
    `}_singleEdgePath(t){const{start:e,end:i,thickness:o}=t,n=i.x-e.x,s=i.y-e.y,r=Math.sqrt(n*n+s*s);if(0===r)return"";const a=-s/r*(o/2),l=n/r*(o/2);return`M${e.x+a},${e.y+l}\n            L${i.x+a},${i.y+l}\n            L${i.x-a},${i.y-l}\n            L${e.x-a},${e.y-l}\n            Z`}_blinkEdges(t){this._blinkTimer&&clearTimeout(this._blinkTimer);const e=Array.isArray(t)?t:[t];this._blinkingEdgeIds=e;const i=Ft.value;if(i){const t=e.map(t=>{const e=i.edges.find(e=>e.id===t);if(!e)return t.slice(0,8)+"…";const o=i.nodes.find(t=>t.id===e.start_node),n=i.nodes.find(t=>t.id===e.end_node),s=o&&n?Math.sqrt((n.x-o.x)**2+(n.y-o.y)**2).toFixed(1):"?",r=[];return"free"!==e.direction&&r.push(e.direction),e.length_locked&&r.push("len-locked"),e.angle_group&&r.push(`ang:${e.angle_group.slice(0,4)}`),`${t.slice(0,8)}… (${s}cm${r.length?" "+r.join(","):""})`});console.warn(`%c[constraint]%c Blinking ${e.length} blocked edge(s):\n  ${t.join("\n  ")}`,"color:#8b5cf6;font-weight:bold","")}this._blinkTimer=setTimeout(()=>{this._blinkingEdgeIds=[],this._blinkTimer=null},1800)}_calculateWallLength(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}_formatLength(t){return t>=100?`${(t/100).toFixed(2)}m`:`${Math.round(t)}cm`}_getRoomEdgeIds(t,e){const i=e.rooms.find(e=>e.id===t);if(!i)return new Set;const o=i.polygon.vertices;if(o.length<2)return new Set;const n=[];for(const t of o){const i=He(t,e.nodes,5);i&&n.push(i.id)}if(n.length<2)return new Set;const s=new Map;for(const t of e.edges)s.set(`${t.start_node}|${t.end_node}`,t.id),s.set(`${t.end_node}|${t.start_node}`,t.id);const r=new Set;for(let t=0;t<n.length;t++){const e=n[t],i=n[(t+1)%n.length],o=s.get(`${e}|${i}`);o&&r.add(o)}return r}_renderFloor(){const t=Ft.value;if(!t)return null;const e=Bt.value,i=jt.value,o=this._focusedRoomId,n=o?this._getRoomEdgeIds(o,t):null,s=i.find(t=>"background"===t.id),r=i.find(t=>"structure"===t.id),a=i.find(t=>"furniture"===t.id),l=i.find(t=>"labels"===t.id),d="furniture"===this._canvasMode&&("zone"===Ot.value||!!this._zoneEditor),c=a?.visible?H`
      <g class="furniture-layer-container" opacity="${a.opacity??1}">
        ${this._renderFurnitureLayer()}
      </g>
    `:null,h=r?.visible?H`
      <g class="structure-layer" opacity="${r.opacity??1}">
        <!-- Edges (rendered as chains for proper corners) -->
        ${this._renderEdgeChains(t,e,n)}
      </g>
    `:null;return H`
      <!-- Background layer -->
      ${s?.visible&&t.background_image?H`
        <image href="${t.background_image}"
               x="0" y="0"
               width="${1e3*t.background_scale}"
               height="${800*t.background_scale}"
               opacity="${s.opacity??1}"
               class="${o?"room-dimmed":""}"/>
      `:null}

      <!-- Structure layer (rooms) -->
      ${r?.visible?H`
        <g class="structure-layer" opacity="${r.opacity??1}">
          <!-- Rooms -->
          ${t.rooms.map(t=>H`
            <path class="room ${"room"===e.type&&e.ids.includes(t.id)?"selected":""} ${o?t.id===o?"room-focused":"room-dimmed":""}"
                  d="${re(t.polygon)}"
                  fill="${t.color}"
                  stroke="var(--divider-color, #999)"
                  stroke-width="1"/>
          `)}
        </g>
      `:null}

      ${d?h:c}
      ${d?c:h}

      <!-- Labels layer -->
      ${l?.visible?H`
        <g class="labels-layer" opacity="${l.opacity??1}">
          ${t.rooms.map(t=>{const e=this._getPolygonCenter(t.polygon.vertices);if(!e)return null;const i=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id)?.name??t.name:t.name,n=!!t.ha_area_id;return H`
              <g class="room-label-group ${o?t.id===o?"label-focused":"label-dimmed":""}" transform="translate(${e.x}, ${e.y})">
                <text class="room-label" x="0" y="0">
                  ${i}
                </text>
                ${n?H`
                  <g class="room-link-icon" transform="translate(${3.8*i.length+4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                `:null}
              </g>
            `})}
        </g>
      `:null}
    `}_isDeviceInFocusedRegion(t,e,i,o){if(t===i)return!0;const n=o.zones?.find(t=>t.id===i);if(n?.polygon?.vertices&&this._pointInOrNearPolygon(e,n.polygon.vertices,5))return!0;const s=o.rooms.find(t=>t.id===i);return!(!s||!this._pointInOrNearPolygon(e,s.polygon.vertices,5))}_renderDeviceLayer(t){const e=jt.value,i=this._focusedRoomId;return e.find(t=>"devices"===t.id)?.visible?H`
      <g class="devices-layer" opacity="${e.find(t=>"devices"===t.id)?.opacity??1}">
        ${qt.value.filter(e=>e.floor_id===t.id).map(e=>H`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderLight(e)}
            </g>
          `)}
        ${Yt.value.filter(e=>e.floor_id===t.id).map(e=>H`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderSwitch(e)}
            </g>
          `)}
        ${Xt.value.filter(e=>e.floor_id===t.id).map(e=>H`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderButton(e)}
            </g>
          `)}
        ${Kt.value.filter(e=>e.floor_id===t.id).map(e=>H`
            <g class="${i?this._isDeviceInFocusedRegion(e.room_id,e.position,i,t)?"device-focused":"device-dimmed":""}">
              ${this._renderOther(e)}
            </g>
          `)}
        ${this._renderMmwaveLayer(t)}
      </g>
    `:null}_renderDeviceIcon(t,e,i,o,n,s,r,a,l){const d=Bt.value,c=this._getIconData("mdi:devices"),h=l??c,p=h?.viewBox??"0 0 24 24";return H`
      <g class="device-marker ${i?"on":"off"} ${d.type===o&&d.ids.includes(n)?"selected":""}"
         transform="translate(${t}, ${e})">
        <circle r="${14}" fill="${i?r:"#e0e0e0"}" stroke="#333" stroke-width="2"/>
        ${h?.path?H`
          <svg x="${-9}" y="${-9}" width="${18}" height="${18}" viewBox="${p}">
            <path d="${h.path}" fill="${a}"></path>
            ${h.secondaryPath?H`<path d="${h.secondaryPath}" fill="${a}"></path>`:null}
          </svg>
        `:null}
        <text y="${26}" text-anchor="middle" font-size="10" fill="#333">${s}</text>
      </g>
    `}_renderLight(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:lightbulb");return this._renderDeviceIcon(t.position.x,t.position.y,i,"light",t.id,o,"#ffd600",i?"#333":"#616161",n)}_renderSwitch(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:toggle-switch");return this._renderDeviceIcon(t.position.x,t.position.y,i,"switch",t.id,o,"#4caf50",i?"#fff":"#616161",n)}_renderButton(t){const e=this.hass?.states[t.entity_id],i=t.label||e?.attributes.friendly_name||t.entity_id,o=this._getEntityIconData(e,"mdi:gesture-tap-button");return this._renderDeviceIcon(t.position.x,t.position.y,!1,"button",t.id,i,"#2196f3","#616161",o)}_renderOther(t){const e=this.hass?.states[t.entity_id],i="on"===e?.state,o=t.label||e?.attributes.friendly_name||t.entity_id,n=this._getEntityIconData(e,"mdi:devices");return this._renderDeviceIcon(t.position.x,t.position.y,i,"other",t.id,o,"#9c27b0",i?"#fff":"#616161",n)}_renderMmwaveLayer(t){const e=ee.value.filter(e=>e.floor_id===t.id);if(0===e.length)return null;const i=Bt.value,o="viewing"!==this._canvasMode;return H`
      <g class="mmwave-layer">
        ${e.map(t=>{const e="mmwave"===i.type&&i.ids.includes(t.id),n=t.field_of_view/2,s=t.detection_range,r=t.position.x,a=t.position.y,l=(t.angle-n)*Math.PI/180,d=(t.angle+n)*Math.PI/180,c=r+s*Math.cos(l),h=a+s*Math.sin(l),p=r+s*Math.cos(d),g=a+s*Math.sin(d),u=t.field_of_view>180?1:0,f=t.angle*Math.PI/180,_=r+30*Math.cos(f),y=a+30*Math.sin(f),v=(t.targets??[]).map(e=>{if(!e.x_entity_id||!e.y_entity_id)return null;const i=this.hass?.states[e.x_entity_id],o=this.hass?.states[e.y_entity_id];if(!i||!o)return null;const n=parseFloat(i.state),s=parseFloat(o.state);if(isNaN(n)||isNaN(s)||0===n&&0===s)return null;const l=t.angle*Math.PI/180,d=Math.cos(l),c=Math.sin(l);return H`<circle cx="${r+n*d-s*c}" cy="${a+n*c+s*d}" r="5" fill="#ff5722" stroke="#fff" stroke-width="1.5" opacity="0.9"/>`});return H`
            <g class="mmwave-placement ${e?"selected":""}">
              ${o?H`
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
              ${v}
              ${o&&e?H`
                <!-- Rotation handle -->
                <g class="rotation-handle"
                   data-mmwave-id="${t.id}"
                   @pointerdown=${e=>this._startMmwaveRotation(e,t)}>
                  <line class="rotation-handle-line"
                    x1="${r}" y1="${a}" x2="${_}" y2="${y}" />
                  <circle class="rotation-handle-dot"
                    cx="${_}" cy="${y}" r="4.5" />
                </g>
              `:null}
            </g>
          `})}
      </g>
    `}_renderNodeGuideDots(){const t=Ft.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=t.nodes.filter(t=>e.has(t.id));return 0===i.length?null:H`
      <g class="node-guide-dots">
        ${i.map(t=>H`
          <circle cx="${t.x}" cy="${t.y}" r="4"
            fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        `)}
      </g>
    `}_renderNodeEndpoints(){const t=Ft.value;if(!t||0===t.nodes.length)return null;const e=new Set;for(const i of t.edges)e.add(i.start_node),e.add(i.end_node);const i=[];for(const o of t.nodes)o.pinned&&e.has(o.id)&&i.push({node:o,coords:{x:o.x,y:o.y},isDragging:!1,isPinned:!0});if(this._draggingNode&&e.has(this._draggingNode.node.id)){const e=i.findIndex(t=>t.node.id===this._draggingNode.node.id);e>=0&&i.splice(e,1);const{positions:o,blocked:n}=Fe(t.nodes,t.edges,this._draggingNode.node.id,this._cursorPos.x,this._cursorPos.y),s=n?this._draggingNode.originalCoords:o.get(this._draggingNode.node.id)??this._cursorPos;i.push({node:this._draggingNode.node,coords:s,isDragging:!0,isPinned:!1})}else this._hoveredNode&&e.has(this._hoveredNode.id)&&(i.some(t=>t.node.id===this._hoveredNode.id)||i.push({node:this._hoveredNode,coords:{x:this._hoveredNode.x,y:this._hoveredNode.y},isDragging:!1,isPinned:!1}));if(0===i.length)return null;return H`
      <g class="wall-endpoints-layer">
        ${i.map(t=>t.isPinned?H`
          <g class="wall-endpoint pinned"
             transform="translate(${t.coords.x}, ${t.coords.y})"
             @pointerdown=${e=>this._handleNodePointerDown(e,t.node)}>
            <rect x="-5" y="-5" width="10" height="10" rx="2" />
            <g transform="translate(-6, -18) scale(0.5)">
              <path d="${"M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"}" fill="var(--primary-color, #2196f3)" />
            </g>
          </g>
        `:H`
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
    `}_renderDraggedEdgeLengths(t){if(!this._draggingNode)return null;const e=this._cursorPos,{positions:i,blocked:o}=Fe(t.nodes,t.edges,this._draggingNode.node.id,e.x,e.y);if(o)return null;const n=Ze(t),s=[];for(const t of n){const e=i.get(t.start_node),o=i.get(t.end_node);if(!e&&!o)continue;const n=e??t.startPos,r=o??t.endPos,a=this._calculateWallLength(n,r),l=Math.atan2(r.y-n.y,r.x-n.x);s.push({start:n,end:r,origStart:t.startPos,origEnd:t.endPos,length:a,angle:l,thickness:t.thickness})}const r=[];for(let t=0;t<s.length;t++)for(let i=t+1;i<s.length;i++){const o=Math.abs(s[t].angle-s[i].angle)%Math.PI;Math.abs(o-Math.PI/2)<.02&&r.push({point:e,angle:Math.min(s[t].angle,s[i].angle)})}return H`
      <!-- Original edge positions (ghost) -->
      ${s.map(({origStart:t,origEnd:e,thickness:i})=>{const o=e.x-t.x,n=e.y-t.y,s=Math.sqrt(o*o+n*n);if(0===s)return null;const r=-n/s*(i/2),a=o/s*(i/2);return H`
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
      ${s.map(({start:t,end:e,length:i})=>{const o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI);return H`
          <g transform="translate(${o}, ${n}) rotate(${s>90||s<-90?s+180:s})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(i)}</text>
          </g>
        `})}

      <!-- 90-degree angle indicators -->
      ${r.map(({point:t,angle:e})=>H`
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
    `}_handleNodePointerDown(t,e){if(2===t.button)return;t.stopPropagation(),t.preventDefault();const i=this._hoveredNode||e;if("wall"===Ot.value){const e={x:i.x,y:i.y};return void this._handleWallClick(e,t.shiftKey)}if(i.pinned)return this._wallStartPoint={x:i.x,y:i.y},Ot.value="wall",void(this._hoveredNode=null);this._draggingNode={node:i,originalCoords:{x:i.x,y:i.y},startX:t.clientX,startY:t.clientY,hasMoved:!1},this._svg?.setPointerCapture(t.pointerId)}_handleZonePolyClick(t){const e=this._zonePolyPoints;if(e.length>=3){const i=e[0];if(Math.sqrt((t.x-i.x)**2+(t.y-i.y)**2)<15)return this._pendingZonePolygon=[...e],this._zonePolyPoints=[],void this._saveZone("Zone")}this._zonePolyPoints=[...e,t]}async _saveZone(t){if(!this.hass||!this._pendingZonePolygon)return;const e=Ft.value,i=Wt.value;if(e&&i){try{await this.hass.callWS({type:"inhabit/zones/add",floor_plan_id:i.id,floor_id:e.id,name:t,polygon:{vertices:this._pendingZonePolygon.map(t=>({x:t.x,y:t.y}))},color:"#a1c4fd"}),await se()}catch(t){console.error("Error saving zone:",t)}this._pendingZonePolygon=null}}_renderFurnitureLayer(){const t=Ft.value;if(!t||!t.zones||0===t.zones.length)return null;const e=Bt.value,i=this._focusedRoomId,o=t.zones,n=i?t.rooms.find(t=>t.id===i):null;return H`
      <g class="furniture-layer">
        ${o.map(t=>{if(!t.polygon?.vertices?.length)return null;const o=re(t.polygon),s="zone"===e.type&&e.ids.includes(t.id),r=this._getPolygonCenter(t.polygon.vertices),a=i&&(t.id===i||t.room_id===i||n&&r&&this._pointInOrNearPolygon(r,n.polygon.vertices,5));return H`
            <g class="${i?a?"":"room-dimmed":""}">
              <path class="zone-shape ${s?"selected":""}"
                    d="${o}"
                    fill="${t.color||"#a1c4fd"}"
                    fill-opacity="0.35"
                    stroke="${t.color||"#a1c4fd"}"
                    stroke-width="1.5"/>
              ${r?H`
                <text class="zone-label" x="${r.x}" y="${r.y}">${t.name}</text>
              `:null}
              ${s&&!this._draggingZone?this._renderZoneVertexHandles(t):null}
            </g>
          `})}
      </g>
    `}_renderZoneVertexHandles(t){const e=t.polygon?.vertices;return e?.length?H`
      ${e.map((e,i)=>H`
        <circle
          class="zone-vertex-handle"
          cx="${e.x}" cy="${e.y}" r="6"
          fill="white" stroke="${t.color||"#2196f3"}" stroke-width="1.5"
          style="cursor: grab"
          @pointerdown=${o=>{o.stopPropagation(),o.preventDefault(),this._draggingZoneVertex={zone:t,vertexIndex:i,originalCoords:{x:e.x,y:e.y},pointerId:o.pointerId},this._svg?.setPointerCapture(o.pointerId)}}
        />
      `)}
    `:null}_renderFurnitureDrawingPreview(){if("zone"===Ot.value&&this._zonePolyPoints.length>0){const t=this._zonePolyPoints,e=this._cursorPos;let i=`M ${t[0].x} ${t[0].y}`;for(let e=1;e<t.length;e++)i+=` L ${t[e].x} ${t[e].y}`;i+=` L ${e.x} ${e.y}`;let o=null;if(t.length>=3){const i=t[0];Math.sqrt((e.x-i.x)**2+(e.y-i.y)**2)<15&&(o=H`<circle cx="${i.x}" cy="${i.y}" r="8" fill="rgba(76, 175, 80, 0.3)" stroke="#4caf50" stroke-width="2"/>`)}return H`
        <g class="furniture-preview">
          <path class="furniture-poly-preview" d="${i}"/>
          ${t.map(t=>H`
            <circle cx="${t.x}" cy="${t.y}" r="4" fill="var(--primary-color, #2196f3)" stroke="white" stroke-width="1.5"/>
          `)}
          ${o}
        </g>
      `}return null}_renderZoneEditor(){if(!this._zoneEditor)return null;const t=this._getAssignedHaAreaIds({zoneId:this._zoneEditor.zone.id}),e=this._haAreas.filter(e=>!t.has(e.area_id)||e.area_id===this._zoneEditor?.editAreaId);return V`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Zone</span>
          <button class="wall-editor-close" @click=${()=>{this._zoneEditor=null,Bt.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Area</span>
          <select class="wall-editor-select"
            .value=${this._zoneEditor.editAreaId??""}
            @change=${t=>{if(!this._zoneEditor)return;const e=t.target.value,i=this._haAreas.find(t=>t.area_id===e);this._zoneEditor={...this._zoneEditor,editAreaId:e||null,editName:i?i.name:this._zoneEditor.editName}}}
          >
            <option value="">None</option>
            ${e.map(t=>V`
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
            @keydown=${t=>{"Enter"===t.key?this._handleZoneEditorSave():"Escape"===t.key&&(this._zoneEditor=null,Bt.value={type:"none",ids:[]})}}
          />
        </div>

        ${this._zoneEditor.zone.polygon?.vertices?.length?V`
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
            ${["#a1c4fd","#c5e1a5","#ffe0b2","#d1c4e9","#ffccbc","#b0bec5","#e0e0e0","#f8bbd0"].map(t=>V`
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
    `}_getZoneBBoxWidth(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.x);return Math.round(Math.max(...t)-Math.min(...t))}_getZoneBBoxHeight(){if(!this._zoneEditor?.zone.polygon?.vertices?.length)return 0;const t=this._zoneEditor.zone.polygon.vertices.map(t=>t.y);return Math.round(Math.max(...t)-Math.min(...t))}_handleZoneSizeChange(t,e){if(!this._zoneEditor||!this.hass||e<=0)return;const i=this._zoneEditor.zone,o=i.polygon?.vertices;if(!o?.length)return;const n=o.map(t=>t.x),s=o.map(t=>t.y),r=Math.min(...n),a=Math.max(...n),l=Math.min(...s),d=Math.max(...s),c=(r+a)/2,h=(l+d)/2,p=a-r,g=d-l;if(0===p||0===g)return;const u="width"===t?e/p:1,f="height"===t?e/g:1,_=o.map(t=>({x:c+(t.x-c)*u,y:h+(t.y-h)*f}));for(let t=0;t<o.length;t++)o[t]=_[t];this.requestUpdate();const y=Wt.value;y&&this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:y.id,zone_id:i.id,polygon:{vertices:_.map(t=>({x:t.x,y:t.y}))}}).then(()=>se()).catch(t=>console.error("Error resizing zone:",t))}async _handleZoneEditorSave(){if(!this._zoneEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id,name:this._zoneEditor.editName,color:this._zoneEditor.editColor,ha_area_id:this._zoneEditor.editAreaId??""}),await se()}catch(t){console.error("Error updating zone:",t)}this._zoneEditor=null,Bt.value={type:"none",ids:[]}}}async _handleZoneDelete(){if(!this._zoneEditor||!this.hass)return;const t=Wt.value;if(t){try{await this.hass.callWS({type:"inhabit/zones/delete",floor_plan_id:t.id,zone_id:this._zoneEditor.zone.id}),await se()}catch(t){console.error("Error deleting zone:",t)}this._zoneEditor=null,Bt.value={type:"none",ids:[]}}}async _finishZoneDrag(){if(!this._draggingZone||!this.hass)return;const t=Wt.value;if(!t)return;const e=this._draggingZone.zone;if(e.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:e.id,polygon:{vertices:e.polygon.vertices.map(t=>({x:t.x,y:t.y}))}}),await se()}catch(t){if(console.error("Error moving zone:",t),e.polygon?.vertices&&this._draggingZone.originalVertices)for(let t=0;t<e.polygon.vertices.length;t++)e.polygon.vertices[t]=this._draggingZone.originalVertices[t]}}async _finishZoneVertexDrag(){if(!this._draggingZoneVertex||!this.hass)return;const t=Wt.value;if(!t)return;const e=this._draggingZoneVertex.zone;if(e.polygon?.vertices)try{await this.hass.callWS({type:"inhabit/zones/update",floor_plan_id:t.id,zone_id:e.id,polygon:{vertices:e.polygon.vertices.map(t=>({x:t.x,y:t.y}))}}),await se()}catch(t){console.error("Error moving zone vertex:",t),e.polygon?.vertices&&this._draggingZoneVertex&&(e.polygon.vertices[this._draggingZoneVertex.vertexIndex]=this._draggingZoneVertex.originalCoords)}}_renderDrawingPreview(){if("wall"===Ot.value&&this._wallStartPoint){const t=this._wallStartPoint,e=this._cursorPos,i=this._calculateWallLength(t,e),o=(t.x+e.x)/2,n=(t.y+e.y)/2,s=Math.atan2(e.y-t.y,e.x-t.x)*(180/Math.PI),r=s>90||s<-90?s+180:s;return H`
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
      `}return null}_renderOpeningPreview(){if(!this._openingPreview)return null;const t=Ot.value;if("door"!==t&&"window"!==t)return null;const{position:e,startPos:i,endPos:o,thickness:n}=this._openingPreview,s="door"===t?80:100,r=o.x-i.x,a=o.y-i.y,l=Math.sqrt(r*r+a*a);if(0===l)return null;const d=r/l,c=a/l,h=-c,p=d,g=s/2,u=n/2,f=e.x,_=e.y,y=`M${f-d*g+h*u},${_-c*g+p*u}\n                      L${f+d*g+h*u},${_+c*g+p*u}\n                      L${f+d*g-h*u},${_+c*g-p*u}\n                      L${f-d*g-h*u},${_-c*g-p*u}\n                      Z`;if("window"===t)return H`
        <g class="opening-ghost">
          <path class="window" d="${y}"/>
          <line class="window-pane"
                x1="${f}" y1="${_}"
                x2="${f+h*n}" y2="${_+p*n}"/>
        </g>
      `;const v=f-d*g,m=_-c*g,x=f+d*g,b=_+c*g,w=si(v,m,x,b,85,!0),$=w.ox-v,k=w.oy-m,E=Math.sqrt($*$+k*k),P=E>0?-k/E*1.25:0,S=E>0?$/E*1.25:0,M=`M${v+P},${m+S} L${w.ox+P},${w.oy+S} L${w.ox-P},${w.oy-S} L${v-P},${m-S} Z`,I=`M${v},${m} L${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy} Z`,C=f-d*g,z=_-c*g,A=f+d*g,T=_+c*g;return H`
      <g class="opening-ghost">
        <path class="door" d="${y}"/>
        <path class="swing-wedge" d="${I}"/>
        <path class="door-leaf-panel" d="${M}"/>
        <path class="door-swing"
              d="M${x},${b} C${w.cp1x},${w.cp1y} ${w.cp2x},${w.cp2y} ${w.ox},${w.oy}"/>
        <line class="door-jamb" x1="${C-h*u}" y1="${z-p*u}" x2="${C+h*u}" y2="${z+p*u}"/>
        <line class="door-jamb" x1="${A-h*u}" y1="${T-p*u}" x2="${A+h*u}" y2="${T+p*u}"/>
        <circle class="hinge-glow" cx="${v}" cy="${m}" r="5"/>
        <circle class="hinge-dot" cx="${v}" cy="${m}" r="3"/>
      </g>
    `}_getPolygonCenter(t){if(0===t.length)return null;if(t.length<3){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/t.length,y:i/t.length}}let e=0,i=0,o=0;const n=t.length;for(let s=0;s<n;s++){const r=(s+1)%n,a=t[s].x*t[r].y-t[r].x*t[s].y;e+=a,i+=(t[s].x+t[r].x)*a,o+=(t[s].y+t[r].y)*a}if(e/=2,Math.abs(e)<1e-6){let e=0,i=0;for(const o of t)e+=o.x,i+=o.y;return{x:e/n,y:i/n}}const s=1/(6*e);return{x:i*s,y:o*s}}_renderEdgeEditor(){if(!this._edgeEditor)return null;const t=this._edgeEditor.edge,e="door"===t.type,i="window"===t.type,o=e||i;return V`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${e?"Door Properties":i?"Window Properties":"Wall Properties"}</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${t.link_group?(()=>{const e=Ft.value,i=t.link_group,o=e?e.edges.filter(t=>t.link_group===i).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${ai(i)};">
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

        ${t.collinear_group?(()=>{const e=Ft.value,i=t.collinear_group,o=e?e.edges.filter(t=>t.collinear_group===i).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${ai(i)};">
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

        ${o?(()=>{const e=Ft.value;if(!e)return null;const i=Be(e.nodes),o=i.get(t.start_node),n=i.get(t.end_node);if(!o||!n)return null;const s=(o.x+n.x)/2,r=(o.y+n.y)/2,a=n.x-o.x,l=n.y-o.y,d=Math.sqrt(a*a+l*l);if(0===d)return null;const c=-l/d,h=a/d,p=t.thickness/2+5,g={x:s+c*p,y:r+h*p},u={x:s-c*p,y:r-h*p},f=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(g,t.polygon.vertices)),_=e.rooms.find(t=>t.polygon.vertices.length>=3&&this._pointInPolygon(u,t.polygon.vertices)),y=f?.name||(t.is_exterior?"Outside":null),v=_?.name||(t.is_exterior?"Outside":null);return y||v?V`
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

        ${o?(()=>{const t=e?[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"}]:[{value:"swing",label:"Swing"},{value:"sliding",label:"Sliding"},{value:"tilt",label:"Tilt"}],i="swing"===this._editingOpeningType,o="double"===this._editingOpeningParts?[{value:"left",label:"Left & Right"}]:[{value:"left",label:"Left"},{value:"right",label:"Right"}];return V`
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
                ${t.map(t=>V`
                  <button
                    class="constraint-btn ${this._editingOpeningType===t.value?"active":""}"
                    @click=${()=>{this._editingOpeningType=t.value}}
                  >${t.label}</button>
                `)}
              </div>
            </div>

            ${i?V`
              <div class="wall-editor-section">
                <span class="wall-editor-section-label">Hinges</span>
                <div class="wall-editor-constraints">
                  ${1===o.length?V`
                    <button class="constraint-btn active">${o[0].label}</button>
                  `:o.map(t=>V`
                    <button
                      class="constraint-btn ${this._editingSwingDirection===t.value?"active":""}"
                      @click=${()=>{this._editingSwingDirection=t.value}}
                    >${t.label}</button>
                  `)}
                </div>
              </div>
            `:null}
          `})():null}

        ${o?V`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Sensor</span>
            ${this._editingEntityId?(()=>{const t=this.hass?.states[this._editingEntityId],e=t?.attributes.friendly_name||this._editingEntityId,i=t?.attributes.icon||"mdi:radiobox-marked";return V`
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
              `})():this._openingSensorPickerOpen?V`
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
                  ${this._getOpeningSensorEntities().map(t=>V`
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
              @input=${t=>this._editingLength=t.target.value}
              @keydown=${this._handleEditorKeyDown}
              autofocus
            />
            <span class="wall-editor-unit">cm</span>
            ${o?null:V`
              <button
                class="constraint-btn lock-btn ${this._editingLengthLocked?"active":""}"
                @click=${()=>{this._editingLengthLocked=!this._editingLengthLocked}}
                title="${this._editingLengthLocked?"Unlock length":"Lock length"}"
              ><ha-icon icon="${this._editingLengthLocked?"mdi:lock":"mdi:lock-open-variant"}"></ha-icon></button>
            `}
          </div>
        </div>

        ${t.angle_group?(()=>{const e=Ft.value,i=t.angle_group,o=e?e.edges.filter(t=>t.angle_group===i).length:0;return V`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${ai(i)};">
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

        ${o?null:V`
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
    `}async _applyDirection(t,e){if(!this.hass)return!1;const i=Ft.value,o=Wt.value;if(!i||!o)return!1;const n=i.edges.map(e=>e.id===t.id?{...e,direction:"free",length_locked:!1,angle_group:void 0}:e),s=Re($e(i.nodes,n),t.id,e);return s.blocked?(s.blockedBy&&this._blinkEdges(s.blockedBy),!0):(s.updates.length>0&&await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:o.id,floor_id:i.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await se(),await this._syncRoomsWithEdges(),!0)}_renderNodeEditor(){if(!this._nodeEditor)return null;const t=this._nodeEditor.node,e=Ft.value,i=e?Ve(t.id,e.edges).length:0;return V`
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
          ${2===i?V`
            <button class="delete-btn" @click=${()=>this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          `:null}
        </div>
      </div>
    `}async _handleNodeEditorSave(){if(!this._nodeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=parseFloat(this._nodeEditor.editX),n=parseFloat(this._nodeEditor.editY);if(!isNaN(o)&&!isNaN(n))try{const s=Le($e(t.nodes,t.edges),i.id,o,n);await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:s.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await se(),await this._syncRoomsWithEdges(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error updating node position:",t),alert(`Failed to update node: ${t}`)}}async _toggleNodePin(){if(!this._nodeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._nodeEditor.node,o=!i.pinned;try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:[{node_id:i.id,x:i.x,y:i.y,pinned:o}]}),await se(),this._refreshNodeEditor(i.id)}catch(t){console.error("Error toggling node pin:",t),alert(`Failed to toggle pin: ${t}`)}}async _handleNodeDissolve(){if(!this._nodeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(t&&e)try{await this.hass.callWS({type:"inhabit/nodes/dissolve",floor_plan_id:e.id,floor_id:t.id,node_id:this._nodeEditor.node.id}),await se(),await this._syncRoomsWithEdges(),this._nodeEditor=null}catch(t){console.error("Failed to dissolve node:",t),alert(`Failed to dissolve node: ${t}`)}}_refreshNodeEditor(t){const e=Ft.value;if(e){const i=e.nodes.find(e=>e.id===t);i&&(this._nodeEditor={node:i,editX:Math.round(i.x).toString(),editY:Math.round(i.y).toString()})}}_getOpeningSensorEntities(){if(!this.hass)return[];const t=["binary_sensor","cover"];let e=Object.values(this.hass.states).filter(e=>t.some(t=>e.entity_id.startsWith(t+".")));const i=Ft.value,o=this._edgeEditor?.edge.id;if(i){const t=new Set(i.edges.filter(t=>t.entity_id&&t.id!==o).map(t=>t.entity_id));e=e.filter(e=>!t.has(e.entity_id))}if(this._openingSensorSearch){const t=this._openingSensorSearch.toLowerCase();e=e.filter(e=>e.entity_id.toLowerCase().includes(t)||(e.attributes.friendly_name||"").toLowerCase().includes(t))}return e.slice(0,30)}_getEntityIconData(t,e){if(!t)return this._getIconData(e);const i=this.hass,o=i?.entities?.[t.entity_id]?.icon,n=t.attributes.icon;if(o||n)return this._getIconData(o??n??e);const s=this._getStateIconCacheKey(t),r=this._stateIconCache.get(s);return r||(this._queueStateIconLoad(t,s),this._getIconData(e))}_openEntityDetails(t){this.hass&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggleEntity(t){if(!this.hass)return;const e=t.split(".")[0];"button"===e||"input_button"===e?this.hass.callService("button","press",{entity_id:t}):"light"===e||"switch"===e||"input_boolean"===e?this.hass.callService("homeassistant","toggle",{entity_id:t}):this._openEntityDetails(t)}_hitTestDevice(t,e){for(const i of qt.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"light",id:i.id};for(const i of Yt.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"switch",id:i.id};for(const i of Xt.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"button",id:i.id};for(const i of Kt.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id,type:"other",id:i.id};for(const i of ee.value.filter(t=>t.floor_id===e.id))if(Math.hypot(t.x-i.position.x,t.y-i.position.y)<15)return{entityId:i.entity_id??"",type:"mmwave",id:i.id};return null}_getStateIconCacheKey(t){const e=t.attributes.device_class;return`${t.entity_id}:${t.state}:${e??""}`}_queueStateIconLoad(t,e){if(this._stateIconLoaders.has(e))return;const i=this._loadStateIcon(t,e).catch(e=>{console.warn("Failed to load state icon",t.entity_id,e)}).finally(()=>{this._stateIconLoaders.delete(e)});this._stateIconLoaders.set(e,i)}async _ensureHaStateIconDefined(){if(customElements.get("ha-state-icon"))return;await this._ensureHaIconDefined();const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-state-icon.js","/frontend_es5/ha-state-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-state-icon module",i,t)}if(customElements.get("ha-state-icon"))break}customElements.get("ha-state-icon")&&await customElements.whenDefined("ha-state-icon")}async _loadStateIcon(t,e){if(!this.hass)return;if(await this._ensureHaStateIconDefined(),!customElements.get("ha-state-icon"))return;const i=document.createElement("ha-state-icon");i.hass=this.hass,i.stateObj=t,i.style.display="none";const o=this.isConnected?this:document.body;o?.appendChild(i);try{i.updateComplete&&await i.updateComplete;let t=null;for(let e=0;e<20;e++){const e=i.shadowRoot?.querySelector("ha-svg-icon");if(e?.path){t={path:e.path,secondaryPath:e.secondaryPath,viewBox:e.viewBox};break}const o=i.shadowRoot?.querySelector("ha-icon"),n=o?.shadowRoot?.querySelector("ha-svg-icon");if(n?.path){t={path:n.path,secondaryPath:n.secondaryPath,viewBox:n.viewBox};break}await new Promise(t=>setTimeout(t,50))}t&&(this._stateIconCache.set(e,t),this.requestUpdate())}finally{i.remove()}}_getIconData(t){const e=this._iconCache.get(t);if(e)return e;this._queueIconLoad(t)}_queueIconLoad(t){if(this._iconLoaders.has(t))return;const e=this._loadIcon(t).catch(e=>{console.warn("Failed to load icon",t,e)}).finally(()=>{this._iconLoaders.delete(t)});this._iconLoaders.set(t,e)}async _ensureHaIconDefined(){if(customElements.get("ha-icon"))return;const t=new Function("path","return import(path);"),e=["/frontend_latest/ha-icon.js","/frontend_es5/ha-icon.js"];for(const i of e){try{await t(i)}catch(t){console.warn("Failed to load ha-icon module",i,t)}if(customElements.get("ha-icon"))break}customElements.get("ha-icon")&&await customElements.whenDefined("ha-icon")}async _loadIcon(t){if(await this._ensureHaIconDefined(),!customElements.get("ha-icon"))return;const e=document.createElement("ha-icon");e.icon=t,e.style.display="none";const i=this.isConnected?this:document.body;i?.appendChild(e);try{e.updateComplete&&await e.updateComplete;let i=null;for(let t=0;t<10;t++){const t=e.shadowRoot?.querySelector("ha-svg-icon");if(t?.path){i={path:t.path,secondaryPath:t.secondaryPath,viewBox:t.viewBox};break}await new Promise(t=>setTimeout(t,50))}i&&(this._iconCache.set(t,i),this.requestUpdate())}finally{e.remove()}}async _placeDevice(t){if(!this.hass||!this._pendingDevice)return;const e=Ft.value,i=Wt.value;if(!e||!i)return;const o=Ot.value,n="light"===o?"inhabit/lights/place":"button"===o?"inhabit/buttons/place":"other"===o?"inhabit/others/place":"inhabit/switches/place",s="light"===o?"inhabit/lights/remove":"button"===o?"inhabit/buttons/remove":"other"===o?"inhabit/others/remove":"inhabit/switches/remove",r="light"===o?"light_id":"button"===o?"button_id":"other"===o?"other_id":"switch_id",a=this.hass,l=i.id,d=e.id,c={...this._pendingDevice.position},h={id:""};try{const e=await a.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await se(),Qe({type:`${o}_place`,description:`Place ${o}`,undo:async()=>{await a.callWS({type:s,[r]:h.id}),await se()},redo:async()=>{const e=await a.callWS({type:n,floor_plan_id:l,floor_id:d,entity_id:t,position:c});h.id=e.id,await se()}})}catch(t){console.error(`Error placing ${o}:`,t),alert(`Failed to place ${o}: ${t}`)}this._pendingDevice=null}async _placeMmwave(t){if(!this.hass)return;const e=Ft.value,i=Wt.value;if(!e||!i)return;const o=this.hass,n=i.id,s=e.id,r={...t},a={id:""};try{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=t.id,await se(),Qe({type:"mmwave_place",description:"Place mmWave sensor",undo:async()=>{await o.callWS({type:"inhabit/mmwave/delete",placement_id:a.id}),await se()},redo:async()=>{const t=await o.callWS({type:"inhabit/mmwave/place",floor_plan_id:n,floor_id:s,position:r,angle:0,field_of_view:120,detection_range:500});a.id=t.id,await se()}})}catch(t){console.error("Error placing mmWave sensor:",t),alert(`Failed to place mmWave sensor: ${t}`)}}async _finishPlacementDrag(){if(!this.hass||!this._draggingPlacement)return;const t=this._draggingPlacement,e=this.hass;if(!Wt.value)return;let i;if(i="light"===t.type?qt.value.find(e=>e.id===t.id)?.position:"switch"===t.type?Yt.value.find(e=>e.id===t.id)?.position:"button"===t.type?Xt.value.find(e=>e.id===t.id)?.position:"other"===t.type?Kt.value.find(e=>e.id===t.id)?.position:ee.value.find(e=>e.id===t.id)?.position,!i)return;const o={...i},n={...t.originalPosition};try{"light"===t.type?await e.callWS({type:"inhabit/lights/update",light_id:t.id,position:o}):"switch"===t.type?await e.callWS({type:"inhabit/switches/update",switch_id:t.id,position:o}):"button"===t.type?await e.callWS({type:"inhabit/buttons/update",button_id:t.id,position:o}):"other"===t.type?await e.callWS({type:"inhabit/others/update",other_id:t.id,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:t.id,position:o});const i=t.type,s=t.id;Qe({type:`${i}_move`,description:`Move ${i}`,undo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:n}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:n}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:n}):"other"===i?await e.callWS({type:"inhabit/others/update",other_id:s,position:n}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:n}),await se()},redo:async()=>{"light"===i?await e.callWS({type:"inhabit/lights/update",light_id:s,position:o}):"switch"===i?await e.callWS({type:"inhabit/switches/update",switch_id:s,position:o}):"button"===i?await e.callWS({type:"inhabit/buttons/update",button_id:s,position:o}):"other"===i?await e.callWS({type:"inhabit/others/update",other_id:s,position:o}):await e.callWS({type:"inhabit/mmwave/update",placement_id:s,position:o}),await se()}})}catch(e){console.error(`Error moving ${t.type}:`,e),await se()}}async _deleteSelectedPlacement(){if(!this.hass)return;const t=Bt.value;if(1!==t.ids.length)return;const e=this.hass;if(!Wt.value)return;const i=t.ids[0];try{if("light"===t.type)await e.callWS({type:"inhabit/lights/remove",light_id:i}),qt.value=qt.value.filter(t=>t.id!==i);else if("switch"===t.type)await e.callWS({type:"inhabit/switches/remove",switch_id:i}),Yt.value=Yt.value.filter(t=>t.id!==i);else if("button"===t.type)await e.callWS({type:"inhabit/buttons/remove",button_id:i}),Xt.value=Xt.value.filter(t=>t.id!==i);else{if("mmwave"!==t.type)return;await e.callWS({type:"inhabit/mmwave/delete",placement_id:i}),ee.value=ee.value.filter(t=>t.id!==i)}Bt.value={type:"none",ids:[]}}catch(t){console.error("Error deleting placement:",t)}}async _rotateMmwave(t){if(!this.hass)return;const e=Bt.value;if("mmwave"!==e.type||1!==e.ids.length)return;const i=e.ids[0],o=ee.value.find(t=>t.id===i);if(!o)return;const n=(o.angle+t+360)%360;try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:i,angle:n}),ee.value=ee.value.map(t=>t.id===i?{...t,angle:n}:t)}catch(t){console.error("Error rotating mmWave:",t)}}_startMmwaveRotation(t,e){t.stopPropagation(),t.preventDefault(),this._rotatingMmwave={id:e.id,originalAngle:e.angle,pointerId:t.pointerId},this._svg?.setPointerCapture(t.pointerId)}_handleMmwaveRotationMove(t){if(!this._rotatingMmwave)return;const e=ee.value.find(t=>t.id===this._rotatingMmwave.id);if(!e)return;const i=t.x-e.position.x,o=t.y-e.position.y;let n=180*Math.atan2(o,i)/Math.PI;n=(n%360+360)%360,n=15*Math.round(n/15),ee.value=ee.value.map(t=>t.id===this._rotatingMmwave.id?{...t,angle:n}:t)}async _finishMmwaveRotation(){if(!this._rotatingMmwave||!this.hass)return;const t=this._rotatingMmwave,e=ee.value.find(e=>e.id===t.id);if(!e)return void(this._rotatingMmwave=null);const i=e.angle;if(i!==t.originalAngle){try{await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:t.id,angle:i})}catch(e){console.error("Error committing mmWave rotation:",e),ee.value=ee.value.map(e=>e.id===t.id?{...e,angle:t.originalAngle}:e)}this._rotatingMmwave=null}else this._rotatingMmwave=null}_cancelDevicePlacement(){this._pendingDevice=null,this._showEntityPickerModal=!1}_getPickerDomains(){const t=Ot.value;return"light"===t?["light"]:"switch"===t?["switch"]:"button"===t?["button"]:[]}_getPickerExcludeDomains(){return"other"===Ot.value?["light","switch","button"]:[]}_renderEntityPicker(){if(!this._showEntityPickerModal||!this._pendingDevice)return null;const t=Ot.value,e="light"===t?"Select Light":"switch"===t?"Select Switch":"button"===t?"Select Button":"Select Entity";return V`
      <fpb-entity-picker
        .hass=${this.hass}
        .domains=${this._getPickerDomains()}
        .excludeDomains=${this._getPickerExcludeDomains()}
        title=${e}
        @entities-confirmed=${t=>{this._placeDevice(t.detail.entityIds[0]),this._showEntityPickerModal=!1}}
        @picker-closed=${()=>this._cancelDevicePlacement()}
      ></fpb-entity-picker>
    `}render(){const t=this._canvasMode,e=[this._isPanning?"panning":"",this._spaceHeld?"space-pan":"","select"===Ot.value?"select-tool":"","viewing"===t?"view-mode":"",`mode-${t}`].filter(Boolean).join(" ");return V`
      <svg
        class="${e}"
        viewBox="${i=this._viewBox,`${i.x} ${i.y} ${i.width} ${i.height}`}"
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
        ${"walls"===t?this._renderEdgeAnnotations():null}
        ${"walls"===t?this._renderAngleConstraints():null}
        ${"walls"===t?this._renderNodeEndpoints():null}
        ${"furniture"===t&&"zone"===Ot.value?this._renderNodeGuideDots():null}
        ${Ft.value?this._renderDeviceLayer(Ft.value):null}
        ${"viewing"!==t&&"occupancy"!==t?this._renderDrawingPreview():null}
        ${"furniture"===t?this._renderFurnitureDrawingPreview():null}
        ${"walls"===t?this._renderOpeningPreview():null}
        ${"placement"===t?this._renderDevicePreview():null}
        ${"occupancy"===t&&oe.value&&Ft.value?this._renderSimulationLayer(Ft.value):null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${"occupancy"!==t?this._renderZoneEditor():null}
      ${"placement"===t?this._renderEntityPicker():null}
    `;var i}_getVisibleAnnotationEdgeIds(){const t=Bt.value;if("edge"!==t.type||0===t.ids.length)return null;const e=Ft.value;if(!e)return null;const i=new Set(t.ids),o=e.edges.filter(e=>t.ids.includes(e.id)),n=new Set,s=new Set,r=new Set;for(const t of o)t.link_group&&n.add(t.link_group),t.collinear_group&&s.add(t.collinear_group),t.angle_group&&r.add(t.angle_group);for(const t of e.edges)i.has(t.id)||(t.link_group&&n.has(t.link_group)&&i.add(t.id),t.collinear_group&&s.has(t.collinear_group)&&i.add(t.id),t.angle_group&&r.has(t.angle_group)&&i.add(t.id));return i}_renderEdgeAnnotations(){const t=Ft.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Ze(t);return H`
      <g class="wall-annotations-layer">
        ${i.map(t=>{if(!e.has(t.id))return null;const i=(t.startPos.x+t.endPos.x)/2,o=(t.startPos.y+t.endPos.y)/2,n=this._calculateWallLength(t.startPos,t.endPos),s=Math.atan2(t.endPos.y-t.startPos.y,t.endPos.x-t.startPos.x)*(180/Math.PI),r=s>90||s<-90?s+180:s,a=[];t.length_locked&&a.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"),"horizontal"===t.direction&&a.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z"),"vertical"===t.direction&&a.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");const l=this._formatLength(n),d=.35*24+3,c=3.2*l.length+4,h=-(3.2*l.length+8),p=-(t.thickness/2+6);return H`
            <g transform="translate(${i}, ${o}) rotate(${r})">
              ${t.link_group?H`
                <circle cx="${h}" cy="${p-1}" r="3.5"
                  fill="${ai(t.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              `:null}
              ${t.collinear_group?H`
                <g transform="translate(${h-(t.link_group?10:0)}, ${p-1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${ai(t.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              `:null}
              <text class="wall-annotation-text" x="0" y="${p}">${l}</text>
              ${a.map((t,e)=>H`
                <g transform="translate(${c+e*d}, ${p}) rotate(${-r}) scale(${.35})">
                  <path d="${t}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `})}
      </g>
    `}_renderAngleConstraints(){const t=Ft.value;if(!t||0===t.edges.length)return null;const e=this._getVisibleAnnotationEdgeIds();if(!e)return null;const i=Be(t.nodes),o=new Map;for(const e of t.edges)e.angle_group&&(o.has(e.angle_group)||o.set(e.angle_group,[]),o.get(e.angle_group).push(e));for(const[t,i]of o)i.some(t=>e.has(t.id))||o.delete(t);const n=[];for(const[,t]of o){if(2!==t.length)continue;const e=new Set([t[0].start_node,t[0].end_node]),o=new Set([t[1].start_node,t[1].end_node]);let s=null;for(const t of e)if(o.has(t)){s=t;break}if(!s)continue;const r=s,a=i.get(r);if(!a)continue;const l=[];for(const e of t){const t=e.start_node===r?e.end_node:e.start_node,o=i.get(t);o&&l.push(Math.atan2(o.y-a.y,o.x-a.x))}if(l.length<2)continue;l.sort((t,e)=>t-e);const d=l.length;for(let t=0;t<d;t++){const e=l[t],i=l[(t+1)%d],o=(i-e+2*Math.PI)%(2*Math.PI);if(Math.PI-o<.01)continue;const s=e+Math.PI,r=i+Math.PI,c=(r-s+2*Math.PI)%(2*Math.PI);c>Math.PI+.01?n.push({x:a.x,y:a.y,angle1:r,angle2:r+(2*Math.PI-c)}):n.push({x:a.x,y:a.y,angle1:s,angle2:s+c})}}if(0===n.length)return null;const s=12;return H`
      <g class="angle-constraints-layer">
        ${n.map(t=>{const e=t.angle1,i=t.angle2,o=i-e,n=180*o/Math.PI;if(n>85&&n<95){const n=.7*s,r=t.x+n*Math.cos(e),a=t.y+n*Math.sin(e),l=t.x+n*Math.cos(i),d=t.y+n*Math.sin(i),c=(e+i)/2,h=n/Math.cos(o/2),p=t.x+h*Math.cos(c),g=t.y+h*Math.sin(c);return H`
              <path d="M${r},${a} L${p},${g} L${l},${d}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `}const r=t.x+s*Math.cos(e),a=t.y+s*Math.sin(e),l=t.x+s*Math.cos(i),d=t.y+s*Math.sin(i),c=o>Math.PI?1:0;return H`
            <path d="M${r},${a} A${s},${s} 0 ${c} 1 ${l},${d}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `})}
      </g>
    `}_renderMultiEdgeEditor(){if(!this._multiEdgeEditor)return null;const t=this._multiEdgeEditor.edges,e=this._multiEdgeEditor.collinear??!1;return V`
      <div class="wall-editor"
           @click=${t=>t.stopPropagation()}
           @pointerdown=${t=>t.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${t.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${()=>{this._multiEdgeEditor=null,Bt.value={type:"none",ids:[]}}}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${e?V`
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
            ${(()=>{const e=t.map(t=>t.angle_group).filter(Boolean);if(e.length===t.length&&1===new Set(e).size)return V`<button
                  class="constraint-btn active"
                  @click=${()=>this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;return 2===t.length&&(()=>{const e=new Set([t[0].start_node,t[0].end_node]);return e.has(t[1].start_node)||e.has(t[1].end_node)})()?V`<button
                  class="constraint-btn"
                  @click=${()=>this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`:V`<button
                class="constraint-btn"
                disabled
                title="${2!==t.length?"Select exactly 2 walls":"Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`})()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(()=>{const e=t.map(t=>t.link_group).filter(Boolean);return e.length===t.length&&1===new Set(e).size?V`<button
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
            ${(()=>{const i=t.map(t=>t.collinear_group).filter(Boolean);return i.length===t.length&&1===new Set(i).size?V`<button
                  class="constraint-btn active"
                  @click=${()=>this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`:e?V`<button
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
    `}async _angleLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/angle_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error angle linking edges:",t)}}async _angleUnlinkEdges(){if(!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/angle_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error angle unlinking edges:",t)}}async _linkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}}catch(t){console.error("Error linking edges:",t)}}async _unlinkEdges(){if(!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error unlinking edges:",t)}}async _applyTotalLength(){if(!this._multiEdgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=parseFloat(this._editingTotalLength);if(isNaN(i)||i<=0)return;const o=this._multiEdgeEditor.edges.map(t=>t.id),n=function(t,e,i){const o=new Set,n=[];for(const i of e){const e=t.edges.get(i);if(e){if(e.length_locked)return{updates:[],blocked:!0,blockedBy:[e.id]};n.push(e),o.add(e.start_node),o.add(e.end_node)}}if(0===n.length)return{updates:[],blocked:!1};const s=[];for(const e of o){const i=t.nodes.get(e);i&&s.push({x:i.x,y:i.y})}const{anchor:r,dir:a}=ce(s),l=new Map;for(const e of o){const i=t.nodes.get(e);if(!i)continue;const o=i.x-r.x,n=i.y-r.y,s=o*a.x+n*a.y;l.set(e,s)}let d=1/0,c=-1/0,h="";for(const[t,e]of l)e<d&&(d=e,h=t),e>c&&(c=e);const p=c-d;if(p<1e-9)return{updates:[],blocked:!1};const g=Ee(t),u=new Set;for(const[t,e]of l){if(u.add(t),t===h)continue;const o=d+i/p*(e-d);g.set(t,{x:r.x+o*a.x,y:r.y+o*a.y})}const f=new Set(u);for(const[e,i]of t.nodes)i.pinned&&f.add(e);const _=Ie(t,f,g);for(const e of u){const i=g.get(e),o=t.nodes.get(e);i&&(Math.abs(i.x-o.x)>pe||Math.abs(i.y-o.y)>pe)&&(_.updates.some(t=>t.nodeId===e)||_.updates.push({nodeId:e,x:i.x,y:i.y}))}return _.blocked=!1,delete _.blockedBy,_}($e(t.nodes,t.edges),o,i);if(n.blocked)n.blockedBy&&this._blinkEdges(n.blockedBy);else if(0!==n.updates.length)try{await this.hass.callWS({type:"inhabit/nodes/update",floor_plan_id:e.id,floor_id:t.id,updates:n.updates.map(t=>({node_id:t.nodeId,x:t.x,y:t.y}))}),await se();Ft.value&&this._updateEdgeEditorForSelection(o)}catch(t){console.error("Error applying total length:",t)}}async _collinearLinkEdges(){if(!this._multiEdgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges.map(t=>t.id);try{await this.hass.callWS({type:"inhabit/edges/collinear_link",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}}catch(t){console.error("Error collinear linking edges:",t)}}async _collinearUnlinkEdges(){if(!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor?this._multiEdgeEditor.edges.map(t=>t.id):this._edgeEditor?[this._edgeEditor.edge.id]:[];if(0!==i.length)try{await this.hass.callWS({type:"inhabit/edges/collinear_unlink",floor_plan_id:e.id,floor_id:t.id,edge_ids:i}),await se();const o=Ft.value;if(o)if(this._multiEdgeEditor){const t=i.map(t=>o.edges.find(e=>e.id===t)).filter(t=>!!t);this._multiEdgeEditor={...this._multiEdgeEditor,edges:t}}else if(this._edgeEditor){const t=o.edges.find(t=>t.id===i[0]);t&&(this._edgeEditor={...this._edgeEditor,edge:t})}}catch(t){console.error("Error collinear unlinking edges:",t)}}async _handleMultiEdgeDelete(){if(!this._multiEdgeEditor||!this.hass)return;const t=Ft.value,e=Wt.value;if(!t||!e)return;const i=this._multiEdgeEditor.edges;try{for(const o of i)await this.hass.callWS({type:"inhabit/edges/delete",floor_plan_id:e.id,floor_id:t.id,edge_id:o.id});await se(),await this._syncRoomsWithEdges()}catch(t){console.error("Error deleting edges:",t)}this._multiEdgeEditor=null,Bt.value={type:"none",ids:[]}}_renderDevicePreview(){const t=Ot.value;if("light"!==t&&"switch"!==t&&"button"!==t&&"other"!==t&&"mmwave"!==t||this._pendingDevice)return null;const e="light"===t?"#ffd600":"switch"===t?"#4caf50":"button"===t?"#2196f3":"other"===t?"#9c27b0":"#2196f3";return H`
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
    `}}t([pt({attribute:!1})],li.prototype,"hass",void 0),t([ut("svg")],li.prototype,"_svg",void 0),t([gt()],li.prototype,"_viewBox",void 0),t([gt()],li.prototype,"_isPanning",void 0),t([gt()],li.prototype,"_spaceHeld",void 0),t([gt()],li.prototype,"_panStart",void 0),t([gt()],li.prototype,"_cursorPos",void 0),t([gt()],li.prototype,"_wallStartPoint",void 0),t([gt()],li.prototype,"_roomEditor",void 0),t([gt()],li.prototype,"_haAreas",void 0),t([gt()],li.prototype,"_hoveredNode",void 0),t([gt()],li.prototype,"_draggingNode",void 0),t([gt()],li.prototype,"_nodeEditor",void 0),t([gt()],li.prototype,"_edgeEditor",void 0),t([gt()],li.prototype,"_multiEdgeEditor",void 0),t([gt()],li.prototype,"_editingTotalLength",void 0),t([gt()],li.prototype,"_editingLength",void 0),t([gt()],li.prototype,"_editingLengthLocked",void 0),t([gt()],li.prototype,"_editingDirection",void 0),t([gt()],li.prototype,"_editingOpeningParts",void 0),t([gt()],li.prototype,"_editingOpeningType",void 0),t([gt()],li.prototype,"_editingSwingDirection",void 0),t([gt()],li.prototype,"_editingEntityId",void 0),t([gt()],li.prototype,"_openingSensorSearch",void 0),t([gt()],li.prototype,"_openingSensorPickerOpen",void 0),t([gt()],li.prototype,"_blinkingEdgeIds",void 0),t([gt()],li.prototype,"_focusedRoomId",void 0),t([gt()],li.prototype,"_pendingDevice",void 0),t([gt()],li.prototype,"_showEntityPickerModal",void 0),t([gt()],li.prototype,"_openingPreview",void 0),t([gt(),gt()],li.prototype,"_zonePolyPoints",void 0),t([gt()],li.prototype,"_pendingZonePolygon",void 0),t([gt()],li.prototype,"_zoneEditor",void 0),t([gt()],li.prototype,"_draggingZone",void 0),t([gt()],li.prototype,"_draggingZoneVertex",void 0),t([gt()],li.prototype,"_draggingPlacement",void 0),t([gt()],li.prototype,"_rotatingMmwave",void 0),t([gt()],li.prototype,"_draggingSimTarget",void 0),t([gt()],li.prototype,"_canvasMode",void 0),customElements.get("fpb-canvas")||customElements.define("fpb-canvas",li);const di=[{id:"wall",icon:"mdi:wall",label:"Wall"},{id:"door",icon:"mdi:door",label:"Door"},{id:"window",icon:"mdi:window-closed-variant",label:"Window"}],ci=[{id:"zone",icon:"mdi:vector-polygon",label:"Zone"}],hi=[{id:"light",icon:"mdi:lightbulb",label:"Light"},{id:"switch",icon:"mdi:toggle-switch",label:"Switch"},{id:"button",icon:"mdi:gesture-tap-button",label:"Button"},{id:"mmwave",icon:"mdi:access-point",label:"mmWave"},{id:"other",icon:"mdi:devices",label:"Other"}];class pi extends lt{constructor(){super(...arguments),this.floorPlans=[],this._floorMenuOpen=!1,this._canvasMode="walls",this._renamingFloorId=null,this._renameValue="",this._cleanupEffects=[],this._renameCommitted=!1,this._documentListenerAttached=!1,this._handleDocumentClick=t=>{t.composedPath().includes(this)||this._closeMenus()}}static{this.styles=r`
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
    }

    .toolbar-left {
      justify-self: start;
    }

    .toolbar-right {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 4px;
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

  `}_selectFloor(t){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("floor-select",{detail:{id:t},bubbles:!0,composed:!0}))}_handleToolSelect(t){Ot.value=t}_handleUndo(){ti()}_handleRedo(){ei()}_handleAddFloor(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("add-floor",{bubbles:!0,composed:!0}))}_handleDeleteFloor(t,e,i){t.stopPropagation(),confirm(`Delete "${i}"? This will remove all walls, rooms, and devices on this floor.`)&&(this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("delete-floor",{detail:{id:e},bubbles:!0,composed:!0})))}_startRename(t,e,i){t.stopPropagation(),this._renamingFloorId=e,this._renameValue=i,this._renameCommitted=!1,this.updateComplete.then(()=>{const t=this.shadowRoot?.querySelector(".rename-input");t&&(t.focus(),t.select())})}_commitRename(){if(this._renameCommitted)return;this._renameCommitted=!0;const t=this._renamingFloorId,e=this._renameValue.trim();this._renamingFloorId=null,t&&e&&this.dispatchEvent(new CustomEvent("rename-floor",{detail:{id:t,name:e},bubbles:!0,composed:!0}))}_cancelRename(){this._renamingFloorId=null}_handleRenameKeyDown(t){"Enter"===t.key?this._commitRename():"Escape"===t.key&&this._cancelRename()}_exitEditor(){this.dispatchEvent(new CustomEvent("exit-editor",{bubbles:!0,composed:!0}))}_openImportExport(){this._floorMenuOpen=!1,this.dispatchEvent(new CustomEvent("open-import-export",{bubbles:!0,composed:!0}))}_toggleFloorMenu(){this._floorMenuOpen=!this._floorMenuOpen}_closeMenus(){this._floorMenuOpen=!1}connectedCallback(){super.connectedCallback(),this._documentListenerAttached||(document.addEventListener("click",this._handleDocumentClick),this._documentListenerAttached=!0),this._cleanupEffects.push(Lt(()=>{this._canvasMode=Rt.value}))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick),this._documentListenerAttached=!1,this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}render(){const t=Wt.value,e=Ft.value,i=Ot.value,o=this._canvasMode,n=t?.floors||[],s="walls"===o?di:"furniture"===o?ci:"placement"===o?hi:[];return V`
      <!-- Left: Floor Selector -->
      <div class="toolbar-left">
        ${n.length>0?V`
          <div class="floor-selector">
            <button
              class="floor-trigger ${this._floorMenuOpen?"open":""}"
              @click=${this._toggleFloorMenu}
            >
              ${e?.name||"Select floor"}
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </button>
            ${this._floorMenuOpen?V`
              <div class="floor-dropdown">
                ${n.map(t=>this._renamingFloorId===t.id?V`
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
                    `:V`
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
        `:V`
          <button class="floor-trigger" @click=${this._handleAddFloor}>
            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 16px;"></ha-icon>
            Add floor
          </button>
        `}
      </div>

      <!-- Center: Mode Switcher -->
      <div class="mode-group">
        <button
          class="mode-button ${"walls"===o?"active":""}"
          @click=${()=>ne("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${"furniture"===o?"active":""}"
          @click=${()=>ne("furniture")}
          title="Zones mode"
        >
          <ha-icon icon="mdi:vector-square"></ha-icon>
        </button>
        <button
          class="mode-button ${"placement"===o?"active":""}"
          @click=${()=>ne("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
        <button
          class="mode-button ${"occupancy"===o?"active":""}"
          @click=${()=>ne("occupancy")}
          title="Occupancy mode"
        >
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
        </button>
      </div>

      <!-- Right: Undo/Redo + contextual tools -->
      <div class="toolbar-right">
        <div class="tool-group">
          <button
            class="tool-button"
            @click=${this._handleUndo}
            ?disabled=${!Ge.value}
            title="Undo"
          >
            <ha-icon icon="mdi:undo"></ha-icon>
          </button>
          <button
            class="tool-button"
            @click=${this._handleRedo}
            ?disabled=${!Je.value}
            title="Redo"
          >
            <ha-icon icon="mdi:redo"></ha-icon>
          </button>
        </div>

        <!-- Occupancy mode: simulation toggle -->
        ${"occupancy"===o?V`
          <div class="divider"></div>
          <div class="tool-group">
            <button
              class="tool-button ${oe.value?"active":""}"
              @click=${()=>{const t=!oe.value;oe.value=t,t||(ie.value=[])}}
              title="${oe.value?"Stop simulating":"Simulate positions"}"
            >
              <ha-icon icon="mdi:target-account"></ha-icon>
            </button>
          </div>
        `:null}

        <!-- Tool buttons (contextual) -->
        ${s.length>0?V`
          <div class="divider"></div>
          <div class="tool-group">
            ${s.map(t=>V`
              <button
                class="tool-button ${i===t.id?"active":""}"
                @click=${()=>this._handleToolSelect(t.id)}
                title=${t.label}
              >
                <ha-icon icon=${t.icon}></ha-icon>
              </button>
            `)}
          </div>
        `:null}

        <div class="divider"></div>
        <button
          class="done-button"
          @click=${this._exitEditor}
          title="Exit editor"
        >
          <ha-icon icon="mdi:check"></ha-icon>
          Done
        </button>
      </div>
    `}}t([pt({attribute:!1})],pi.prototype,"hass",void 0),t([pt({attribute:!1})],pi.prototype,"floorPlans",void 0),t([gt()],pi.prototype,"_floorMenuOpen",void 0),t([gt()],pi.prototype,"_canvasMode",void 0),t([gt()],pi.prototype,"_renamingFloorId",void 0),t([gt()],pi.prototype,"_renameValue",void 0),customElements.get("fpb-toolbar")||customElements.define("fpb-toolbar",pi);class gi extends lt{constructor(){super(...arguments),this.open=!1,this._mode="export",this._exportSelection=new Set,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1,this._error=null}static{this.styles=r`
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
  `}show(t){this._mode=t||"export",this._error=null,this._importEntries=[],this._importData=[],this._importing=!1,this._exporting=!1;const e=Wt.value;e&&(this._exportSelection=new Set(e.floors.map(t=>t.id))),this.open=!0}close(){this.open=!1}_setMode(t){this._mode=t,this._error=null}_toggleExportFloor(t){const e=new Set(this._exportSelection);e.has(t)?e.delete(t):e.add(t),this._exportSelection=e}_toggleExportAll(){const t=Wt.value;t&&(this._exportSelection.size===t.floors.length?this._exportSelection=new Set:this._exportSelection=new Set(t.floors.map(t=>t.id)))}async _doExport(){if(!this.hass)return;const t=Wt.value;if(t&&0!==this._exportSelection.size){this._exporting=!0,this._error=null;try{const e=[];for(const i of this._exportSelection){const o=await this.hass.callWS({type:"inhabit/floors/export",floor_plan_id:t.id,floor_id:i});e.push(o)}const i=1===e.length?e[0]:{inhabit_version:"1.0",export_type:"floors",exported_at:(new Date).toISOString(),floors:e},o=JSON.stringify(i,null,2),n=new Blob([o],{type:"application/json"}),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s;const a=t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),l=1===e.length?(e[0].floor?.name||"floor").toLowerCase().replace(/[^a-z0-9]+/g,"-"):"floors";r.download=`inhabit-${a}-${l}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(s),this.close()}catch(t){console.error("Export error:",t),this._error=`Export failed: ${t?.message||t}`}finally{this._exporting=!1}}}_pickFile(){const t=document.createElement("input");t.type="file",t.accept=".json",t.style.display="none",document.body.appendChild(t),t.addEventListener("change",async()=>{const e=t.files?.[0];if(document.body.removeChild(t),e)try{const t=await e.text(),i=JSON.parse(t);this._parseImportFile(i)}catch{this._error="Could not read file. Make sure it's a valid Inhabit JSON export."}}),t.click()}_parseImportFile(t){if(this._error=null,!t||"object"!=typeof t)return void(this._error="Invalid file format.");const e=t;if("floors"===e.export_type&&Array.isArray(e.floors)){const t=e.floors;return this._importData=t,void(this._importEntries=t.map((t,e)=>{const i=t.floor,o=t.devices;return{index:e,name:i?.name||`Floor ${e+1}`,level:i?.level??e,roomCount:Array.isArray(i?.rooms)?i.rooms.length:0,wallCount:Array.isArray(i?.edges)?i.edges.length:Array.isArray(i?.walls)?i.walls.length:0,deviceCount:Array.isArray(o)?o.length:0,selected:!0}}))}if("floor"===e.export_type){this._importData=[e];const t=e.floor,i=e.devices;return void(this._importEntries=[{index:0,name:t?.name||"Imported Floor",level:t?.level??0,roomCount:Array.isArray(t?.rooms)?t.rooms.length:0,wallCount:Array.isArray(t?.edges)?t.edges.length:Array.isArray(t?.walls)?t.walls.length:0,deviceCount:Array.isArray(i)?i.length:0,selected:!0}])}this._error="Invalid file: not an Inhabit floor export."}_toggleImportFloor(t){this._importEntries=this._importEntries.map(e=>e.index===t?{...e,selected:!e.selected}:e)}_toggleImportAll(){const t=this._importEntries.every(t=>t.selected);this._importEntries=this._importEntries.map(e=>({...e,selected:!t}))}async _doImport(){if(!this.hass)return;const t=Wt.value;if(!t)return;const e=this._importEntries.filter(t=>t.selected);if(0!==e.length){this._importing=!0,this._error=null;try{let i=null;const o=[];for(const n of e){const e=this._importData[n.index],s=await this.hass.callWS({type:"inhabit/floors/import",floor_plan_id:t.id,data:e});o.push(s),i=s}const n={...t,floors:[...t.floors,...o]};this.dispatchEvent(new CustomEvent("floors-imported",{detail:{floorPlan:n,switchTo:i},bubbles:!0,composed:!0})),this.close()}catch(t){console.error("Import error:",t),this._error=`Import failed: ${t?.message||t}`}finally{this._importing=!1}}}_onOverlayClick(t){t.target.classList.contains("overlay")&&this.close()}render(){if(!this.open)return q;const t=Wt.value,e=t?.floors||[];return V`
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
            ${"export"===this._mode?this._renderExport(e):this._renderImport()}
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
    `}_renderExport(t){if(0===t.length)return V`<div class="empty-msg">No floors to export.</div>`;const e=this._exportSelection.size===t.length;return V`
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
        ${t.map(t=>V`
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
    `}_renderImport(){if(0===this._importEntries.length)return V`
        <div class="file-drop" @click=${this._pickFile}>
          <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          <span>Choose an Inhabit JSON file</span>
        </div>
      `;const t=this._importEntries.every(t=>t.selected);return V`
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
        ${this._importEntries.map(t=>V`
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
    `}}t([pt({attribute:!1})],gi.prototype,"hass",void 0),t([pt({type:Boolean,reflect:!0})],gi.prototype,"open",void 0),t([gt()],gi.prototype,"_mode",void 0),t([gt()],gi.prototype,"_exportSelection",void 0),t([gt()],gi.prototype,"_importEntries",void 0),t([gt()],gi.prototype,"_importData",void 0),t([gt()],gi.prototype,"_importing",void 0),t([gt()],gi.prototype,"_exporting",void 0),t([gt()],gi.prototype,"_error",void 0),customElements.get("fpb-import-export-dialog")||customElements.define("fpb-import-export-dialog",gi);class ui extends lt{constructor(){super(...arguments),this.targetId="",this.targetName="",this.targetType="room",this._config=null,this._occupancyState=null,this._loading=!0,this._activePicker=null}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._loadConfig(),this._startPolling()}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}updated(t){t.has("targetId")&&this.targetId&&this._loadConfig()}_startPolling(){this._pollTimer=window.setInterval(()=>this._loadOccupancyState(),2e3)}_stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}async _loadConfig(){if(this.hass&&this.targetId){this._loading=!0;try{const t=await this.hass.callWS({type:"inhabit/sensor_config/get",room_id:this.targetId});this._config=t}catch{this._config=null}await this._loadOccupancyState(),this._loading=!1}}async _loadOccupancyState(){if(this.hass)try{const t=await this.hass.callWS({type:"inhabit/occupancy_states"});this._occupancyState=t[this.targetId]??null}catch{}}async _updateConfig(t){if(this.hass&&this._config)try{const e=await this.hass.callWS({type:"inhabit/sensor_config/update",room_id:this.targetId,...t});this._config=e}catch(t){console.error("Failed to update sensor config:",t)}}async _addSensors(t,e){if(!this._config||0===e.length)return;const i=`${t}_sensors`,o=this._config[i],n=new Set(o.map(t=>t.entity_id)),s=e.filter(t=>t&&!n.has(t)).map(e=>({entity_id:e,sensor_type:t,weight:1,inverted:!1}));0!==s.length&&await this._updateConfig({[i]:[...o,...s]})}async _removeSensor(t,e){if(!this._config)return;const i=`${t}_sensors`,o=this._config[i].filter(t=>t.entity_id!==e);await this._updateConfig({[i]:o})}_getEntityName(t){return this.hass?.states[t]?String(this.hass.states[t].attributes?.friendly_name??t):t}_getAllBoundEntityIds(){if(!this._config)return[];const t=[];for(const e of this._config.motion_sensors)t.push(e.entity_id);for(const e of this._config.door_sensors)t.push(e.entity_id);return this._config.override_trigger_entity&&t.push(this._config.override_trigger_entity),t}_renderSensorSection(t,e,i){const o="motion"===e?"mdi:motion-sensor":"mdi:door";return V`
      <div class="section">
        <div class="section-title">${t}</div>
        <div class="sensor-list">
          ${i.map(t=>V`
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
        ${this._activePicker===e?V`
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
        `:q}
      </div>
    `}_renderStatus(){const t=this._occupancyState;if(!t)return q;const e=t.state,i=t.state.charAt(0).toUpperCase()+t.state.slice(1),o=Math.round(100*t.confidence);return V`
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
          ${t.contributing_sensors.length>0?V`
            <div class="contributing-sensors">
              Contributing: ${t.contributing_sensors.join(", ")}
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
              @change=${t=>this._updateConfig({enabled:t.target.checked})}
            ></ha-switch>
          </div>

          ${this._config.enabled?V`
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
            <div class="section">
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
            </div>

            <!-- Override Trigger -->
            <div class="section">
              <div class="section-title">Override Trigger</div>
              ${this._config.override_trigger_entity?V`
                <div class="sensor-item">
                  <ha-icon icon="mdi:gesture-tap-button" style="--mdc-icon-size: 18px;"></ha-icon>
                  <span class="entity-id">
                    ${this._getEntityName(this._config.override_trigger_entity)}
                    ${this._config.override_trigger_action?V` <span style="color: var(--secondary-text-color)">(${this._config.override_trigger_action})</span>`:q}
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
              `:V`
                <button class="add-btn" @click=${()=>{this._activePicker="override"}}>
                  Select entity
                </button>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Pick a button, switch, or event entity to toggle occupancy
                </div>
                ${"override"===this._activePicker?V`
                  <fpb-entity-picker
                    .hass=${this.hass}
                    .domains=${["button","input_button","event","switch","input_boolean"]}
                    .exclude=${this._getAllBoundEntityIds()}
                    title="Select Override Trigger"
                    placeholder="Search buttons, switches, events..."
                    @entities-confirmed=${t=>{this._updateConfig({override_trigger_entity:t.detail.entityIds[0]}),this._activePicker=null}}
                    @picker-closed=${()=>{this._activePicker=null}}
                  ></fpb-entity-picker>
                `:q}
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
          `:q}
        `:V`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `}
      </div>
    `}}t([pt({attribute:!1})],ui.prototype,"hass",void 0),t([pt({type:String})],ui.prototype,"targetId",void 0),t([pt({type:String})],ui.prototype,"targetName",void 0),t([pt({type:String})],ui.prototype,"targetType",void 0),t([gt()],ui.prototype,"_config",void 0),t([gt()],ui.prototype,"_occupancyState",void 0),t([gt()],ui.prototype,"_loading",void 0),t([gt()],ui.prototype,"_activePicker",void 0),customElements.define("fpb-occupancy-panel",ui);class fi extends lt{constructor(){super(...arguments),this.placementId="",this._placement=null,this._loading=!0}static{this.styles=r`
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
  `}connectedCallback(){super.connectedCallback(),this._loadPlacement()}updated(t){t.has("placementId")&&this.placementId&&this._loadPlacement()}async _loadPlacement(){if(!this.hass||!this.placementId)return;this._loading=!0;const t=ee.value.find(t=>t.id===this.placementId);this._placement=t??null,this._loading=!1}async _update(t){if(this.hass&&this._placement)try{const e=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...t});this._placement=e,ee.value=ee.value.map(t=>t.id===e.id?e:t)}catch(t){console.error("Failed to update mmWave placement:",t)}}async _deletePlacement(){if(this.hass&&this._placement)try{await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),ee.value=ee.value.filter(t=>t.id!==this.placementId),this.dispatchEvent(new CustomEvent("close-panel"))}catch(t){console.error("Failed to delete mmWave placement:",t)}}render(){return V`
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
        `:V`<p>Placement not found.</p>`}
      </div>
    `}}t([pt({attribute:!1})],fi.prototype,"hass",void 0),t([pt({type:String})],fi.prototype,"placementId",void 0),t([gt()],fi.prototype,"_placement",void 0),t([gt()],fi.prototype,"_loading",void 0),customElements.define("fpb-mmwave-panel",fi);class _i extends lt{constructor(){super(...arguments),this.placementId="",this.deviceType="light",this._rebinding=!1,this._editingTargetIndex=null,this._editingTargetAxis=null}static{this.styles=r`
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

    .target-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--primary-background-color);
      border-radius: 8px;
      font-size: 12px;
    }

    .target-row .target-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .target-row .target-axis {
      color: var(--secondary-text-color);
      font-weight: 600;
      min-width: 14px;
    }

    .target-actions {
      display: flex;
      gap: 4px;
    }

    .small-btn {
      padding: 2px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 11px;
      white-space: nowrap;
    }

    .small-btn:hover {
      background: var(--secondary-background-color);
    }

    .small-btn.danger {
      color: var(--error-color, #f44336);
      border-color: var(--error-color, #f44336);
    }

    .add-target-btn {
      padding: 6px 12px;
      border: 1px dashed var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: none;
      color: var(--primary-color);
      cursor: pointer;
      font-size: 12px;
      width: 100%;
    }

    .add-target-btn:hover {
      background: var(--primary-background-color);
    }
  `}_getPlacement(){return"light"===this.deviceType?qt.value.find(t=>t.id===this.placementId)??null:"switch"===this.deviceType?Yt.value.find(t=>t.id===this.placementId)??null:"button"===this.deviceType?Xt.value.find(t=>t.id===this.placementId)??null:"other"===this.deviceType?Kt.value.find(t=>t.id===this.placementId)??null:ee.value.find(t=>t.id===this.placementId)??null}_getPickerDomains(){return"mmwave"===this.deviceType||"other"===this.deviceType?[]:[this.deviceType]}_getPickerExcludeDomains(){return"other"===this.deviceType?["light","switch","button"]:[]}_getExcludedEntityIds(){return"light"===this.deviceType?qt.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):"switch"===this.deviceType?Yt.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):"button"===this.deviceType?Xt.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):"other"===this.deviceType?Kt.value.filter(t=>t.id!==this.placementId).map(t=>t.entity_id):ee.value.filter(t=>t.id!==this.placementId&&t.entity_id).map(t=>t.entity_id)}async _rebindEntity(t){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/update",light_id:this.placementId,entity_id:t}),qt.value=qt.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/update",switch_id:this.placementId,entity_id:t}),Yt.value=Yt.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"button"===this.deviceType?(await this.hass.callWS({type:"inhabit/buttons/update",button_id:this.placementId,entity_id:t}),Xt.value=Xt.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):"other"===this.deviceType?(await this.hass.callWS({type:"inhabit/others/update",other_id:this.placementId,entity_id:t}),Kt.value=Kt.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)):(await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,entity_id:t}),ee.value=ee.value.map(e=>e.id===this.placementId?{...e,entity_id:t}:e)),this._rebinding=!1,this.requestUpdate()}catch(t){console.error("Failed to rebind entity:",t)}}async _updateMmwave(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/mmwave/update",placement_id:this.placementId,...t});ee.value=ee.value.map(t=>t.id===e.id?e:t),this.requestUpdate()}catch(t){console.error("Failed to update mmWave placement:",t)}}async _deletePlacement(){if(this.hass)try{"light"===this.deviceType?(await this.hass.callWS({type:"inhabit/lights/remove",light_id:this.placementId}),qt.value=qt.value.filter(t=>t.id!==this.placementId)):"switch"===this.deviceType?(await this.hass.callWS({type:"inhabit/switches/remove",switch_id:this.placementId}),Yt.value=Yt.value.filter(t=>t.id!==this.placementId)):"button"===this.deviceType?(await this.hass.callWS({type:"inhabit/buttons/remove",button_id:this.placementId}),Xt.value=Xt.value.filter(t=>t.id!==this.placementId)):"other"===this.deviceType?(await this.hass.callWS({type:"inhabit/others/remove",other_id:this.placementId}),Kt.value=Kt.value.filter(t=>t.id!==this.placementId)):(await this.hass.callWS({type:"inhabit/mmwave/delete",placement_id:this.placementId}),ee.value=ee.value.filter(t=>t.id!==this.placementId)),Bt.value={type:"none",ids:[]},te.value=null}catch(t){console.error("Failed to delete placement:",t)}}_close(){te.value=null}_getIcon(){return"light"===this.deviceType?"mdi:lightbulb":"switch"===this.deviceType?"mdi:toggle-switch":"button"===this.deviceType?"mdi:gesture-tap-button":"other"===this.deviceType?"mdi:devices":"mdi:access-point"}_getTitle(){return"light"===this.deviceType?"Light":"switch"===this.deviceType?"Switch":"button"===this.deviceType?"Button":"other"===this.deviceType?"Other Device":"mmWave Sensor"}render(){const t=this._getPlacement();if(!t)return V`
        <div class="panel-header">
          <h3>${this._getTitle()}</h3>
          <button class="close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="panel-body"><p>Placement not found.</p></div>
      `;const e="entity_id"in t?t.entity_id:void 0,i=e&&this.hass?.states[e]?this.hass.states[e].attributes?.friendly_name??e:e??"No entity";return V`
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
          <div class="entity-row">
            <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 18px;"></ha-icon>
            <span class="entity-id">${i}</span>
            <button class="rebind-btn" @click=${()=>{this._rebinding=!0}}>Change</button>
          </div>
          ${this._rebinding?V`
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
          `:q}
        </div>

        ${"mmwave"===this.deviceType?this._renderMmwaveSettings(t):null}

        <!-- Delete -->
        <div class="section">
          <button class="delete-btn" @click=${this._deletePlacement}>
            Delete ${this._getTitle()}
          </button>
        </div>
      </div>
    `}_renderMmwaveSettings(t){return V`
      <div class="section">
        <div class="section-title">Sensor Settings</div>

        <div class="slider-row">
          <label>Facing Angle <span>${t.angle.toFixed(0)}&deg;</span></label>
          <input type="range" min="0" max="360" step="1"
            .value=${String(t.angle)}
            @input=${e=>{const i=Number(e.target.value);ee.value=ee.value.map(e=>e.id===t.id?{...e,angle:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({angle:Number(t.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Field of View <span>${t.field_of_view.toFixed(0)}&deg;</span></label>
          <input type="range" min="30" max="180" step="5"
            .value=${String(t.field_of_view)}
            @input=${e=>{const i=Number(e.target.value);ee.value=ee.value.map(e=>e.id===t.id?{...e,field_of_view:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({field_of_view:Number(t.target.value)})}
          />
        </div>

        <div class="slider-row">
          <label>Detection Range <span>${t.detection_range.toFixed(0)}cm</span></label>
          <input type="range" min="50" max="1200" step="25"
            .value=${String(t.detection_range)}
            @input=${e=>{const i=Number(e.target.value);ee.value=ee.value.map(e=>e.id===t.id?{...e,detection_range:i}:e),this.requestUpdate()}}
            @change=${t=>this._updateMmwave({detection_range:Number(t.target.value)})}
          />
        </div>
      </div>

      ${this._renderTrackingTargets(t)}
    `}_renderTrackingTargets(t){const e=t.targets??[],i=t=>t?this.hass?.states[t]?.attributes?.friendly_name??t:"Not set";return V`
      <div class="section">
        <div class="section-title">Tracking Targets</div>

        ${e.map((e,o)=>V`
          <div class="target-row">
            <span class="target-axis">X:</span>
            <span class="target-label">${i(e.x_entity_id)}</span>
            <span class="target-axis">Y:</span>
            <span class="target-label">${i(e.y_entity_id)}</span>
            <div class="target-actions">
              <button class="small-btn" @click=${()=>{this._editingTargetIndex=o,this._editingTargetAxis="x"}}>X</button>
              <button class="small-btn" @click=${()=>{this._editingTargetIndex=o,this._editingTargetAxis="y"}}>Y</button>
              <button class="small-btn danger" @click=${()=>this._removeTarget(t,o)}>
                <ha-icon icon="mdi:close" style="--mdc-icon-size: 12px;"></ha-icon>
              </button>
            </div>
          </div>

          ${this._editingTargetIndex===o&&null!==this._editingTargetAxis?V`
            <fpb-entity-picker
              .hass=${this.hass}
              .domains=${["number"]}
              title="Select ${this._editingTargetAxis.toUpperCase()} Entity for Target ${o+1}"
              placeholder="Search number entities..."
              @entities-confirmed=${e=>{this._updateTargetEntity(t,o,this._editingTargetAxis,e.detail.entityIds[0])}}
              @picker-closed=${()=>{this._editingTargetIndex=null,this._editingTargetAxis=null}}
            ></fpb-entity-picker>
          `:q}
        `)}

        <button class="add-target-btn" @click=${()=>this._addTarget(t)}>
          + Add Target
        </button>
      </div>
    `}async _addTarget(t){const e=[...t.targets??[],{x_entity_id:"",y_entity_id:""}];await this._updateMmwave({targets:e})}async _removeTarget(t,e){const i=(t.targets??[]).filter((t,i)=>i!==e);await this._updateMmwave({targets:i})}async _updateTargetEntity(t,e,i,o){const n=[...t.targets??[]];n[e]={...n[e],["x"===i?"x_entity_id":"y_entity_id"]:o},this._editingTargetIndex=null,this._editingTargetAxis=null,await this._updateMmwave({targets:n})}}t([pt({attribute:!1})],_i.prototype,"hass",void 0),t([pt({type:String})],_i.prototype,"placementId",void 0),t([pt({type:String})],_i.prototype,"deviceType",void 0),t([gt()],_i.prototype,"_rebinding",void 0),t([gt()],_i.prototype,"_editingTargetIndex",void 0),t([gt()],_i.prototype,"_editingTargetAxis",void 0),customElements.define("fpb-device-panel",_i);class yi extends lt{constructor(){super(...arguments),this.narrow=!1,this._floorPlans=[],this._loading=!0,this._error=null,this._floorCount=1,this._haAreas=[],this._focusedRoomId=null,this._occupancyPanelTarget=null,this._devicePanelTarget=null,this._editorMode=!1,this._cleanupEffects=[]}get _isAdmin(){return this.hass?.user?.is_admin??!1}static{this.styles=r`
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

    @media (hover: none) and (pointer: coarse) {
      .edit-toggle {
        display: none;
      }
    }

  `}connectedCallback(){var t;super.connectedCallback(),Wt.value=null,Ft.value=null,Rt.value="walls",Ot.value="select",Bt.value={type:"none",ids:[]},Ut.value={x:0,y:0,width:1e3,height:800},Zt.value=10,Vt.value=!0,Ht.value=!0,jt.value=[{id:"background",name:"Background",visible:!0,locked:!1,opacity:1},{id:"structure",name:"Structure",visible:!0,locked:!1,opacity:1},{id:"furniture",name:"Furniture",visible:!0,locked:!1,opacity:1},{id:"devices",name:"Devices",visible:!0,locked:!1,opacity:1},{id:"coverage",name:"Coverage",visible:!0,locked:!1,opacity:.5},{id:"labels",name:"Labels",visible:!0,locked:!1,opacity:1},{id:"automation",name:"Automation",visible:!0,locked:!1,opacity:.7}],qt.value=[],Yt.value=[],Xt.value=[],Kt.value=[],Gt.value=new Map,Jt.value=null,Qt.value=null,te.value=null,ee.value=[],ie.value=[],oe.value=!1,Nt._reloadFloorData=null,this._applyMode(),t=()=>this._reloadCurrentFloor(),Nt._reloadFloorData=t,this._loadFloorPlans(),this._loadHaAreas(),this._cleanupEffects.push(Lt(()=>{this._focusedRoomId=Jt.value}),Lt(()=>{this._occupancyPanelTarget=Qt.value}),Lt(()=>{this._devicePanelTarget=te.value}),Lt(()=>{Ft.value,this.requestUpdate()}))}disconnectedCallback(){super.disconnectedCallback(),this._cleanupEffects.forEach(t=>t()),this._cleanupEffects=[]}_applyMode(){this._editorMode?(Rt.value="walls",ii()):(Rt.value="viewing",Ot.value="select",Bt.value={type:"none",ids:[]},Ht.value=!1,Qt.value=null,te.value=null)}_toggleEditorMode(){this._isAdmin&&(this._editorMode=!this._editorMode,this._applyMode())}async _loadHaAreas(){if(this.hass)try{const t=await this.hass.callWS({type:"config/area_registry/list"});this._haAreas=t}catch(t){console.error("Error loading HA areas:",t)}}async _reloadCurrentFloor(){if(!this.hass)return;const t=Wt.value;if(t)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=e;const i=e.find(e=>e.id===t.id);if(i){Wt.value=i;const t=Ft.value?.id;if(t){const e=i.floors.find(e=>e.id===t);e?Ft.value=e:i.floors.length>0&&(Ft.value=i.floors[0])}else i.floors.length>0&&(Ft.value=i.floors[0]);await this._loadDevicePlacements(i.id)}}catch(t){console.error("Error reloading floor data:",t)}}_detectFloorConflicts(t){const e=new Map;for(const i of t.floors){const t=Oe(i.nodes,i.edges);t.length>0&&(e.set(i.id,t),console.warn(`[inhabit] Detected ${t.length} constraint conflict(s) on floor "${i.id}":`,t.map(t=>`${t.edgeId} (${t.type})`)))}Gt.value=e}updated(t){t.has("hass")&&this.hass&&this._updateEntityStates()}async _loadFloorPlans(){if(!this.hass)return this._loading=!1,void(this._error="Home Assistant connection not available");try{this._loading=!0,this._error=null;const t=await this.hass.callWS({type:"inhabit/floor_plans/list"});this._floorPlans=t,t.length>0&&(Wt.value=t[0],t[0].floors.length>0&&(Ft.value=t[0].floors[0],Zt.value=t[0].grid_size),this._detectFloorConflicts(t[0]),await this._loadDevicePlacements(t[0].id)),this._loading=!1}catch(t){this._loading=!1,this._error=`Failed to load floor plans: ${t instanceof Error?t.message:t}`,console.error("Error loading floor plans:",t)}}async _loadDevicePlacements(t){if(this.hass)try{const[e,i,o,n,s]=await Promise.all([this.hass.callWS({type:"inhabit/lights/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/switches/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/buttons/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/others/list",floor_plan_id:t}),this.hass.callWS({type:"inhabit/mmwave/list",floor_plan_id:t})]);qt.value=e,Yt.value=i,Xt.value=o,Kt.value=n,ee.value=s}catch(t){console.error("Error loading device placements:",t)}}_updateEntityStates(){this.requestUpdate()}async _initializeFloors(t){if(this.hass)try{const e=await this.hass.callWS({type:"inhabit/floor_plans/create",name:"Home",unit:"cm",grid_size:10});e.floors=[];for(let i=0;i<t;i++){const t=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:e.id,name:`Floor ${i+1}`,level:i});e.floors.push(t)}this._floorPlans=[e],Wt.value=e,Ft.value=e.floors[0],Zt.value=e.grid_size}catch(t){console.error("Error creating floors:",t),alert(`Failed to create floors: ${t instanceof Error?t.message:t}`)}}async _addFloor(){if(!this.hass)return;const t=Wt.value;if(!t)return;const e=prompt("Floor name:",`Floor ${t.floors.length+1}`);if(e)try{const i=await this.hass.callWS({type:"inhabit/floors/add",floor_plan_id:t.id,name:e,level:t.floors.length}),o={...t,floors:[...t.floors,i]};this._floorPlans=this._floorPlans.map(e=>e.id===t.id?o:e),Wt.value=o,Ft.value=i}catch(t){console.error("Error adding floor:",t),alert(`Failed to add floor: ${t instanceof Error?t.message:t}`)}}async _deleteFloor(t){if(!this.hass)return;const e=Wt.value;if(e)try{await this.hass.callWS({type:"inhabit/floors/delete",floor_plan_id:e.id,floor_id:t});const i=e.floors.filter(e=>e.id!==t),o={...e,floors:i};this._floorPlans=this._floorPlans.map(t=>t.id===e.id?o:t),Wt.value=o,Ft.value?.id===t&&(ii(),Ft.value=i.length>0?i[0]:null)}catch(t){console.error("Error deleting floor:",t),alert(`Failed to delete floor: ${t instanceof Error?t.message:t}`)}}async _renameFloor(t,e){if(!this.hass)return;const i=Wt.value;if(i)try{await this.hass.callWS({type:"inhabit/floors/update",floor_plan_id:i.id,floor_id:t,name:e});const o=i.floors.map(i=>i.id===t?{...i,name:e}:i),n={...i,floors:o};this._floorPlans=this._floorPlans.map(t=>t.id===i.id?n:t),Wt.value=n,Ft.value?.id===t&&(Ft.value={...Ft.value,name:e})}catch(t){console.error("Error renaming floor:",t)}}_openImportExport(){const t=this.shadowRoot?.querySelector("fpb-import-export-dialog");t?.show()}async _handleFloorsImported(t){const{floorPlan:e,switchTo:i}=t.detail;this._floorPlans=this._floorPlans.map(t=>t.id===e.id?e:t),Wt.value=e,i&&(ii(),Ft.value=i),await this._loadDevicePlacements(e.id)}_handleFloorSelect(t){const e=Wt.value;if(e){const i=e.floors.find(e=>e.id===t);i&&(Ft.value?.id!==i.id&&(ii(),Jt.value=null),Ft.value=i)}}_handleFloorChange(t){const e=t.target;this._handleFloorSelect(e.value)}_handleRoomChipClick(t){null===t?(null===Jt.value&&(Jt.value="__reset__"),Jt.value=null,Qt.value=null):Jt.value===t?Jt.value=null:Jt.value=t}_renderRoomChips(){const t=Ft.value;if(!t||0===t.rooms.length)return null;const e=Wt.value?.unit,i=t=>{switch(e){case"cm":return t/1e4;case"m":default:return t;case"in":return 64516e-8*t;case"ft":return.092903*t}},o=[...t.rooms].sort((t,e)=>{const o=i(Math.abs(de(t.polygon))),n=i(Math.abs(de(e.polygon)));return o===n?t.name.localeCompare(e.name):n-o});return V`
      <div class="room-chips-bar">
        <button
          class="room-chip ${null===this._focusedRoomId?"active":""}"
          @click=${()=>this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${o.map(t=>{const e=t.ha_area_id?this._haAreas.find(e=>e.area_id===t.ha_area_id):null,i=e?.icon||"mdi:floor-plan",o=e?.name??t.name;return V`
            <button
              class="room-chip ${this._focusedRoomId===t.id?"active":""}"
              @click=${()=>this._handleRoomChipClick(t.id)}
            >
              <ha-icon icon=${i} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${o}</span>
            </button>
          `})}
      </div>
    `}_renderViewerToolbar(){const t=Wt.value,e=t?.floors??[],i=Ft.value?.id;return V`
      <div class="viewer-toolbar">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        ${e.length>1?V`
              <select
                class="floor-select"
                .value=${i??""}
                @change=${this._handleFloorChange}
              >
                ${e.map(t=>V`<option value=${t.id} ?selected=${t.id===i}>
                      ${t.name}
                    </option>`)}
              </select>
            `:null}
        <span style="flex:1"></span>
        ${this._isAdmin?V`
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
    `}render(){return this._loading?V`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plan...</p>
        </div>
      `:this._error?V`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `:0===this._floorPlans.length?this._isAdmin?V`
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
      `:V`
          <div class="empty-state">
            <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
            <h2>No Floor Plans</h2>
            <p>Ask an administrator to create a floor plan.</p>
          </div>
        `:this._editorMode?V`
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
              @exit-editor=${this._toggleEditorMode}
            ></fpb-toolbar>

            ${this._renderRoomChips()}

            <div class="canvas-container">
              <fpb-canvas .hass=${this.hass}></fpb-canvas>
              ${this._occupancyPanelTarget?V`
                <fpb-occupancy-panel
                  class="floating-panel"
                  .hass=${this.hass}
                  .targetId=${this._occupancyPanelTarget.id}
                  .targetName=${this._occupancyPanelTarget.name}
                  .targetType=${this._occupancyPanelTarget.type}
                  @close-panel=${()=>{Qt.value=null,Jt.value=null}}
                ></fpb-occupancy-panel>
              `:null}
              ${this._devicePanelTarget?V`
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
      `:V`
      ${this._renderViewerToolbar()}
      ${this._renderRoomChips()}
      <div class="canvas-container">
        <fpb-canvas .hass=${this.hass}></fpb-canvas>
      </div>
    `}}t([pt({attribute:!1})],yi.prototype,"hass",void 0),t([pt({type:Boolean})],yi.prototype,"narrow",void 0),t([gt()],yi.prototype,"_floorPlans",void 0),t([gt()],yi.prototype,"_loading",void 0),t([gt()],yi.prototype,"_error",void 0),t([gt()],yi.prototype,"_floorCount",void 0),t([gt()],yi.prototype,"_haAreas",void 0),t([gt()],yi.prototype,"_focusedRoomId",void 0),t([gt()],yi.prototype,"_occupancyPanelTarget",void 0),t([gt()],yi.prototype,"_devicePanelTarget",void 0),t([gt()],yi.prototype,"_editorMode",void 0),customElements.define("ha-floorplan-panel",yi);export{yi as HaFloorplanPanel};
