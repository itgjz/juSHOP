import { withLatestFrom, mergeMap, map, debounceTime, tap, catchError } from 'rxjs/operators'
import { Api } from '../../services/Api'
import * as ActionNames from '../actions'
import { EMPTY, of } from 'rxjs';


export class CartEffect {

    effectForAddToCart(action$, store$) {
        return action$.pipe(
            withLatestFrom(store$.select('cart')),
            mergeMap(([action, cart]) => {
                if (cart.cartId) {
                    return Api.addToCart({ cart_id: cart.cartId, product_id: action.payload.product_id, attributes: `${action.payload.color} ${action.payload.size}` }).pipe(
                        map(data => ({ type: ActionNames.CartAddData, payload: data, thumbnail: action.payload.thumbnail }))
                    )
                }

                return Api.getCartId().pipe(
                    mergeMap(({ cart_id }) => Api.addToCart({ cart_id, product_id: action.payload.product_id, attributes: `${action.payload.color} ${action.payload.size}` }).pipe(
                        map(data => {
                            cart.cartId = cart_id;
                            return { type: ActionNames.CartAddData, payload: data, thumbnail: action.payload.thumbnail }
                        })
                    ))
                )
            })
        )
    }

    effectForRemoveItem(action$) {
        return action$.pipe(
            mergeMap(action => Api.removeCartItem(action.payload.item_id).pipe(
                map(res => EMPTY)
            ))
        )
    }

    effectForChangeQuantity(action$) {
        return action$.pipe(
            debounceTime(2),
            mergeMap(({ payload }) => Api.updateCartItem(payload.item).pipe(
                tap(res => console.log(res)),
                map(res => EMPTY)
            ))
        )
    }

    effectForGetCartItems(action$) {
        return action$.pipe(
            mergeMap(action => Api.getCartItems(action.payload).pipe(
                map(res => ({ type: ActionNames.AllCartItems, payload: res }))
            ))
        )
    }

    effectForMakeOrders(action$, store$) {
        return action$.pipe(
            withLatestFrom(store$.select(state => [state.cart.cartId, state.cart.grandTotal, state.customer.accessToken, state.customer.user])),
            mergeMap(([action, [cart_id, gtotal, token, { customer_id }]]) => {
                let _order_id = 0;
                return Api.makeOrders({ cart_id, customer_id, shipping_id: 2, tax_id: 2 }, token).pipe(
                    tap(res => console.log('order: ', res)),
                    mergeMap(({ orderId }) => {
                        _order_id = orderId;
                        const data = {
                            stripeToken: 'tok_1EOOKq2eZvKYlo2CnY7WPNiw',
                            order_id: orderId,
                            description: 'generated by jasim khan',
                            amount: Math.round(gtotal)
                        };
                        return Api.makeCharge(data, token).pipe(
                            tap(res => console.log('Charge:', res)),
                            map(res => ({ type: ActionNames.OrderId, payload: orderId, charge: res }))
                        )
                    }),
                    //timeout(2500),
                    catchError(data => {
                        console.log(data.response)
                        return of({ type: ActionNames.OrderId, payload: _order_id, charge: data.response })
                    })
                )
            })
        )
    }
}