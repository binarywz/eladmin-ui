/* eslint-disable no-undef */
L.drawLocal = {
    draw: {
        toolbar: {
            actions: {
                title: '取消绘制', //"Cancel drawing",
                text: '取消' //"Cancel"
            },
            finish: {
                title: '线束绘制',
                text: '结束'
            },
            undo: {
                title: '删除最后绘制的点',
                text: '删除最后的点'
            },
            buttons: {
                polyline: '画多段线',
                polygon: '画多边形', //"Draw a polygon",
                rectangle: '画矩形', //"Draw a rectangle",
                circle: '画圆形', //"Draw a circle",
                marker: '画标记',
                circlemarker: '画圆形标记'
            }
        },
        handlers: {
            circle: {
                tooltip: {
                    start: '单击并拖动以绘制圆。'
                },
                radius: '半径'
            },
            circlemarker: {
                tooltip: {
                    start: '单击地图以放置圆标记.'
                }
            },
            marker: {
                tooltip: {
                    start: '单击地图以放置标记。'
                }
            },
            polygon: {
                tooltip: {
                    start: '单击以开始绘制形状。',
                    cont: '单击以继续绘制形状。',
                    end: '单击第一个点以关闭此形状。'
                }
            },
            polyline: {
                error: '<strong>错误:</strong> 形状边缘不能交叉!',
                tooltip: {
                    start: '单击以开始绘制线。',
                    cont: '单击以继续绘制线。',
                    end: '单击最后一点以结束线。'
                }
            },
            rectangle: {
                tooltip: {
                    start: '单击并拖动以绘制矩形。'
                }
            },
            simpleshape: {
                tooltip: {
                    end: '释放鼠标完成绘图。'
                }
            }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: {
                    title: '保存更改',
                    text: '保存'
                },
                cancel: {
                    title: '取消编辑，放弃所有更改',
                    text: '取消'
                },
                clearAll: {
                    title: '清除所有层',
                    text: '清除所有'
                }
            },
            buttons: {
                edit: '编辑层',
                editDisabled: '没有要编辑的层',
                remove: '删除层',
                removeDisabled: '没有要删除的层'
            }
        },
        handlers: {
            edit: {
                tooltip: {
                    text: '拖动控制柄或标记以编辑要素。',
                    subtext: '单击“取消”撤消更改。'
                }
            },
            remove: {
                tooltip: {
                    text: '单击要删除的功能。'
                }
            }
        }
    }
};
