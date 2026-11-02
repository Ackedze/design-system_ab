// Public synthetic pilot. No real user fields, captures, manuals or handlers.
module.exports=()=>({
    schemaVersion:'apollo.screen-spec.static-content.v1-draft',status:'draft',executionAllowed:false,
    id:'synthetic-pilot',platform:'desktop',viewport:{width:1600,height:900},root:'synthetic-content',
    nodes:[
        {kind:'component',id:'synthetic-content',mappingId:'arui-private.corporate-content.desktop',props:{},slots:{body:['synthetic-group']}},
        {kind:'component',id:'synthetic-group',mappingId:'arui-private.buttons-group.desktop',props:{size:'56'},slots:{},
            staticActions:{port:'button-label',items:[
                {id:'synthetic-a',label:'Synthetic Alpha',view:'primary',disabled:false,loading:false},
                {id:'synthetic-b',label:'Synthetic Beta',view:'secondary',disabled:true,loading:false},
            ],displayOrder:['synthetic-a','synthetic-b'],priorityOrder:['synthetic-a','synthetic-b']}},
    ],states:{initial:'default',values:['default']},unresolved:[],
});
