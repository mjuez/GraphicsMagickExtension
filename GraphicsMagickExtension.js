/**
 * @author : gherardo varando (gherardo.varando@gmail.com)
 *
 * @license: GPL v3
 *     This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


 */

'use strict';
const gm = require('gm');
const path = require('path');
const nativeImage = require('electron').nativeImage;
const {
    dialog
} = require('electron').remote;
const {
    SplitPane,
    TaskManager,
    Task,
    ButtonsContainer,
    GuiExtension,
    Grid,
    Modal,
    util,
    gui
} = require('electrongui');
const TreeList = require('electrongui').TreeList.TreeList;

class GraphicsMagickExtension extends GuiExtension {

    constructor() {
        super({
            image: path.join(__dirname, "res", "img", "gm.png"), // not working
            menuLabel: 'GMagick',
            menuTemplate: [{
                label: 'Open image',
                click: () => {
                    this.open();
                }
            }, {
                label: 'Display image',
                click: () => {
                    this.disp();
                }
            }, {
                label: 'Convert image',
                click: () => {
                    this.convert();
                }
            }, {
                label: 'Analyze image',
                click: () => {
                    this.info();
                }
            }]
        });
        this.writableFormats = [{
            name: 'JPG',
            extensions: ['jpg']
        },
        {
            name: 'PNG',
            extensions: ['png']
        },
        {
            name: 'GIF',
            extensions: ['gif']
        },
        {
            name: 'TIF',
            extensions: ['tif', 'tiff']
        },
        {
            name: 'BMP',
            extensions: ['bmp']
        },
        {
            name: 'CMYK',
            extensions: ['cmyk']
        },
        {
            name: 'EPS',
            extensions: ['eps']
        },
        {
            name: 'Magick image file',
            extensions: ['miff']
        },
        {
            name: 'TEXT',
            extensions: ['txt']
        }
        ];
        let Rf = ['jpg', 'png', 'gif', 'tif', 'tiff', 'bmp', 'art', 'avs',
            'cals', 'cin', 'cgm', 'cmyk', 'cur', 'cut', 'dcm', 'dcx',
            'dib', 'dpx', 'emf', 'epdf', 'epi', 'eps', 'epsf', 'epsi',
            'ept', 'fax', 'fig', 'fits', 'fpx', 'gray', 'graya', 'hpgl',
            'ico', 'jbig', 'jng', 'jp2', 'jpc', 'jpeg', 'man', 'mat',
            'miff', 'mono', 'mng', 'mpeg', 'm2v', 'mpc', 'msl', 'mtv',
            'mvg', 'otb', 'p7', 'palm', 'pam', 'pbm', 'pcd', 'pcds',
            'pcx', 'pdb', 'pdf', 'pfa', 'pfb', 'pgm', 'picon', 'pict',
            'pix', 'pnm', 'ppm', 'ps', 'ps2', 'ps3', 'psd', 'ptif',
            'pwp', 'ras', 'rad', 'rgb', 'rgba', 'rla', 'rle', 'sct',
            'sfw', 'sgi', 'shtml', 'sun', 'tga', 'tim', 'ttf', 'txt',
            'uyvy', 'vicar', 'viff', 'wmf', 'wpg', 'xbm', 'xcf', 'xpm',
            'xwd', 'yuv'
        ];
        this.readableFormats = [{
            name: 'Images',
            extensions: Rf
        },
        {
            name: 'All files',
            extensions: ['*']
        }];
    }


    activate() {

        super.activate();
        this.pane = new SplitPane(util.div('', 'pane padded'));
        this.appendChild(this.pane);
        this.canvas = document.createElement('CANVAS');
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.cs = {
            size: 800,
            scale: 1,
            dx: 0,
            dy: 0
        };
        this.display = new Image();
        let cnt = this.canvas.getContext('2d');
        this.display.onload = () => {
            cnt.resetTransform();
            this.cs = {
                size: 800,
                scale: 1,
                dx: 10,
                dy: 10
            };
            cnt.clearRect(0, 0, 800, 800);
            cnt.drawImage(this.display, 10, 10);
        };
        this.pane.top.appendChild(this.canvas);
        this.appendMenu();
        gm(path.join(__dirname, "res", "img", "gm.png")).identify((err) => {
            if (err) {
                gui.notify(`Error loading GraphicsMagick extension, probably you need to install graphicsMagick in your system`);
                this.deactivate();
            } else {
                gui.notify('GraphicsMagick extensions up and running');
            }
        });
    }

