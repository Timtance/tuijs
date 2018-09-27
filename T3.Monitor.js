/*
 * Monitor For tui JavaScript Library (流程框架 )
 * @Author tuxiaohua.Tance / tanceboy@163.com
 * @Copyright 2018 tui.Tu
 * @Tel: 18016210739
 * Company: tuxiaohua
 * Date: 20180119
 * @update: v1.0.0 2018-03-06 页面加载配置解析 (L163)
 * @update: v1.0.1 2018-03-06 页面跳转统筹 (L262)
*/
var Monitor = {
    host: "http://*.*.*.*:8086/**",
    server: "http://*.*.*.*:8084",
    /**
     * 语言库
     * 默认 
     */
    Language: {
        "cn": "cn",
        "en": "en"
    },
    /**
     * 当前语言 默认 en
     */
    localflag: "cn",
    /**
     * 缓存数据
     */
    data:{},
    /**
     * 字典
     */
    dict:{},
    /**
     * tui页 - 当前显示页
     */
    pageShowId: null,
    /**
     * tui页 - 存储库
     */
    pageArr: [],
    /**
     * tui页存储库 - 添加
     */
    addTuiPage: function(tuiPage){
        this.pageArr.push(tuiPage);
    },
    /**
     * tui页存储库 - 清理
     */
    clearTuiPage:   function(){
        this.pageArr = [];
    },
    tagId:  "TUI_Monitor",
    /**
     * tui页 - 响应自定义事件
     */
    Event:  {
        Active:     "Monitor_InContainer_Active",
        PageShow:   "Monitor_InContainer_Page_Show",
        PageHide:   "Monitor_InContainer_Page_Hide",
        MessageShow:   "Monitor_InContainer_Message_Show",
        MessageHide:   "Monitor_InContainer_Message_Hide",
        PagePop:    "Monitor_Page_Pop",
        PageJump:   "Monitor_Page_Jump",
        PageEvent:  "Monitor_Page_Event",
        PageLeave:  "Monitor_Page_Leave",
        Update:     "Monitor_Page_Update",
        success:    "0",
        workType:   "Monitor_Business_Type_Event",
        workAdd:   "Monitor_Business_Type_Add_Event",
        workModify:   "Monitor_Business_Type_Modify_Event",
        typeofnull: "undefined"
    },
    /**
     * 数据池: 子容器统管
     */
    InContainerArr: [],
    /**
     * 内部:  子容器_对象
     * [参数]
     * child 控件
     * [案例]
     * var child = document.createElement("div");
     * var inContainer = new Monitor.InContainer(child);
     * [提取]
     * this.mesh 容器 | this.update 更新
     * this.data 数据 | this.pageNo 所属页面编号
     */
    InContainer: function(child){
        this.data = null;
        this.pageNo = null;

        var contain = document.createElement("div");
        contain.style.cssText = "width:100%;height:100%;position:relative;top:0px;left:0px;";
        var body = document.createElement("intance");
        body.style.cssText = "width:100%;height:100%";
        var message = document.createElement("section");
        message.style.cssText = "width:100%;height:100%;position:absolute;top:0px;left:0px;display:none";
        message.style.backgroundColor = "rgba(0,0,0,0.5);";

        body.appendChild(child);
        contain.appendChild(body);
        contain.appendChild(message);

        //更新子控件数据
        this.update = function(param){
            this.data = param;
            if( typeof child["update"] == "function"){
                child.update(param);
            }
        };

        //页面初始化
        this.default = function(){
            if( typeof child["default"] == "function") {
                child.default();
            }
        };

        //清理数据 | 页面初始化
        this.clear = function(){
            this.data = null;
            this.default();
        };

        //this.dispatchEvent = function(event){
        //    var eventType = event.type;
        //    if( Monitor.Event.hide == eventType){
        //        this.mesh.style.display = "none";
        //    }else if( Monitor.Event.show == eventType){
        //        this.mesh.style.display = "";
        //    }
        //};

        /**
         * event.type           监听类型
         * event.data.active    事件分类名称
         * @param event
         */
        var onMessageEvent = function(event){
            if(event.data == null){
                return;
            }
            var eventType = event.data.active;
            if( Monitor.Event.MessageHide == eventType){
                message.style.display = "none";
            }else if( Monitor.Event.MessageShow == eventType){
                message.style.display = "block";
            }else if( Monitor.Event.PageHide == eventType){
                this.mesh.style.display = "none";
            }else if( Monitor.Event.PageShow == eventType){
                this.mesh.style.display = "block";
            }
        };
        contain.addEventListener(Monitor.Event.Active, onMessageEvent);

        this.child = child;
        this.mesh = contain;
    },
    /**
     * 公共函数_增加: 控件子容器_统管
     * [参数]
     * child 控件
     * [案例]
     * var obj = document.createElement("div");
     * var container = Monitor.addInContainer(obj);
     */
    addInContainer: function(child, pageNo) {
        var inContainer = new Monitor.InContainer(child);
        inContainer.pageNo = pageNo;
        Monitor.InContainerArr._push(inContainer);
        return inContainer;
    },
    /**
     * 公共函数_删除: 控件子容器_统管
     * [参数]
     * child 控件
     * [案例]
     * var obj = document.createElement("div");
     * var container = Monitor.delInContainer(obj);
     */
    delInContainer: function(inContainer) {
        var index = Monitor.InContainerArr.indexof(inContainer);
        if(index >= 0){
            Monitor.InContainerArr.splice(index, 1);
        }
        return index;
    },
    /**
     * 外部脚本文件管理库
     */
    loadScriptArr: [],
    /**
     * 外部脚本文件执行函数 入库管理
     * @param url 外部脚本文件路径
     */
    loadScript: function(url){
        if(this.loadScriptArr.indexOf(url)<0){
            this.loadScriptArr.push(url);
            $.getScript(url);
        }
    },
    /**
     * 音视频容器页面元素
     */
    videoStreamTagId:  null,
    /**
     * 动态监听页面布局 实现函数队列
     */
    // doEventResizeActiveList: [],
    // /**
    //  * 添加 动态监听函数队列
    //  */
    // addEventResizeActive: function(param){
    //     if(doEventResizeActiveList.indexOf(param)<0){
    //         doEventResizeActiveList.push(param);
    //     }
    // }
    /**
     * html post发送
     * @param {url:路径,data:参数,success:function(e){成功},error:function(e){失败}}
     */
    POST:   function(param){
        // //TEST Start
        // progressbar.stop();
        // param["success"]({StatusCode: Monitor.Event.success});
        // return;
        // //TEST End
        progressbar.star();
        tui.ajax({
            url: Monitor.server + param["url"],
            data: param["data"],
            type: "POST",
            dataType: "json",
            headers: {'Token': (window['login']!=null?window['login']['Token']:"")},
            success: function (obj, status, result) {
                progressbar.stop();
                if(typeof param["success"] === "function"){param["success"](obj);}
            },
            error: function (e) {
                progressbar.stop();
                if(window["main"]){main.alert(e["responseJSON"]["Message"]);}
                if(typeof param["error"] === "function"){param["error"](e);}
            }
        });
    },
    /**
     * html get发送
     * @param {url:路径,data:参数,success:function(e){成功},error:function(e){失败}}
     */
    GET:    function(param){
        // //TEST Start
        // param["success"]({StatusCode: Monitor.Event.success});
        // return;
        // //TEST End
        param["data"]["pageSize"] = 2000;
        progressbar.star();
        tui.ajax({
            url: Monitor.server + param["url"],
            data: param["data"],
            type: "GET",
            dataType: "json",
            headers: {'Token': (window['login']!=null?window['login']['Token']:"")},
            success: function (obj, status, result) {
                progressbar.stop();
                if(typeof param["success"] === "function"){param["success"](obj);}
            },
            error: function (e) {
                progressbar.stop();
                if(window["main"]){main.alert(e["responseJSON"]["Message"]);}
                if(typeof param["error"] === "function"){param["error"](e);}
            }
        });
    }
};

