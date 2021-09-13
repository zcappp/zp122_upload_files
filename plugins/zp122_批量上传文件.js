import React from "react"
import css from "../css/zp122_批量上传文件.css"

function render(ref) {
    const { exc, render, props } = ref
    if (!props.dbf) return <div>请配置表单字段</div>
    let uploaded = ref.getForm(props.dbf)
    if (!Array.isArray(uploaded)) {
        if (uploaded) warn("表单字段必须是数组")
        uploaded = []
    }
    return <React.Fragment>
        <input onChange={e => onChange(ref, e)} type="file"/>
        <button onClick={e => ref.container.firstChild.click()} className="zbtn zellipsis">{EL.upload}&nbsp;{ref.props.label || "上传文件"}</button>
        {ref.uploading.map((a, i) => <div className={"zp122U zp122_" + i} key={i}>{EL.spin}{a}<i></i></div>)}
        {uploaded.map((a, i) => <div className="zp122D" key={a + i}>
            {EL.handle}<a href={a}>{a.split("/")[a.split("/").length - 1]}</a>
            <span onClick={e => {e.stopPropagation(); exc('confirm("确定要删除吗？")', {}, () => {uploaded.splice(i, 1); ref.setForm(props.dbf, uploaded)})}}>{EL.del}</span>
        </div>)}
    </React.Fragment>
}

function onInit(ref) {
    const { id, exc, props, render } = ref
    ref.uploading = []
    exc('load("//z.zcwebs.cn/vendor/Sortable_1.13.0.js")', {}, () => {
        new Sortable(ref.container, {
            animation: 150,
            forceFallback: true,
            fallbackTolerance: 5,
            onSort: e => {
                let arr = ref.getForm(props.dbf)
                if (!Array.isArray(arr)) arr = []
                arr.splice(e.newDraggableIndex, 0, arr.splice(e.oldDraggableIndex, 1)[0])
                ref.setForm(props.dbf, arr)
            },
            handle: "#" + id + " .zp118handler",
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
                    let arr = ref.getForm(props.dbf)
                    if (!Array.isArray(arr)) arr = []
                    arr.unshift(r.url)
                    ref.setForm(props.dbf, arr)
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
        type: "text",
        label: "表单字段"
    }, {
        prop: "label",
        type: "text",
        label: "[上传文件]文本"
    }],
    render,
    onInit,
    css
})

const EL = {
    loading: <svg className="zsvg zp118loading" viewBox="0 0 1024 1024"><path d="M864 323.2c-9.6 0-22.4-6.4-25.6-16C764.8 195.2 643.2 128 512 128c-19.2 0-32-12.8-32-32s12.8-32 32-32c153.6 0 297.6 76.8 377.6 208 9.6 16 6.4 35.2-9.6 44.8-3.2 3.2-9.6 6.4-16 6.4z"/></svg>,
    upload: <svg className="zsvg zp118upload" viewBox="64 64 896 896"><path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 0 0-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"/></svg>,
    handle: <svg className="zsvg zp118handler" viewBox="0 0 1024 1024"><path d="M512 512M190.272 248.512l643.52 0 0 74.944-643.52 0 0-74.944ZM190.272 474.496l643.52 0 0 74.944-643.52 0 0-74.944ZM190.272 700.544l643.52 0 0 74.944-643.52 0 0-74.944Z"/></svg>,
    del: <svg className="zsvg zp118del" viewBox="64 64 896 896"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/></svg>
}