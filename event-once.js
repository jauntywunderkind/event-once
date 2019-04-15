"use module"
import AbortException from "abort-exception"

export async function eventOnce( emitter, eventName, { capture, passive= true, signal}= {}){
	return new Promise( function( res, rej){

		if( signal&& signal.aborted){
			// already aborted
			const err= new AbortException("Aborted at start")
			err.abortedAt= "start"
			rej( err)
			// indicate to fail now
			return true
		}

		let cleanup= function(){
			if( emitter&& emitter.removeEventListener&& resAndCleanup){
				emitter.removeEventListener( eventName, resAndCleanup, capture? { capture}: undefined)
			}
			if( emitter&& emitter.removeListener&& resAndCleanup){
				emitter.removeListener( eventName, resAndCleanup)
			}
			if( aborter&& signal){
				if( signal.removeEventListener){
					signal.removeEventListener( "abort", aborter, { passive: true})
				}else if( signal.removeListener){
					signal.removeListener( "abort", aborter)
				}
			}
			emitter= null
			signal= null
			res= null
			rej= null
			cleanup= null
			aborter= null
			resAndCleanup= null
		}

		let aborter
		if( signal){
			// on abort
			aborter= function aborter( abort){
				// find or wrap AbortException, reject
				const
				  err= abort instanceof AbortException? abort: new AbortException(abort),
				  _rej= rej
				if( cleanup){
					cleanup()
				}
				if( _rej){
					_rej( err)
				}
			}
			if( signal.addEventListener){
				signal.addEventListener( "abort", aborter, { passive: true, once: true})
			}else if( signal.once){
				signal.once( "abort", aborter)
			}
		}

		let resAndCleanup= function( val){
			const _res= res
			if( cleanup){
				cleanup()
			}
			if( _res){
				_res( val)
			}
		}
		if( emitter.addEventListener){
			emitter.addEventListener( eventName, resAndCleanup, { capture, passive, once: true })
		}else if(emitter.once){
			emitter.once( eventName, resAndCleanup)
		}
	})
}
export default eventOnce