window.addEventListener(Monitor.Event.PageJump, onPageJump);

/**
 * 类似:  Array.push()
 * 内部:  可以统一监控
 * @param param
 * @private
 */
Array.prototype._push = function(param) {
    if (param != null) {
        this.push(param);
    }
};

/**
 * 内部:  页面初始化_监听
 */
window.addEventListener("load", onSystemLoading, false);
var loadPageUrl;    //方便给出路径
/**
 * 内部:  页面初始化_处理
 */
function onSystemLoading(){
    document.body.innerHTML += "<tui-progressbar id='progressbar'></tui-progressbar>";
    //test//
    var loginConfig = {id:"login", type:"tui", url: Monitor.host + "/page/login/login"+(localflag === "en"?"."+localflag:"")+".tui", name:"平台登陆"};
    tui.ajax({
        dataType: "text",
        url: loginConfig.url + ((loginConfig.url.indexOf('?')<0)?"?":"&") + "tui=" + Math.random(),
        success: function (obj, status, result) {
            var loaddata = tui.loaddata;
            loaddata[loginConfig.id] = obj;
            loaddata = null;
            onProgressComplete({"data":loginConfig});

            setTimeout(function(){
                onPageJump({"data":loginConfig.id});
            },60);
            
        },
        error: function (e) {
            debugger;
        }
    });

    /**
     * 业务调整 默认出现登陆界面， 登陆后 权限加载控件 （详见login.js）
     */
    //http://127.0.0.1/tui/config/systemlogin.xml
    // if(loadPageUrl){
    //     tui.loadPage(loadPageUrl, onSystemLoaded);
    // }
    deFault();
    tui.createLoad();
}


