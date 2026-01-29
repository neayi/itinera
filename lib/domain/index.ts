/**
 * Domain models for Itinera
 * 
 * Architecture en couches avec séparation des responsabilités :
 * - Entity : Règles métier pures
 * - Repository : Interface d'accès aux données
 * - Repository.MySQL : Implémentation MySQL
 * - Service : Orchestration métier
 */

// System domain
export * from './system';

// WikiPages domain
export * from './wiki-pages';

// ItineraParams domain
export * from './itinera-params';

// User domain
export * from './user';
