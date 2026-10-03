import * as Service from './servicesService';
import type { FastifyReply, FastifyRequest } from 'fastify';
import * as Schema from './servicesSchema';



export async function createService(req: FastifyRequest, res: FastifyReply) {

    const serviceCreated = await Service.createService(req.body as Schema.ServicesBarberCreateType)
    res.status(201).send({status: "Serviço criado com sucesso", data: serviceCreated})
}

export async function updateService(req: FastifyRequest, res: FastifyReply) {

    const {serviceId} = req.params as { serviceId: string };
    const serviceUpdated = await Service.updateService(serviceId, req.body as Schema.ServicesBarberUpdateType)
    res.status(200).send({status: "Serviço atualizado com sucesso", data: serviceUpdated})
}

export async function searchServices(req: FastifyRequest, res: FastifyReply) {

    const { barberShopId} = req.params as { barberShopId?: string };
    const { name, serviceId } = req.query as { name?: string, serviceId?: string };

    const serviceFound = await Service.searchServices(serviceId, name, barberShopId)
    res.status(200).send({status: "Serviços encontrados com sucesso", data: serviceFound})
}

export async function deleteService(req: FastifyRequest, res: FastifyReply) {

    const { serviceId } = req.params as { serviceId: string };
    const serviceDeleted = await Service.deleteService(serviceId)
    res.status(200).send({status: "Serviço deletado com sucesso", data: serviceDeleted})
}

export async function listServices(req: FastifyRequest, res: FastifyReply) {
    const { barberShopId } = req.params as { barberShopId: string };
    const listParams = req.query as { page?: number, limit?: number, isActive?: boolean };

    const servicesList = await Service.listServices(listParams, barberShopId)
    res.status(200).send({status: "Serviços listados com sucesso", data: servicesList})
}