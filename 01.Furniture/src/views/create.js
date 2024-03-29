import { createItem } from '../api/data.js';
import { html } from '../lib.js';

const createTemplate = (onSubmit, errorMsg, errors) => html`
<div class="row space-top">
    <div class="col-md-12">
        <h1>Create New Furniture</h1>
    </div>
</div>
<form @submit=${onSubmit}>
    <div class="row space-top">
        <div class="col-md-4">
            ${errorMsg ? html`<div class="form-group error">${errorMsg}</div>` : null}

            <div class="form-group">
                <label class="form-control-label" for="new-make">Make</label>
                <input class=${'form-control' + (errors.make ? ' is-invalid' : '')} id="new-make" type="text"
                    name="make">
            </div>
            <div class="form-group has-success">
                <label class="form-control-label" for="new-model">Model</label>
                <input class=${'form-control' + (errors.model ? ' is-invalid' : '')} id="new-model" type="text"
                    name="model">
            </div>
            <div class="form-group has-danger">
                <label class="form-control-label" for="new-year">Year</label>
                <input class=${'form-control' + (errors.year ? ' is-invalid' : '')} id="new-year" type="number"
                    name="year">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-description">Description</label>
                <input class=${'form-control' + (errors.description ? ' is-invalid' : '')} id="new-description"
                    type="text" name="description">
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label class="form-control-label" for="new-price">Price</label>
                <input class=${'form-control' + (errors.price ? ' is-invalid' : '')} id="new-price" type="number"
                    name="price">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-image">Image</label>
                <input class="form-control" id="new-image" type="text" name="img">
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-material">Material (optional)</label>
                <input class="form-control" id="new-material" type="text" name="material">
            </div>
            <input type="submit" class="btn btn-primary" value="Create" />
        </div>
    </div>
</form>`;

export function createPage(ctx) {
    update(null, {});

    function update(errorMsg, errors) {
        ctx.render(createTemplate(onSubmit, errorMsg, errors));
    }

    async function onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const make = formData.get('make').trim();
        const model = formData.get('model').trim();
        let year = formData.get('year').trim();
        const description = formData.get('description').trim();
        let price = formData.get('price').trim();
        const img = formData.get('img').trim();
        const material = formData.get('material').trim();

        try {
            if (make == '' || model == '' || year == '' || description == '' || price == '' || img == '') {
                throw {
                    error: new Error('Please fill all mandatory fields!'),
                    errors: {}
                }
            }

            if (make.length < 4 || model.length < 4) {
                throw {
                    error: new Error('Field should be at least 4 chars'),
                    errors: {
                        make: make.length < 4,
                        model: model.length < 4
                    }
                }
            }

            year = Number(year);
            price = Number(price);

            if (year < 1950 || year > 2050) {
                throw {
                    error: new Error('Year must be between 1950 and 2050'),
                    errors: {
                        year: year < 1950 || year > 2050
                    }
                }
            }

            if (description.length < 10) {
                throw {
                    error: new Error('Description must be at least 10 chars'),
                    errors: {
                        description: description.length < 10
                    }
                }
            }

            if (price < 0) {
                throw {
                    error: new Error('Price must be a positive number'),
                    errors: {
                        price: price < 0
                    }
                }
            }

            const item = {
                make,
                model,
                year,
                description,
                price,
                img,
                material
            };

            await createItem(item);
            event.target.reset();
            ctx.page.redirect('/');
        }

        catch (err) {
            const message = err.message || err.error.message;
            update(message, err.errors);
        }
    }
}