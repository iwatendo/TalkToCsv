import * as React from 'react';
import reactCSS from 'reactcss'

import ChatClientController from "../ChatClientController";
import { CompactPicker } from 'react-color';
import { Actor } from '../../../Contents/IndexedDB/Personal';

/**
 *  メッセージプロパティ
 */
interface ColorProp {
    controller: ChatClientController;
    actor: Actor;
}

export class ColorComponent extends React.Component<ColorProp, any>{

    state = {
        displayColorPicker: false,
        color: {
            r: this.getRGB("r"),
            g: this.getRGB("g"),
            b: this.getRGB("b"),
            a: '1',
        },
    };


    /**
     * 
     * @param rgb 
     */
    private getRGB(rgb: string) {
        let color = this.props.actor.chatBgColor;
        switch (rgb) {
            case "r": return parseInt(color.substr(1, 2), 16).toString();
            case "g": return parseInt(color.substr(3, 2), 16).toString();
            case "b": return parseInt(color.substr(5, 2), 16).toString();
        }
        return "0";
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };

    handleChange = (color) => {
        this.setState({ color: color.rgb });
        let actor = this.props.controller.CurrentActor;
        actor.chatBgColor = color.hex;
        this.props.controller.Model.UpdateActor(actor);
    };

    render() {

        const styles = reactCSS({
            'default': {
                color: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color} />
                </div>
                {this.state.displayColorPicker ? <div style={styles.popover}>
                    <div style={styles.cover} onClick={this.handleClose} />
                    <CompactPicker color={this.state.color} onChange={this.handleChange} />
                </div> : null}

            </div>
        )
    }
}