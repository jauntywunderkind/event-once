"use module"
import AbortException from "abort-exception"

export async function eventOnce( emitter, eventName, { capture= false, passive= true, signal}= {}){
	return new Promise( function( res, rej){
		if( signal){
			if( signal.aborted){
				// already aborted
				const err= new AbortException("Aborted at start")
				err.abortedAt= "start"
				rej( err)
				// indicate to fail now
				return true
			}
			// on abort
			signal.addEventListener( "abort", function( abort){
				// find or wrap AbortException, reject
				const err= abort instanceof AbortException? abort: new AbortException(abort)
				rej( err)
			})
		}

		if( emitter.addEventListener){
			emitter.addEventListener( eventName, res, { capture, passive, once: true })
		}else if(emitter.once){
			emitter.once( eventName, res)
		}
	})
}
export default eventOnce