/**
 * 内部:  页面初始化_处理
 */
function onSystemLoaded(e){
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(e.responseText, "text/xml");
    //获取文档中标签元素对象
    var pages = xmlDoc.getElementsByTagName('page');
    var page;
    for(var i=0;i<pages.length; i++){
        page = pages[i];
        if(page == null){
            continue;
        }
        var curObj = page.attributes;
        if(curObj){
            var curArr = {}, j = 0, l = curObj.length;
            if(l && l >0){
                for(;j<l;j++){
                    curArr[curObj[j].name] = page.getAttribute(curObj[j].name);
                }
            }
            j = NaN;
            l = NaN;
            if(curArr["id"] != null && curArr["url"] != null){
                tui.addLoadList(curArr);
            }
        }
        curObj = null;
        // if(name != null && id != null && url != null){
        //     tui.addLoadList({name: title, id: id, url: url});
        // }
    }
    page =null;
    xmlDoc = null;
    parser = null;

    self.addEventListener(tui.progressEvent.COMPLETE, onProgressComplete);
    self.addEventListener(tui.progressEvent.COMPLETEALL, onProgressCompleteAll);
    // self.addEventListener(Monitor.Event.PageJump, onPageJump);
    // self.addEventListener('resize', onMonitorResize);

    tui.ele(".progressBar")[0].style.display = "block";
    //创建加载控件
    // tui.createLoad();  见268 onSystemLoaded（e）
    tui.proTime = 88;
    //开始加载
    tui.loadBegin();

}

/**
 * 公共接口_重构: 页面初始化
 */
function deFault(){}

/**
 * 解析界面跳转
 * @param event
 */
function onPageJump(event){
    var area = null;
    area = document.getElementById(Monitor.tagId + event.data);
    if(area) {
       area.style.display = "block";
        area = window[event.data];
        area.dispatchEvent(Monitor.Event.PageJump, event.data);
    }
    if (Monitor.pageShowId != null && event.data != Monitor.pageShowId) {
        area = this[Monitor.tagId + Monitor.pageShowId] || document.getElementById(Monitor.tagId + Monitor.pageShowId);
        if(area){
            area.style.display = "none";
            area = window[Monitor.pageShowId];
            area.dispatchEvent(Monitor.Event.PageLeave, event.data);
        }
    }
    Monitor.pageShowId = event["data"] || null;
    area = null;
}

