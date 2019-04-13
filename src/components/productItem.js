import React, { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import { ProductDetails } from './productDetails'


export function ProductItem(props) {
    const { product } = props;
    let [visible, setVisibleState] = useState(false)

    function hide() {
        setVisibleState(false)
    }
    function show() {
        setVisibleState(true)
    }
    return (
        <React.Fragment>
            <Card>
                <div style={{ textAlign: 'center' }}>
                    <img alt="example" src={'https://backendapi.turing.com/images/products/' + product.thumbnail} />
                    <h3>{product.name}</h3>
                </div>
                <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                    <span style={{ textDecoration: 'line-through', float: 'left' }}>{product.discounted_price === '0.00' ? null : '$' + product.price}</span>
                    <Button onClick={show} type="danger" style={{ float: 'right' }}>{product.discounted_price === '0.00' ? '$' + product.price : '$' + product.discounted_price}</Button>
                </div>
                <div style={{ clear: 'both' }}></div>

                <p style={{ minHeight: 40 }}>{product.description.substring(0, 50) + '...'}</p>

            </Card >
            <Modal visible={visible} onCancel={hide} footer={null}>
                <ProductDetails hide={hide} product={product} />
            </Modal>
        </React.Fragment>
    );
}