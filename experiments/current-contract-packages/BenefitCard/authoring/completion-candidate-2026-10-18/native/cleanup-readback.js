const request=__APOLLO_CLEANUP_REQUEST__;
if(figma.fileKey!==request.fileKey)throw new Error('FILE_MISMATCH');
const page=await figma.getNodeByIdAsync(request.pageId);if(!page||page.type!=='PAGE')throw new Error('PAGE_MISSING');
await figma.setCurrentPageAsync(page);
const ownIds=[request.containerId,...request.createdRootIds].filter(Boolean);
const owned=await Promise.all(ownIds.map(async id=>({id,present:Boolean(await figma.getNodeByIdAsync(id))})));
const existing=new Set(page.children.map(n=>n.id));const missingPreexisting=request.beforePageNodeIds.filter(id=>!existing.has(id));
return {status:owned.every(x=>!x.present)&&missingPreexisting.length===0?'PASS':'STOP',batchId:request.batchId,ownedRootDispositions:owned,missingPreexistingPageNodeIds:missingPreexisting,foreignPreserved:true,readOnly:true};
