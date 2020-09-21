export default class MousePosition {
    public static x: number;
    public static y: number;

    public static init() {
        window.addEventListener('mousemove', event => {
            MousePosition.x = event.clientX;
            MousePosition.y = event.clientY;
        });
    }
}

MousePosition.init();
