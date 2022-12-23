import {JSDOM} from 'jsdom'
import {select} from 'd3-selection'
import * as fs from 'fs'
import cohost from 'cohost'
import {apdate} from 'journalize'

const WIDTH = 800;

(() => {
    let colors = fs.readFileSync('data/rgb.txt',{encoding:'utf-8'})
    colors = colors.split('\n').map(c => {
        return c.split(',')
    })
    let adjectives = fs.readFileSync('data/adjectives.txt',{encoding:'utf-8'})
    adjectives = adjectives.split('\r\n')

    const layout = [
        [3,2,5],
        [4,2,4],
        [2,2,6],
        [3,1,6],
        [4,1,5]
    ][Math.floor(Math.random(5)) * 5]

    let scheme = layout.map(d => {
        return {
            height:WIDTH/10*d,
            color:colors[Math.floor(Math.random(colors.length) * colors.length)],
            adjective:adjectives[Math.floor(Math.random(adjectives.length) * adjectives.length)]
        }
    })

    const dom = new JSDOM(`
    <div class="color-names"></div>
    <div class="color-container"></div>
    `,{
        runScripts:'outside-only',
        pretendToBeVisual:true
    })

    const doc = select(dom.window.document)
    const svg = doc.select('.color-container')
        .append('svg')
        .attr('width',WIDTH)
        .attr('height',WIDTH)

    const nameContainer = doc.select('.color-names')
    
    for(let i = 0; i < 3; i++){
        svg.append('rect')
            .attr('y',() => {
                switch(i){
                    case 0:{
                        return 0
                    }
                    case 1:{
                        return scheme[0].height
                    }
                    case 2:{
                        return scheme[0].height + scheme[1].height
                    }
                }
            })
            .attr('width',800)
            .attr('height',scheme[i].height)
            .attr('fill',scheme[i].color[1])
    }

    const rotation = Math.floor(Math.random(3)*3)
    if([1,2].includes(rotation)){
        scheme = scheme.reverse()
    }
    for(let i = 0; i < 3; i ++){
        let details = nameContainer.append('details')

        details.append('summary')
            .html(`${scheme[i].adjective} ${scheme[i].color[0]}`)

        details.append('span')
            .style('font-family','monospace')
            .html(scheme[i].color[1])
    }

    const XMLSerializer = dom.window.XMLSerializer
    let serializer = new XMLSerializer()

    let dataURL = `url("data:image/svg+xml;base64,${dom.window.btoa(serializer.serializeToString(dom.window.document.querySelector('svg')))}")`
    doc.select('.color-container')
        .style('width','100%')
        .style('max-width','800px')
        .style('padding-bottom','100%')
        .style('margin-top','1rem')
        .style('background-image',dataURL)
        .style('background-size','contain')
        .style('background-repeat','no-repeat')
        .style('transform',`rotate(${rotation * 90}deg)`)

    svg.remove()
    
    const chost = dom.window.document.body.innerHTML;

    (async () => {
        let user = new cohost.User()
        await user.login(process.env.COHOST_USER,process.env.COHOST_PW)
        const proj = await user.getProjects()
        const account = proj.filter(d => d.handle === 'colorschemez')[0]

        await cohost.Post.create(account,{
            postState: 1,
            headline:apdate(new Date()),
            adultContent:chost.includes['fuck','shit','sex'] ? true : false,
            blocks:[
                {
                    type:'markdown',
                    markdown:{
                        content:chost
                    }
                }
            ],
            cws:[],
            tags:['bot']
        })
    })()

})();