/**
 * 监听加载完成事件(单件)
 * @param e
 */
function onProgressComplete(e) {
    if(e["data"]){
        var mapData = e["data"];
        if(mapData["type"] == "tui"){
            requestTuiDoc(mapData["id"], mapData["from"]);
        }
        mapData = null;
    }
}

/**
 * 监听加载完成事件(全部)
 * @param e
 */
function onProgressCompleteAll(e) {
    tui.dispatchEvent(Monitor.Event.PageJump, self, "main");
    htmlCalculation();
    window.jscolor.register(); //色盘 color picker
    if(Monitor["debug"] != true){filterDebug();}
}

/**
 * 解析tui文档格式
 * @param paramId 索引id
 * @param paramId 加载域id
 */
function requestTuiDoc(paramId, paramFrom){
    var xmlHome = tui.loaddata[paramId];
    if(xmlHome) {
        var scripts = xmlHome.getElementsByTagName('scripts');
        var css = xmlHome.getElementsByTagName('css');
        var temp = xmlHome.getElementsByTagName('temp');
        var code = xmlHome.getElementsByTagName('code');
        var _curObj = null;

        _curObj = scripts["data"];
        if(_curObj && _curObj != ""){
            var jsNode = _curObj.nodeValue;
            jsNode = jsNode.getElementsByTagName('script');
            if(jsNode) {
                if (jsNode["data"].length > 1) {
                    for (var i = 0; i < jsNode["data"].length; i++) {
                        Monitor.loadScript(jsNode["data"][i].nodeValue);
                    }
                    i = null;
                } else {
                    Monitor.loadScript(jsNode["data"].nodeValue);
                }
            }
            jsNode = null;
        }

        _curObj = css["data"];
        if(_curObj && _curObj != ""){
            document.head.innerHTML += _curObj.nodeValue;
        }

        _curObj = temp["data"];
        if (_curObj && _curObj != "") {
            
            Monitor.addTuiPage(_curObj["tag"].getAttribute("id"));
            //tui.debug("==加载"+_curObj["tag"].getAttribute("id"));
            var tuiPage = document.createElement("div");
            tuiPage.setAttribute("id", Monitor.tagId + _curObj["tag"].getAttribute("id"));
            tuiPage.innerHTML = _curObj.nodeValue;

            var bodyer = null;
            if(paramFrom){
                bodyer = tui.ele("#"+paramFrom);
                // bodyer = bodyer[0];
                tuiPage.className = "tuiInPage";
                // tuiPage.setAttribute("class", "tuiInPage");
            }
            if(bodyer == null){
                bodyer = document.getElementsByTagName("body");
                bodyer = bodyer[0];
                tuiPage.className = "tuiPage";
                // tuiPage.setAttribute("class", "tuiPage");
            }
            
            bodyer.appendChild(tuiPage);
            bodyer = null;
            //bodyer.innerHTML += "<div id='"+Monitor.tagId+_curObj["tag"].getAttribute("id")+"' class='tuiPage'>"+_curObj.nodeValue+"</div>"; //('<sc'+'ript type="text/javascript" >'+ xmlHome+'</sc' + 'ript>');
        }

        _curObj = code["data"];
        if (_curObj && _curObj != "") {
            window.eval(_curObj.nodeValue);
        }
        scripts = null;
        css = null;
        temp = null;
        code = null;
        _curObj = null;
    }
    xmlHome = null;
}

