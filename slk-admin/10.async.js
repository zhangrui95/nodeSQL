(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[10],{H8Ga:function(e,t,n){"use strict";var o=n("TqRt"),i=n("284h");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,n("IzEo");var a=o(n("bx4M"));n("+L6B");var s=o(n("2/Rp"));n("miYZ");var f=o(n("tsqr")),l=o(n("lwsE")),c=o(n("W8MJ")),r=o(n("a1gu")),u=o(n("Nsbk")),d=o(n("7W2i"));n("5NDa");var g,p,m=o(n("5rEg")),y=i(n("q1tI")),h=n("MuoO"),C=o(n("zHco")),v=n("a2tt"),S=m.default.TextArea,k=(g=(0,h.connect)(function(e){var t=e.configure,n=e.loading;return{configure:t,loading:n.effects["configure/fetchSystemConfig"]}}),g(p=function(e){function t(e){var n;return(0,l.default)(this,t),n=(0,r.default)(this,(0,u.default)(t).call(this,e)),n.state={systemConfig:""},n.handlerModifyConfig=function(e){console.log(e.target.value),n.setState({systemConfig:e.target.value})},n.handleFetchSystemConfig=function(e){var t=n.props.dispatch;console.log("handleFetchSystemConfig clicked"),t({type:"configure/fetchSystemConfig",callback:function(){"click"===e&&f.default.success("\u83b7\u53d6\u914d\u7f6e\u6210\u529f",.8)}})},n.handleSaveSystemConfig=function(){var e=n.props.dispatch;e({type:"configure/saveSystemConfig",payload:{config:JSON.parse(n.state.systemConfig)},callback:function(){f.default.success("\u914d\u7f6e\u4fdd\u5b58\u6210\u529f",.8)}})},n}return(0,d.default)(t,e),(0,c.default)(t,[{key:"componentDidMount",value:function(){console.log("componentDidMount"),this.handleFetchSystemConfig()}},{key:"componentWillReceiveProps",value:function(e){this.props.configure.systemConfig===e.configure.systemConfig&&this.props.configure.systemConfig===this.state.systemConfig||this.setState({systemConfig:v.plain(e.configure.systemConfig)})}},{key:"render",value:function(){var e=this,t=this.props.loading;return y.default.createElement(C.default,{title:"SmartLinkey \u7cfb\u7edf\u914d\u7f6e"},y.default.createElement(a.default,{bordered:!1,loading:t},y.default.createElement(S,{rows:16,value:this.state.systemConfig,onChange:function(t){e.handlerModifyConfig(t)}}),y.default.createElement(s.default,{type:"primary",onClick:this.handleFetchSystemConfig.bind(this,"click"),style:{marginLeft:"8px",marginTop:"8px"}},"\u91cd\u8f7d\u914d\u7f6e"),y.default.createElement(s.default,{type:"primary",onClick:this.handleSaveSystemConfig,style:{marginLeft:"8px",marginTop:"8px"}},"\u4fdd\u5b58\u914d\u7f6e")))}}]),t}(y.Component))||p),b=k;t.default=b}}]);