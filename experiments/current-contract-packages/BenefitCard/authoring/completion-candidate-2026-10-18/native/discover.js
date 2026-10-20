if(figma.fileKey!=='I3MsagXR8Tz2eZcGtIgUk8')throw new Error('FILE_MISMATCH');
const page=await figma.getNodeByIdAsync('8701:32684');if(!page||page.type!=='PAGE')throw new Error('PAGE_MISSING');
await figma.setCurrentPageAsync(page);
return {fileKey:figma.fileKey,pageId:page.id,pageName:page.name,children:page.children.map(n=>({id:n.id,type:n.type,name:n.name})),nativeMutation:false};
