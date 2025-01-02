import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, PlusCircle } from 'react-bootstrap-icons'

function CreateNewProjectCard() {
    return (
        <div className="col-12 col-md-6 col-lg-3 col-sm-6 col-xs-6 px-3 mb-5">
            <Link to="/projects/create" className="h-100 py-5 rounded-sm card shadow-sm bg-white d-flex align-items-center justify-content-center hover pointer w-100 d-flex">
                <h1 className='txt-primary'>
                    <PlusCircle />
                </h1>
                <span className='text-muted'>Add project</span>
            </Link>
        </div>
    )
}

export default CreateNewProjectCard