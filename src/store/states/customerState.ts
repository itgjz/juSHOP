import { updateObject } from '../../utils';
import { mergeMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Api } from '../../services/Api';
import * as ActionNames from '../actions';
import { of, EMPTY } from 'rxjs';
import { ICustomerState, AppState, IDeliveryState } from '../model';
import { Actions, StoreContext, IAction } from 'ajwah-store';

export class CustomerState {
    name = 'customer';
    initialState = {};

    actionCustomerData(state: ICustomerState, { payload }: IAction) {
        return updateObject(state, payload);
    }


    effectForRegister(action$: Actions) {
        return action$.pipe(
            mergeMap(action => Api.register(action.payload).pipe(
                map(data => ({ type: ActionNames.CustomerData, payload: { customer: data.user, accessToken: data.accessToken, expires_in: data.expires_in } })),
                catchError(data => {
                    console.log(data.response)
                    return of({ type: ActionNames.CustomerData, payload: { error: data.response } })
                })
            ))
        );
    }

    effectForLogin(action$: Actions) {
        return action$.pipe(
            mergeMap(action => Api.login(action.payload).pipe(
                map(data => ({ type: ActionNames.CustomerData, payload: data })),
                catchError(data => {
                    console.log(data.response)
                    return of({ type: ActionNames.CustomerData, payload: { error: data.response } })
                })
            ))
        );
    }

    effectForUpdateCustomer(action$: Actions, store$: StoreContext<AppState>) {
        return action$.pipe(
            withLatestFrom(store$.select(state => [state.customer.accessToken, state.delivery])),
            mergeMap(([action, [token, delivery]]) => {
                const { address, city, state, zipCode } = delivery;
                const data = { address_1: address + ', ' + state, city, region: 'void 0', postal_code: zipCode.toString(), country: 'void 0', shipping_region_id: 2 }
                return Api.updateCustomerAddress(data, token).pipe(
                    tap(res => console.log(res)),
                    map(_ => EMPTY),
                    catchError(_ => EMPTY)
                )
            })
        )
    }

}