    deactivate() {
        util.empty(this.element, this.element.firstChild);
        this.removeMenu();
        super.deactivate();
    }

    convert() {
        dialog.showOpenDialog({
            title: 'Convert image with GraphicsMagick',
            filters: this.readableFormats,
            properties: ['openFile']
        }, (filenames) => {
            if (filenames) {
                let file = filenames[0];
                let modal = new Modal({
                    title: 'Converter GraphicsMagick',
                    height: 'auto',
                    width: '300px'
                });
                let body = document.createElement('DIV');
                let text = document.createElement('P');
                text.innerHTML = `Analyzing ${path.basename(file)}...`;
                gm(file).format((err, value) => {
                    if (err) {
                        text.innerHTML = `${path.basename(file)} has unknown format (gm error)`;
                    } else {
                        text.innerHTML = `${path.basename(file)} has ${value} format, just click convert and choose the format of the output file`;
                    }
                });
                body.appendChild(text);
                let footer = new ButtonsContainer();
                footer.addButton({
                    text: 'Cancel',
                    action: () => {
                        modal.destroy();
                    }
                });
                footer.addButton({
                    text: 'Convert',
                    action: () => {
                        dialog.showSaveDialog({
                            title: 'Choose the output file of the conversion',
                            filters: this.writableFormats
                        },
                            (filename) => {
                                if (filename) {
                                    modal.destroy();
                                    let task = new Task('GM converter', `input: ${path.basename(file)} output: ${path.basename(filename)}`);
                                    TaskManager.addTask(task);
                                    TaskManager.tasks[task.id].domElement.additionalInfoGrid.addElement(util.div(`<strong>Input path:</strong> ${file}`), 0, 3);
                                    TaskManager.tasks[task.id].domElement.additionalInfoGrid.addElement(util.div(`<strong>Output path:</strong> ${filename}`), 1, 3);
                                    task.run();
                                    gm(file).write(filename, (err) => {
                                        if (err) {
                                            task.fail();
                                        } else {
                                            task.success();

                                        }
                                    });
                                }
                            });
                    }
                });
                modal.addBody(body);
                modal.addFooter(footer.element);
                modal.show();
            }
        });
    }

    info() {
        dialog.showOpenDialog({
            title: 'Analyze image with GraphicsMagick',
            filters: this.readableFormats,
            properties: ['openFile']
        }, (filenames) => {
            if (filenames) {
                let file = filenames[0];
                let modal = new Modal({
                    title: 'Anlayzer GraphicsMagick',
                    height: 'auto',
                    width: 'auto'
                });
                let grid = new Grid(2, 1)
                let cont = document.createElement('DIV');
                let text = document.createElement('P');
                text.innerHTML = `Analyzing ${path.basename(file)}...`
                gm(file).identify((err, value) => {
                    if (err) {
                        text.innerHTML = `${path.basename(file)} gm error`;
                    } else {
                        text.innerHTML = `${path.basename(file)}`;
                        let tree = new TreeList(cont, value, 'Info');
                    }
                });
                grid.addElement(text, 0, 0);
                grid.addElement(cont, 1, 0);
                modal.addBody(grid.element);
                modal.show();
            }
        });
    }


    disp() {
        dialog.showOpenDialog({
            title: 'Display image with GraphicsMagick',
            filters: this.readableFormats,
            properties: ['openFile']
        }, (filenames) => {
            if (filenames) {
                require('child_process').exec('gm display ' + filenames[0]);
            }
        });
    }


    open() {
        dialog.showOpenDialog({
            title: 'Open image with GraphicsMagick',
            filters: this.readableFormats,
            properties: ['openFile']
        }, (filenames) => {
            if (filenames) {
                gm(filenames[0]).toBuffer('PNG', (err, buffer) => {
                    this.buffer = buffer
                    let img = nativeImage.createFromBuffer(buffer);
                    this.display.src = img.toDataURL();
                    this.show();
                });
                gm(filenames[0]).identify((err, value) => {
                    let file = filenames[0];
                    if (err) {
                        this.pane.bottom.innerHTML = `${path.basename(file)} gm error`;
                    } else {
                        this.pane.bottom.innerHTML = `${path.basename(file)}`;
                        let tree = new TreeList(this.pane.bottom, value, 'Info');
                        this.pane.showBottom();
                    }
                });
            }
        });
    }

    zoomIn() {
        this.canvas.scale(1.2, 1.2);
    }

    zoomOut() {
        this.canvas.scale(0.8, 0.8);
    }

}

module.exports = GraphicsMagickExtension;