// function WebSocketTest()
// {
//     if ("WebSocket" in window)
//     {
//         alert("WebSocket is supported by your Browser!");
//         // Let us open a web socket
//         var ws = new WebSocket("ws://jqrcs.tangdi.net:11886");
//         ws.onopen = function()
//         {
//             // Web Socket is connected, send data using send()
//             ws.send("Message to send");
//             alert("Message is sent...");
//         };
//         ws.onmessage = function (evt)
//         {
//             var received_msg = evt.data;
//             alert("Message is received...");
//         };
//         ws.onclose = function()
//         {
//             // websocket is closed.
//             alert("Connection is closed...");
//         };
//     }
//     else
//     {
//         // The browser doesn't support WebSocket
//         alert("WebSocket NOT supported by your Browser!");
//     }
// }
/**
 * 统一核算页面元素
 */
function htmlCalculation(){
    var eleObj, textareaEle = document.getElementsByTagName("textarea"), l = textareaEle.length;
    for(var i = 0; i<l; i++){
        eleObj = textareaEle[i];
        eleObj.style.height = eleObj.rows * 30;
    }
    eleObj = null;
    textareaEle = null;
    l = null;
}

// /**
//  * 坐席平台 SOCKET 发送消息
//  * @type    交易码
//  * @content 内容
//  */
// function postSocketMessage(type, content){
//     var login = {};
//     login.messageType = type;//"Z001";
//     login.messageContent = content;//{userName:"tui", password:"111111", version:"V1.3.37.0(20180412)"};
//     var loginStr = tui.encode(login);
//     tui.postSocketTag(loginStr);
// }

// /**
//  * 坐席平台心跳机制 - 启动
//  * @param 心跳频率
//  * @param 心跳执行函数
//  */
// function setTimeSocketTag(param, fun){
//     //{'messageTarget':'','messageSource':'null','messageContent':'心跳请求1523575948029','messageType':'6666'};
//     tui.setTimeSocketTag(function(){
//         postSocketMessage("6666","心跳请求1523575948029");
//         if(typeof fun === "function"){
//             fun();
//         }
//     }, param);
// }

// /**
//  * 坐席平台心跳机制 - 停止
//  */
// function clearTimeSocketTag(){
//     tui.stopTimeSocketTag();
// }

// function createSocketTag(){
//     tui.createSocketTag();
// }

// function onlineSocketTag(){
//     if(!tui.OnlineSocketTag){
//         tui.onlineSocketTag("**.****.net", 11886, "**.*****.net", 8430);
//     }
// }

/*
if (!Object.prototype.watch)
{
    debugger;
    Object.prototype.listener = function(prop, handler){
        debugger;
        this[prop] = handler;
        this["event"] = prop;
    };
    Object.prototype.dispatch = function(prop){
        debugger;
        var dd = this[prop];
        var ee = this[dd];
    };
    Object.prototype.watch = function(param){
        debugger;
        this.__defineSetter__(param);
        return this.dispatch("change");
    };
}
var div = document.getElementsByTagName("div")[0];
var dd = div.getAttribute("tance");
*/

/**
 * 翻译函数 ①②③④⑤⑥⑦⑧⑨⑩
 * @param {索引字段} param 
 */
function getDict(param){
    if("missing" == param){
        var localflag = Monitor["localflag"];
        var cn = Monitor.Language.cn;
        var en = Monitor.Language.en;
        var result = "";
        if(localflag == cn){
            result = "缺失步骤";
        }else if(localflag == en){
            result = "Missing step";
        }
        localflag = null;
        cn = null;
        en = null;
        return result;
    }
    return null;
}


// function onMonitorResize(e){
//     var i=0, eventResizeActiveList = Monitor.doEventResizeActiveList,l = eventResizeActiveList.length;
//     for(; i<l; i++){
//         if(typeof window[eventResizeActiveList[i]] == "function"){
//             window[eventResizeActiveList[i]]();
//         }
//     }
// }
/**
 * 过滤Debug模式
 */
function filterDebug(){
    var param, i = 0, cur, ele = tui.ele(".caption"), l = ele.length;
    var reg = /(（[^）]*）)/g;
    for(;i<l;i++){
        cur = ele[i];
        param = cur.innerText;
        if(param == "")continue;
        cur.innerHTML = param.replace(reg, "");
    }
    param = null;
    i = null;
    cur = null;
    ele = null;
    l = null;
}
