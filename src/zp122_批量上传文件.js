import React from "react"
import css from "./zp122_批量上传文件.css"

function render(ref) {
    const { dbf, form } = ref.props
    let arr
    if (form) {
        ref.form = typeof form == "string" ? ref.excA(form) : form
        if (typeof ref.form == "object") arr = ref.form[dbf]
    } else if (ref.getForm) {
        arr = ref.getForm(dbf)
    }
    if (!Array.isArray(arr)) arr = []
    ref.uploaded = arr
    return <React.Fragment>
        <input onChange={e => onChange(ref, e)} type="file" multiple="multiple"/>
        {arr.map((a, i) => <div className="zp122D" key={a + i}>
            <span className="zmove zhover"/><a href={a} target="_blank">{a.split("/")[a.split("/").length - 1]}</a>
            <span onClick={e => {e.stopPropagation(); ref.exc('confirm("确定要删除吗？")', {}, () => {arr.splice(i, 1); ref.form ? ref.form[dbf] = arr : ref.setForm(dbf, arr); ref.exc('render()')})}} className="zdel zhover"/>
        </div>)}
        {ref.uploading.map((a, i) => <div className={"zp122U zp122_" + i} key={i}><span className="zloading"/><i/>{a}</div>)}
        <button onClick={e => ref.container.firstChild.click()} className="zbtn zellipsis">{Upload}<span>&nbsp;{ref.props.label || "上传文件"}</span></button>
    </React.Fragment>
}

function init(ref) {
    const { id, exc, props, render } = ref
    ref.uploading = []
    exc('load("//z.zccdn.cn/vendor/Sortable_1.13.0.js")', {}, () => {
        new Sortable(ref.container, {
            animation: 150,
            forceFallback: true,
            fallbackTolerance: 5,
            onSort: e => {
                ref.uploaded.splice(e.newDraggableIndex, 0, ref.uploaded.splice(e.oldDraggableIndex, 1)[0])
                ref.form ? ref.form[props.dbf] = ref.uploaded : ref.setForm(props.dbf, ref.uploaded)
            },
            handle: "#" + id + " .zmove",
            draggable: ".zp122D",
            dragClass: "zp122Drag",
            ghostClass: "zp122Drop"
        })
    })
}

function onChange(ref, e) {
    const { exc, render, props } = ref
    const arr = Array.from(e.target.files)
    if (!arr.length) return exc('warn("请选择文件")')
    if (arr.find(a => a.size / 1048576 > (props.max || 5))) return exc(`warn("文件太大, 请压缩至${props.max || 5}M以下")`)
    arr.forEach((file, i) => setTimeout(() => {
        ref.uploading.push(file.name)
        render()
        exc('upload(file, option)', {
            file,
            option: {
                onProgress: r => {
                    $("#" + ref.id + " .zp122_" + ref.uploading.indexOf(file.name) + " i").innerHTML = r.percent + "%"
                },
                onSuccess: r => {
                    ref.uploading.splice(ref.uploading.indexOf(file.name), 1)
                    ref.uploaded.unshift(r.url)
                    ref.form ? ref.form[props.dbf] = ref.uploaded : ref.setForm(props.dbf, ref.uploaded)
                    if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: ref.uploaded, ...r }, () => ref.exc("render()"))
                    delete ref.progress
                    delete ref.file
                    ref.render()
                },
                onError: r => {
                    exc(`alert("上传出错了", r.error)`, { r })
                    ref.uploading.splice(ref.uploading.indexOf(file.name), 1)
                    exc('render()')
                }
            }
        })
    }, 2000 * i))
}

$plugin({
    id: "zp122",
    props: [{
        prop: "dbf",
        label: "字段名",
        ph: "必填"
    }, {
        prop: "form",
        label: "字段容器",
        ph: "如不填则使用祖先节点的表单容器"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大5MB"
    }, {
        prop: "label",
        label: "[上传文件] 文本"
    }, {
        prop: "onSuccess",
        type: "exp",
        label: "上传成功表达式",
        ph: "$val"
    }],
    render,
    init,
    css
})

const Upload = <svg className="zsvg" viewBox="64 64 896 896"><path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 0 0-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"/></svg>
