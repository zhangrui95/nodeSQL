(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[9],{rF2k:function(e,t,l){"use strict";var n=l("TqRt"),o=l("284h");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,l("IzEo");var a=n(l("bx4M"));l("+BJd");var c=n(l("mr32")),i=n(l("lwsE")),r=n(l("W8MJ")),u=n(l("a1gu")),f=n(l("Nsbk")),s=n(l("7W2i"));l("5NDa");var d,g,p=n(l("5rEg")),h=o(l("q1tI")),m=l("MuoO"),v=n(l("zHco")),b=l("dU3u"),E=l("a2tt"),C=p.default.TextArea,y=(d=(0,m.connect)(function(e){var t=e.configure,l=e.loading;return{configure:t,loading:l.effects["configure/fetchAllConfig"]}}),d(g=function(e){function t(e){var l;return(0,i.default)(this,t),l=(0,u.default)(this,(0,f.default)(t).call(this,e)),l.state={content:"",systemConfig:"",thirdConfig:"",iconConfig:""},l.handlerModifyConfig=function(e){console.log(e.target.value),l.setState({content:e.target.value})},l.handlerFetchAllConfig=function(){var e=l.props.dispatch;console.log("handlerFetchAllConfig clicked"),e({type:"configure/fetchAllConfig"}),e({type:"configure/fetchSystemConfig",callback:function(){console.log("useless")}}),e({type:"configure/fetchThirdConfig",callback:function(){console.log("useless")}}),e({type:"configure/fetchIconConfig",callback:function(){console.log("useless")}})},l}return(0,s.default)(t,e),(0,r.default)(t,[{key:"componentDidMount",value:function(){console.log("componentDidMount"),console.log(b.configUrl),this.handlerFetchAllConfig()}},{key:"componentWillReceiveProps",value:function(e){}},{key:"render",value:function(){var e=this.props.loading;return h.default.createElement(v.default,{title:"SmartLinkey API \u6982\u89c8"},h.default.createElement(a.default,{bordered:!1,loading:e},h.default.createElement("p",null,"\u4fee\u6539\u914d\u7f6e\u8bf7\u8f6c\u5230\u201c\u7cfb\u7edf\u914d\u7f6e\u201d\u6216\u201c\u5e94\u7528\u5b50\u7cfb\u7edf\u201d\u83dc\u5355"),h.default.createElement(c.default,{color:"blue"},configUrls.serve,"/api/config"),h.default.createElement(C,{disabled:!0,rows:12,value:E.plain(this.props.configure.content)}),h.default.createElement("br",null),h.default.createElement("br",null),h.default.createElement(c.default,{color:"blue"},configUrls.serve,"/api/config/system"),h.default.createElement(C,{disabled:!0,rows:12,value:E.plain(this.props.configure.systemConfig)}),h.default.createElement("br",null),h.default.createElement("br",null),h.default.createElement(c.default,{color:"blue"},configUrls.serve,"/api/config/third"),h.default.createElement(C,{disabled:!0,rows:12,value:E.plain(this.props.configure.thirdConfig)})))}}]),t}(h.Component))||g),k=y;t.default=k}}]);