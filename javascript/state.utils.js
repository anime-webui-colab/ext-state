window.state = window.state || {};
state = window.state;

state.utils = {
    triggerEvent: function triggerEvent(element, event) {
        if (! element) {
            return;
        }
        element.dispatchEvent(new Event(event.trim()));
        return element;
    },
    triggerMouseEvent: function triggerMouseEvent(element, event) {
        if (! element) {
            return;
        }
        event = event || 'click';
        element.dispatchEvent(new MouseEvent(event, {
            view: window,
            bubbles: true,
            cancelable: true,
        }));
        return element;
    },
    setValue: function setValue(element, value, event) {
        switch (element.type) {
            case 'checkbox':
                element.checked = value === 'true';
                this.triggerEvent(element, event);
                break;
            case 'radio':
                if (element.value === value) {
                    element.checked = true;
                    this.triggerEvent(element, event);
                } else {
                    element.checked = false;
                }
                break;
            default:
                element.value = value;
                this.triggerEvent(element, event);
        }
    },
    onContentChange: function onContentChange(targetNode, func) {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    func(targetNode);
                }
            }
        });
        observer.observe(targetNode, {
            childList: true,
            characterData: true,
            subtree: true
        });
    },
    handleSelect: function handleSelect(select, id, store) {
        try {
            let value = store.get(id);

            if (value) {

                let input = select.querySelector('input');
                state.utils.triggerMouseEvent(input, 'focus');

                setTimeout(() => {
                    let items = Array.from(select.querySelectorAll('ul li'));
                    items.forEach(li => {
                        if (li.lastChild.wholeText.trim() === value) {
                            state.utils.triggerMouseEvent(li, 'mousedown');
                            return false;
                        }
                    });
                    state.utils.triggerMouseEvent(input, 'blur');
                }, 100);
            }

            setTimeout(() => {
                state.utils.onContentChange(select, function (el) {
                    const selected = el.querySelector('span.single-select');
                    if (selected) {
                        store.set(id, selected.textContent);
                    }
                });
            }, 150);
        } catch (error) {
            console.error('[state]: Error:', error);
        }
    },
    handleMultipleSelect: function handleMultipleSelect(select, id, store) {
        try {
            let value = store.get(id);

            if (value) {

                value = value.split(',').reverse();

                if (value.length) {

                    let input = select.querySelector('input');

                    let selectOption = function () {

                        if (! value.length) {
                            state.utils.triggerMouseEvent(input, 'blur');
                            return;
                        }

                        let option = value.pop();
                        state.utils.triggerMouseEvent(input, 'focus');

                        setTimeout(() => {
                            let items = Array.from(select.querySelectorAll('ul li'));
                            items.forEach(li => {
                                if (li.lastChild.wholeText.trim() === option) {
                                    state.utils.triggerMouseEvent(li, 'mousedown');
                                    return false;
                                }
                            });
                            setTimeout(selectOption, 100);
                        }, 100);
                    }
                    selectOption();
                }
            }
            state.utils.onContentChange(select, function (el) {
                const selected = Array.from(el.querySelectorAll('.token > span')).map(item => item.textContent);
                store.set(id, selected);
            });
        } catch (error) {
            console.error('[state]: Error:', error);
        }
    },
    txtToId: function txtToId(txt) {
        return txt.split(' ').join('-').toLowerCase();
    },
    callXTimes: function callXTimes(func, times) {
        let called = 0;
        return function() {
            if (called < times) {
                called++;
                return func.apply(this);
            }
        }
    },
    debounce: function debounce(func, delay) {
        let lastCallTime = 0;
        return function() {
            const currentCallTime = new Date().getTime();
            if (currentCallTime - lastCallTime > delay) {
                lastCallTime = currentCallTime;
                func.apply(this, arguments);
            }
        }
    },
    onNextUiUpdates: function (func) {
        // brute force this to to ensure that the method is called after next few updates
        onUiUpdate(this.callXTimes(function () { setTimeout(func, 5); }, 150));
    }
};

state.utils.html = {
    setStyle: function setStyle(elements, style) {
        if (elements instanceof NodeList) {
            elements = Array.from(elements);
        } else if (elements instanceof Node){
            elements = [elements];
        } else {
            return;
        }
        elements.forEach(element => {
            for (let key in style) {
                if (style.hasOwnProperty(key)) {
                    element.style[key] = style[key];
                }
            }
        });
    },
    createButton: function createButton(text, onclick) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.onclick = onclick || function () {};
        btn.className = 'gr-button gr-button-lg gr-button-primary';
        return btn;
    }
};
